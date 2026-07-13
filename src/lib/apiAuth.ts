import { NextRequest } from 'next/server';
import { verifyJwt, TokenPayload } from './auth';

/** Read the JWT from the Authorization header (set by apiClient) or the `token` cookie. */
export function getAuthPayload(request: NextRequest): TokenPayload | null {
  const header = request.headers.get('authorization');
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null;
  const token = bearer || request.cookies.get('token')?.value;
  if (!token) return null;
  try {
    return verifyJwt(token);
  } catch {
    return null;
  }
}

export function isAdminRequest(request: NextRequest): boolean {
  return getAuthPayload(request)?.role === 'ADMIN';
}
