import { createContext, useContext, useMemo, type ReactNode } from 'react'
import {
  createEnrollmentApi,
  type EnrollmentApi,
  type EnrollmentScope,
} from '../api/enrollments/enrollment.api'

/** Holds the enrollment API of the current page's role (null outside a provider) */
const EnrollmentApiContext = createContext<EnrollmentApi | null>(null)

/**
 * Chooses which role's enrollment routes the shared enrollment components call.
 * There is no default: each page states its role, so a page can never fall
 * back to another role's endpoints.
 */
export function EnrollmentApiProvider({
  scope,
  children,
}: {
  scope: EnrollmentScope
  children: ReactNode
}) {
  // Build the API once per role, not on every render
  const api = useMemo(() => createEnrollmentApi(scope), [scope])

  return (
    <EnrollmentApiContext.Provider value={api}>
      {children}
    </EnrollmentApiContext.Provider>
  )
}

/**
 * Returns the enrollment API calls for the page's role. Used by
 * EnrollmentTable, EnrollmentDetail and EnrollmentFormWizard. Throws if a
 * component is rendered outside an EnrollmentApiProvider.
 */
export function useEnrollmentApi(): EnrollmentApi {
  const api = useContext(EnrollmentApiContext)

  if (!api) {
    throw new Error('useEnrollmentApi must be used inside an EnrollmentApiProvider')
  }

  return api
}
