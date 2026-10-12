/**
 * The user attached to `req.user` on protected routes, as returned by
 * JwtStrategy.validate().
 */
export interface AuthenticatedUser {
  id: string;
  systemId: string | null;
  role: string;
}
