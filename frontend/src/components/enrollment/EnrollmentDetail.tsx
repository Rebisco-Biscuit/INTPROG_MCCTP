import React, { useCallback, useEffect, useState } from 'react';
import { CircleCheck, CircleX } from 'lucide-react';
import { getEnrollmentDetail, updateEnrollmentStatus, updateRequirementChecklist } from '../../api/enrollments/enrollment.api';
import EnrollmentStatusBadge from './EnrollmentStatusBadge';

/** Required documents: database column, API field, and label */
const REQUIRED_DOCUMENTS = [
  { key: 'bc_nso_psa_copy', field: 'bcNsoPsaCopy', label: 'BC/NSO PSA Copy' },
  { key: 'diploma_tor', field: 'diplomaTor', label: 'Diploma/TOR' },
  { key: 'brgy_clearance', field: 'brgyClearance', label: 'Barangay Clearance' },
  { key: 'one_by_one_pic', field: 'oneByOnePic', label: '1x1 Picture' },
  { key: 'two_by_two_pic', field: 'twoByTwoPic', label: '2x2 Picture' },
  { key: 'passport_size', field: 'passportSize', label: 'Passport Size Picture' },
] as const;

type DocumentKey = (typeof REQUIRED_DOCUMENTS)[number]['key'];

/** Text-link actions, matching Edit / Archive on the admin Programs table */
const primaryActionClass = 'text-xs font-semibold text-blue-900 transition hover:text-blue-950 disabled:opacity-50';
const secondaryActionClass = 'text-xs font-semibold text-slate-500 transition hover:text-slate-900 disabled:opacity-50';
/** Small uppercase label used for tags such as Accredited */
const tagClass = 'text-[10px] font-semibold uppercase tracking-wider';

interface EnrollmentDetailProps {
  enrollmentId: string;
  onClose: () => void;
}

const EnrollmentDetail: React.FC<EnrollmentDetailProps> = ({
  enrollmentId,
  onClose,
}) => {
  const [enrollment, setEnrollment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  // Submitted documents editing (registrar)
  const [isEditingDocuments, setIsEditingDocuments] = useState(false);
  const [draftDocuments, setDraftDocuments] = useState<Record<DocumentKey, boolean> | null>(null);
  const [isSavingDocuments, setIsSavingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  const savedDocuments = (): Record<DocumentKey, boolean> =>
    Object.fromEntries(
      REQUIRED_DOCUMENTS.map(({ key }) => [key, Boolean(enrollment?.requirement_checklist?.[key])]),
    ) as Record<DocumentKey, boolean>;

  const startEditingDocuments = () => {
    setDraftDocuments(savedDocuments());
    setDocumentsError(null);
    setIsEditingDocuments(true);
  };

  const cancelEditingDocuments = () => {
    setIsEditingDocuments(false);
    setDraftDocuments(null);
    setDocumentsError(null);
  };

  const saveDocuments = async () => {
    if (!draftDocuments) return;
    try {
      setIsSavingDocuments(true);
      setDocumentsError(null);
      const saved = await updateRequirementChecklist(
        enrollmentId,
        Object.fromEntries(REQUIRED_DOCUMENTS.map(({ key, field }) => [field, draftDocuments[key]])) as Parameters<typeof updateRequirementChecklist>[1],
      );
      setEnrollment((prev: any) => ({ ...prev, requirement_checklist: saved }));
      setIsEditingDocuments(false);
      setDraftDocuments(null);
    } catch (err) {
      console.error('Error saving submitted documents:', err);
      setDocumentsError((err as any)?.response?.data?.message || 'Failed to save submitted documents');
    } finally {
      setIsSavingDocuments(false);
    }
  };

  const loadEnrollmentDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getEnrollmentDetail(enrollmentId);
      setEnrollment(data);
      setError(null);
    } catch (err) {
      console.error('Error loading enrollment detail:', err);
      setError('Failed to load enrollment details');
    } finally {
      setIsLoading(false);
    }
  }, [enrollmentId]);

  useEffect(() => {
    void loadEnrollmentDetail();
  }, [loadEnrollmentDetail]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      await updateEnrollmentStatus(enrollmentId, newStatus);
      // Update both the selected enrollment and its card in the program list
      setEnrollment((prev: any) => ({
        ...prev,
        enrollment_status: newStatus,
        trainee: prev.trainee && {
          ...prev.trainee,
          enrollments: (prev.trainee.enrollments || []).map((item: any) =>
            item.id === enrollmentId ? { ...item, enrollment_status: newStatus } : item,
          ),
        },
      }));
      setError(null);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update enrollment status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-900 mb-4"></div>
            <p className="text-slate-600">Loading enrollment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="text-center">
            <p className="text-red-700 mb-4">{error || 'Enrollment not found'}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const traineeFirstName = enrollment.trainee?.users?.first_name || 'Trainee';
  const traineeLastName = enrollment.trainee?.users?.last_name || '';
  const traineeName = `${traineeFirstName} ${traineeLastName}`.trim();
  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : '—');
  // Fall back to the selected enrollment if the backend sent no list
  const traineeEnrollments: any[] = enrollment.trainee?.enrollments?.length
    ? enrollment.trainee.enrollments
    : [enrollment];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Enrollment Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Status Section */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-4">
              Enrollment Status: {enrollment.batch?.programs?.name}
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Current Status
                </p>
                <EnrollmentStatusBadge status={enrollment.enrollment_status} />
              </div>

              <select
                value={enrollment.enrollment_status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdatingStatus}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:opacity-50"
              >
                <option value="PENDING">Pending</option>
                <option value="ENROLLED">Enrolled</option>
                <option value="WITHDRAWN">Withdrawn</option>
                <option value="COMPLETED">Completed</option>
                <option value="DROPPED">Dropped</option>
              </select>
            </div>
          </div>

          {/* Trainee Information */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Trainee Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-slate-600">Name</p>
                <p className="text-slate-900">{traineeName}</p>
              </div>
              <div>
                <p className="font-medium text-slate-600">Contact Number</p>
                <p className="text-slate-900">{enrollment.trainee?.contact_number}</p>
              </div>
              <div>
                <p className="font-medium text-slate-600">Gender</p>
                <p className="text-slate-900">{enrollment.trainee?.gender}</p>
              </div>
              <div>
                <p className="font-medium text-slate-600">Date of Birth</p>
                <p className="text-slate-900">
                  {new Date(enrollment.trainee?.date_of_birth).toLocaleDateString()}
                </p>
              </div>
              <div className="col-span-2">
                <p className="font-medium text-slate-600">Address</p>
                <p className="text-slate-900">
                  {enrollment.trainee?.street_address}, {enrollment.trainee?.barangay},
                  {enrollment.trainee?.municipality}, {enrollment.trainee?.province}
                </p>
              </div>
            </div>
          </div>

          {/* One card per program the trainee is enrolled in */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">
              Programs Enrolled ({traineeEnrollments.length})
            </h3>
            {traineeEnrollments.map((item) => {
              return (
                <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <p className="font-semibold text-slate-900">{item.batch?.programs?.name}</p>
                    <span className={`${tagClass} text-slate-400`}>
                      {item.batch?.programs?.is_accredited ? 'Accredited' : 'Non-accredited'}
                    </span>
                    <EnrollmentStatusBadge status={item.enrollment_status} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Batch Information</p>
                      <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <dt className="font-medium text-slate-600">Program</dt>
                          <dd className="text-slate-900">{item.batch?.programs?.name}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-slate-600">Batch</dt>
                          <dd className="text-slate-900">{item.batch?.batch_name}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-slate-600">Start Date</dt>
                          <dd className="text-slate-900">{formatDate(item.batch?.start_date)}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-slate-600">End Date</dt>
                          <dd className="text-slate-900">{formatDate(item.batch?.end_date)}</dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Enrollment Details</p>
                      <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <dt className="font-medium text-slate-600">ID Card Number</dt>
                          <dd className="font-mono text-slate-900">{item.id_card_number || '—'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-slate-600">Uniform Size</dt>
                          <dd className="text-slate-900">{item.uniform_size || '—'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-slate-600">Enrolled Date</dt>
                          <dd className="text-slate-900">{formatDate(item.enrolled_at)}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-slate-600">OR Number</dt>
                          <dd className="font-mono text-slate-900">{item.official_receipts?.[0]?.or_number || '—'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Document Checklist */}
          {(() => {
            // Shown for every enrollment; older records without a checklist count as all missing
            const current = isEditingDocuments && draftDocuments ? draftDocuments : savedDocuments();
            const submittedCount = REQUIRED_DOCUMENTS.filter(({ key }) => current[key]).length;
            const allSubmitted = submittedCount === REQUIRED_DOCUMENTS.length;

            return (
              <div className={`rounded-lg border p-4 ${isEditingDocuments ? 'border-blue-700' : 'border-slate-200'}`}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <h3 className="font-semibold text-slate-900">Submitted Documents: {enrollment.batch?.programs?.name}</h3>
                    <span className={`${tagClass} ${allSubmitted ? 'text-green-700' : 'text-slate-400'}`}>
                      {submittedCount} / {REQUIRED_DOCUMENTS.length} submitted
                    </span>
                  </div>
                  {isEditingDocuments ? (
                    <div className="flex gap-4">
                      <button type="button" onClick={cancelEditingDocuments} disabled={isSavingDocuments} className={secondaryActionClass}>
                        Cancel
                      </button>
                      <button type="button" onClick={saveDocuments} disabled={isSavingDocuments} className={primaryActionClass}>
                        {isSavingDocuments ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={startEditingDocuments} className={primaryActionClass}>
                      Edit
                    </button>
                  )}
                </div>

                {documentsError && <p className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{documentsError}</p>}

                <ul className="divide-y divide-slate-100 text-sm">
                  {REQUIRED_DOCUMENTS.map(({ key, label }) => {
                    const submitted = current[key];
                    const status = (
                      <span className={`${tagClass} ${submitted ? 'text-green-700' : 'text-red-500'}`}>
                        {submitted ? 'Submitted' : 'Missing'}
                      </span>
                    );
                    return isEditingDocuments ? (
                      <li key={key}>
                        <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={submitted}
                              disabled={isSavingDocuments}
                              onChange={(event) => setDraftDocuments((prev) => prev && { ...prev, [key]: event.target.checked })}
                              className="h-4 w-4 accent-blue-900"
                            />
                            <span className="text-slate-900">{label}</span>
                          </span>
                          {status}
                        </label>
                      </li>
                    ) : (
                      <li key={key} className="flex items-center justify-between gap-3 py-2">
                        <span className="flex items-center gap-2">
                          {submitted ? (
                            <CircleCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-green-600" />
                          ) : (
                            <CircleX aria-hidden="true" className="h-4 w-4 shrink-0 text-red-400" />
                          )}
                          <span className={submitted ? 'font-medium text-slate-900' : 'text-slate-600'}>{label}</span>
                        </span>
                        {/* Text as well as color, so the status is readable without relying on color */}
                        {status}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })()}

          {/* Remarks of the selected enrollment (was rendered outside the popup) */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-2">Remarks: {enrollment.batch?.programs?.name}</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {enrollment.remarks || 'No remarks posted.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDetail;
