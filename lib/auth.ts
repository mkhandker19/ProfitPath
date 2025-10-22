import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_NAME = 'pp_auth'
const alg = 'HS256'

export async function signAuthToken(payload: any) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev_secret_change_me')
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get(JWT_NAME)?.value
  if (!token) return null
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev_secret_change_me')
    const { payload } = await jwtVerify(token, secret)
    return payload as any
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(JWT_NAME, token, { httpOnly: true, path: '/', maxAge: 60*60*24*7, sameSite: 'lax' })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.set(JWT_NAME, '', { httpOnly: true, path: '/', maxAge: 0 })
}
