import type {
  batch_status_enum,
  civil_status_enum,
  day_enum,
  employment_status_enum,
  employment_type_enum,
  enrollment_status_enum,
  gender_enum,
  highest_education_enum,
  size_enum,
} from '../../../generated/prisma/enums';

/** Account fields safe to show staff (never password_hash or auth state). */
export interface TraineeName {
  firstName: string;
  middleName: string;
  lastName: string;
}

export interface TraineeListEnrollment {
  id: string;
  programName: string;
  batchName: string;
  status: enrollment_status_enum;
  idCardNumber: string | null;
  enrolledAt: Date;
}

export interface TraineeListRow extends TraineeName {
  id: string;
  username: string | null;
  email: string | null;
  contactNumber: string;
  /** Latest enrollment that matches the active filters (latest overall when none). */
  enrollment: TraineeListEnrollment | null;
  /** Enrollments beyond the one shown, for the "+N more" label. */
  otherEnrollmentCount: number;
}

export interface TraineeListResponse {
  data: TraineeListRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TraineeFilterOptions {
  programs: { id: string; name: string; isAccredited: boolean }[];
  batches: {
    id: string;
    name: string;
    programId: string;
    status: batch_status_enum;
  }[];
  enrollmentStatuses: enrollment_status_enum[];
  batchStatuses: batch_status_enum[];
  genders: gender_enum[];
}

export interface TraineeProfileSchedule {
  name: string;
  days: day_enum[];
  /** HH:mm */
  startTime: string;
  /** HH:mm */
  endTime: string;
}

export interface TraineeProfileEnrollment {
  id: string;
  status: enrollment_status_enum;
  idCardNumber: string | null;
  uniformSize: size_enum | null;
  /** Timestamp (ISO when serialized). */
  enrolledAt: Date;
  orNumber: string | null;
  requirementsSubmitted: number;
  requirementsTotal: number;
  batch: {
    id: string;
    name: string;
    status: batch_status_enum;
    /** YYYY-MM-DD */
    startDate: string;
    /** YYYY-MM-DD */
    endDate: string;
    trainerName: string | null;
  };
  program: {
    id: string;
    name: string;
    isAccredited: boolean;
    schedules: TraineeProfileSchedule[];
  };
}

export interface TraineeProfile extends TraineeName {
  id: string;
  username: string | null;
  email: string | null;
  contactNumber: string;
  gender: gender_enum;
  /** YYYY-MM-DD */
  dateOfBirth: string;
  placeOfBirth: string;
  citizenship: string;
  civilStatus: civil_status_enum;
  pwd: boolean;
  address: {
    street: string;
    barangay: string;
    municipality: string;
    district: string;
    province: string;
  };
  family: { motherName: string; fatherName: string };
  education: { highestEducation: highest_education_enum };
  employment: {
    status: employment_status_enum;
    type: employment_type_enum;
  };
  beneficiary: {
    firstName: string;
    middleName: string;
    lastName: string;
    relationship: string;
    contactNumber: string;
    address: string;
    idNumber: string;
  } | null;
  insurance: {
    id: string;
    /** YYYY-MM-DD */
    effectiveDate: string;
    /** YYYY-MM-DD */
    expiryDate: string;
    orNumber: string;
    isActive: boolean;
  }[];
  enrollments: TraineeProfileEnrollment[];
}
