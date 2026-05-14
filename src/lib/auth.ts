import jwt from 'jsonwebtoken';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_jwt_key_32_chars_12345';

export interface TokenPayload {
  userId: string;
  role: 'USER' | 'ADMIN';
}

/**
 * Sign JWT using jsonwebtoken (Node.js runtime)
 */
export function signJwt(payload: TokenPayload, expiresIn: string | number = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify JWT using jsonwebtoken (Node.js runtime)
 */
export function verifyJwt(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

/**
 * Verify JWT using jose (Edge runtime for Next.js Middleware)
 */
export async function verifyJwtEdge(token: string): Promise<TokenPayload> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as TokenPayload;
}
