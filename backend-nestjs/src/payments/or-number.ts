import { Prisma } from '../generated/prisma/client';

export async function generateOrNumber(
  tx: Prisma.TransactionClient,
  paymentDate: Date,
): Promise<string> {
  const year = paymentDate.getUTCFullYear();
  const sequence = await tx.or_number_seq.upsert({
    where: { year },
    update: { last_sequence: { increment: 1 } },
    create: { year, last_sequence: 1 },
  });

  return `OR-${year}-${String(sequence.last_sequence).padStart(6, '0')}`;
}
