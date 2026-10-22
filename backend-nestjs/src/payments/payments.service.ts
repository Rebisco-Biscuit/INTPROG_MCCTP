import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentListQueryDto } from './dto/payment-query.dto';
import { generateOrNumber } from './or-number';

const VALID_REASONS = [
  'PROCESSING_FEE',
  'UNIFORM_ID_FEE',
  'ASSESSMENT_DEPOSIT',
  'EXTERNAL_FEES',
] as const;

const VALID_METHODS = ['CASH', 'GCASH', 'BANK_TRANSFER', 'CHECK'] as const;

const PAYMENT_METHOD_LABELS: Record<(typeof VALID_METHODS)[number], string> = {
  CASH: 'Cash',
  GCASH: 'GCash',
  BANK_TRANSFER: 'Bank Transfer',
  CHECK: 'Check',
};

const PAYMENT_REASON_LABELS: Record<(typeof VALID_REASONS)[number], string> = {
  PROCESSING_FEE: 'Processing Fee',
  UNIFORM_ID_FEE: 'Uniform/ID Fee',
  ASSESSMENT_DEPOSIT: 'Assessment Deposit',
  EXTERNAL_FEES: 'External Fees',
};

const ALLOWED_SORTS = new Set(['payment_date', 'amount', 'or_number']);

type ReceiptUser = {
  id: string;
  first_name: string;
  last_name: string;
  system_id: string | null;
};

type PaymentReceiptRecord = {
  id: string;
  or_number: string;
  payment_date: Date | null;
  amount: Prisma.Decimal;
  base_fee: Prisma.Decimal;
  payment_method: string;
  reason_of_dues: string;
  remarks: string | null;
  confirmed_by: string | null;
  created_at: Date;
  users?: ReceiptUser | null;
  enrollments?: {
    trainee?: { users?: ReceiptUser | null } | null;
    batch?: {
      id: string;
      batch_name: string;
      programs?: { id: string; name: string } | null;
    } | null;
  } | null;
};

type PaymentListRecord = {
  id: string;
  or_number: string;
  payment_date: Date | null;
  amount: Prisma.Decimal;
  reason_of_dues: string;
  users?: Pick<ReceiptUser, 'first_name' | 'last_name'> | null;
  enrollments?: {
    trainee?: {
      users?: Pick<ReceiptUser, 'first_name' | 'last_name'> | null;
    } | null;
    batch?: { programs?: { name: string } | null } | null;
  } | null;
};

function money(value: Prisma.Decimal | null | undefined): string {
  return value?.toFixed(2) ?? '0.00';
}

function isoDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getList(query: PaymentListQueryDto) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));
    const search = String(query.search ?? '').trim();
    const reasons = query.reason ?? [];
    const paymentMethod = query.paymentMethod ?? [];
    const programId = query.programId;
    const batchId = query.batchId;
    const confirmedBy = query.confirmedBy;
    const fromDate = query.fromDate ? new Date(query.fromDate) : null;
    const toDate = query.toDate ? new Date(query.toDate) : null;
    if (fromDate && toDate && fromDate > toDate) {
      throw new BadRequestException('From date must be on or before to date');
    }
    const sortBy =
      query.sortBy && ALLOWED_SORTS.has(query.sortBy)
        ? query.sortBy
        : 'payment_date';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const where: Prisma.official_receiptsWhereInput = {
      AND: [
        reasons.length ? { reason_of_dues: { in: reasons as any[] } } : {},
        paymentMethod.length
          ? { payment_method: { in: paymentMethod as any[] } }
          : {},
        programId
          ? {
              enrollments: { is: { batch: { is: { program_id: programId } } } },
            }
          : {},
        batchId ? { enrollments: { is: { batch_id: batchId } } } : {},
        confirmedBy ? { confirmed_by: confirmedBy } : {},
        fromDate || toDate
          ? {
              payment_date: {
                ...(fromDate ? { gte: fromDate } : {}),
                ...(toDate
                  ? {
                      lte: new Date(
                        `${toDate.toISOString().slice(0, 10)}T23:59:59.999Z`,
                      ),
                    }
                  : {}),
              },
            }
          : {},
      ],
    };

    if (search) {
      const searchTerms = search.split(/\s+/).filter(Boolean);
      where.OR = [
        { or_number: { contains: search, mode: 'insensitive' } },
        {
          AND: searchTerms.map((term) => ({
            enrollments: {
              is: {
                trainee: {
                  is: {
                    users: {
                      is: {
                        OR: [
                          {
                            first_name: { contains: term, mode: 'insensitive' },
                          },
                          {
                            last_name: { contains: term, mode: 'insensitive' },
                          },
                          {
                            system_id: { contains: term, mode: 'insensitive' },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          })),
        },
      ];
    }

    const [items, total, totals] = await Promise.all([
      this.prisma.official_receipts.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        select: {
          id: true,
          or_number: true,
          amount: true,
          payment_date: true,
          reason_of_dues: true,
          enrollments: {
            select: {
              trainee: {
                select: {
                  users: {
                    select: {
                      first_name: true,
                      last_name: true,
                    },
                  },
                },
              },
              batch: {
                select: {
                  programs: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          users: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      }),
      this.prisma.official_receipts.count({ where }),
      this.prisma.official_receipts.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    return {
      data: items.map((item) => this.serializeListRow(item)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      totals: {
        count: total,
        totalAmount: totals._sum.amount ? money(totals._sum.amount) : '0.00',
      },
    };
  }

  async getDetail(id: string) {
    const receipt = await this.prisma.official_receipts.findUnique({
      where: { id },
      select: {
        id: true,
        or_number: true,
        base_fee: true,
        amount: true,
        payment_date: true,
        payment_method: true,
        reason_of_dues: true,
        remarks: true,
        confirmed_by: true,
        created_at: true,
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            system_id: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            trainee: {
              select: {
                id: true,
                users: {
                  select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    system_id: true,
                  },
                },
              },
            },
            batch: {
              select: {
                id: true,
                batch_name: true,
                programs: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    return this.serializeDetail(receipt);
  }

  async getTraineeOptions(search: string) {
    const q = String(search ?? '').trim();
    if (!q) {
      return [];
    }
    const searchTerms = q.split(/\s+/).filter(Boolean);

    const trainees = await this.prisma.trainee.findMany({
      where: {
        AND: [
          { enrollments: { some: { enrollment_status: 'ENROLLED' } } },
          ...searchTerms.map((term) => ({
            OR: [
              {
                users: {
                  is: {
                    first_name: {
                      contains: term,
                      mode: 'insensitive' as const,
                    },
                  },
                },
              },
              {
                users: {
                  is: {
                    last_name: { contains: term, mode: 'insensitive' as const },
                  },
                },
              },
              {
                users: {
                  is: {
                    system_id: { contains: term, mode: 'insensitive' as const },
                  },
                },
              },
            ],
          })),
        ],
      },
      orderBy: [
        { users: { last_name: 'asc' } },
        { users: { first_name: 'asc' } },
      ],
      select: {
        id: true,
        users: {
          select: {
            first_name: true,
            last_name: true,
            system_id: true,
          },
        },
        enrollments: {
          where: { enrollment_status: 'ENROLLED' },
          select: {
            id: true,
            batch: {
              select: {
                batch_name: true,
                programs: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      take: 10,
    });

    return trainees
      .filter((trainee) => trainee.users)
      .map((trainee) => ({
        id: trainee.id,
        label:
          `${trainee.users?.first_name ?? ''} ${trainee.users?.last_name ?? ''}`.trim(),
        system_id: trainee.users?.system_id ?? null,
        enrollments: trainee.enrollments.map((enrollment) => ({
          id: enrollment.id,
          batch_name: enrollment.batch?.batch_name ?? null,
          program_name: enrollment.batch?.programs?.name ?? null,
        })),
      }));
  }

  async getFilterOptions() {
    const [programs, batches, staff, paymentMethods, paymentReasons] =
      await Promise.all([
        this.prisma.programs.findMany({
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        }),
        this.prisma.batch.findMany({
          select: { id: true, batch_name: true, program_id: true },
          orderBy: { batch_name: 'asc' },
        }),
        this.prisma.users.findMany({
          where: { role: { in: ['ADMIN', 'REGISTRAR'] } },
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
          orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }],
        }),
        Promise.resolve(VALID_METHODS),
        Promise.resolve(VALID_REASONS),
      ]);

    return {
      programs,
      batches,
      staff: staff.map((user) => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
      })),
      paymentMethods: paymentMethods.map((method) => ({
        value: method,
        label: PAYMENT_METHOD_LABELS[method],
      })),
      paymentReasons: paymentReasons.map((reason) => ({
        value: reason,
        label: PAYMENT_REASON_LABELS[reason],
      })),
    };
  }

  async createPayment(dto: CreatePaymentDto, confirmedBy: string) {
    const paymentDate = new Date(dto.payment_date);
    if (Number.isNaN(paymentDate.getTime())) {
      throw new BadRequestException('Payment date is invalid');
    }

    if (Number(dto.amount) <= 0 || Number(dto.base_fee) <= 0) {
      throw new BadRequestException(
        'Amount and base fee must be greater than zero',
      );
    }

    if (!VALID_REASONS.some((reason) => reason === dto.reason_of_dues)) {
      throw new BadRequestException('Invalid payment reason');
    }

    if (!VALID_METHODS.includes(dto.payment_method)) {
      throw new BadRequestException('Invalid payment method');
    }

    const idempotencyKey = String(dto.idempotency_key ?? '').trim();
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency key is required');
    }

    const existing = await this.prisma.official_receipts.findUnique({
      where: { idempotency_key: idempotencyKey },
      select: { id: true },
    });

    if (existing) {
      return this.getDetail(existing.id);
    }

    const enrollment = await this.prisma.enrollments.findUnique({
      where: { id: dto.enrollment_id },
      select: {
        id: true,
        trainee_id: true,
        batch_id: true,
        enrollment_status: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Selected enrollment was not found');
    }
    if (enrollment.enrollment_status !== 'ENROLLED') {
      throw new BadRequestException(
        'Payments can only be recorded for enrolled trainees',
      );
    }

    try {
      const receipt = await this.prisma.$transaction(async (tx) => {
        const orNumber = await generateOrNumber(tx, paymentDate);
        const receipt = await tx.official_receipts.create({
          data: {
            enrollment_id: dto.enrollment_id,
            or_number: orNumber,
            idempotency_key: idempotencyKey,
            base_fee: String(dto.base_fee),
            amount: String(dto.amount),
            payment_date: paymentDate,
            payment_method: dto.payment_method,
            reason_of_dues: dto.reason_of_dues,
            remarks: dto.remarks ?? null,
            confirmed_by: confirmedBy,
          },
        });

        return receipt;
      });
      return this.getDetail(receipt.id);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const duplicate = await this.prisma.official_receipts.findUnique({
          where: { idempotency_key: idempotencyKey },
          select: { id: true },
        });
        if (duplicate) return this.getDetail(duplicate.id);
        throw new ConflictException(
          'This payment appears to have already been recorded',
        );
      }
      throw error;
    }
  }

  private buildOrderBy(
    sortBy: string,
    sortOrder: 'asc' | 'desc',
  ):
    | Prisma.official_receiptsOrderByWithRelationInput
    | Prisma.official_receiptsOrderByWithRelationInput[] {
    const direction = sortOrder === 'asc' ? 'asc' : 'desc';

    if (sortBy === 'or_number') {
      return { or_number: direction };
    }

    if (sortBy === 'amount') {
      return [{ amount: direction }, { created_at: 'desc' }, { id: 'desc' }];
    }

    return [
      { payment_date: direction },
      { created_at: 'desc' },
      { id: 'desc' },
    ];
  }

  private serializeListRow(item: PaymentListRecord) {
    const traineeUser = item.enrollments?.trainee?.users ?? null;
    const confirmingUser = item.users ?? null;
    const batch = item.enrollments?.batch ?? null;
    const program = batch?.programs ?? null;

    return {
      id: item.id,
      or_number: item.or_number,
      payment_date: isoDate(item.payment_date),
      amount: money(item.amount),
      reason_of_dues: item.reason_of_dues,
      confirmed_by_name: confirmingUser
        ? `${confirmingUser.first_name ?? ''} ${confirmingUser.last_name ?? ''}`.trim()
        : null,
      trainee: traineeUser
        ? {
            first_name: traineeUser.first_name,
            last_name: traineeUser.last_name,
          }
        : null,
      program: program
        ? {
            name: program.name,
          }
        : null,
    };
  }

  private serializeDetail(item: PaymentReceiptRecord) {
    const traineeUser = item.enrollments?.trainee?.users ?? null;
    const confirmingUser = item.users ?? null;
    const batch = item.enrollments?.batch ?? null;
    const program = batch?.programs ?? null;

    return {
      id: item.id,
      or_number: item.or_number,
      payment_date: isoDate(item.payment_date),
      amount: money(item.amount),
      base_fee: money(item.base_fee),
      payment_method: item.payment_method,
      reason_of_dues: item.reason_of_dues,
      remarks: item.remarks,
      confirmed_by: item.confirmed_by,
      confirmed_by_name: confirmingUser
        ? `${confirmingUser.first_name ?? ''} ${confirmingUser.last_name ?? ''}`.trim()
        : null,
      trainee: traineeUser
        ? {
            id: traineeUser.id,
            first_name: traineeUser.first_name,
            last_name: traineeUser.last_name,
            system_id: traineeUser.system_id,
          }
        : null,
      program: program
        ? {
            id: program.id,
            name: program.name,
          }
        : null,
      batch: batch
        ? {
            id: batch.id,
            batch_name: batch.batch_name,
          }
        : null,
      created_at: item.created_at ? item.created_at.toISOString() : null,
    };
  }
}
