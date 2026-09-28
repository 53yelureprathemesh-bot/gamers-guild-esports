import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { 
  checkBruteForceLockout, 
  recordFailedLogin, 
  clearFailedLogins, 
  createAdminSessionToken 
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const body = await req.json();
    const { email, password } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { success: false, error: 'Email ID and password credentials are required.' },
        { status: 400 }
      );
    }

    // 1. Check IP and Account Brute-Force Lockout Status
    const ipCheck = checkBruteForceLockout(`ip:${ip}`);
    if (ipCheck.isLocked) {
      const remainingMinutes = Math.ceil((ipCheck.remainingMs || 0) / 60000);
      return NextResponse.json(
        { 
          success: false, 
          error: `ACCESS LOCKED: Multiple failed login attempts detected from your IP. Security lockout is active for ${remainingMinutes} more minute(s).` 
        },
        { status: 429 }
      );
    }

    const emailCheck = checkBruteForceLockout(`email:${cleanEmail}`);
    if (emailCheck.isLocked) {
      const remainingMinutes = Math.ceil((emailCheck.remainingMs || 0) / 60000);
      return NextResponse.json(
        { 
          success: false, 
          error: `ACCOUNT LOCKED: Too many invalid attempts for this administrator account. Security lockout is active for ${remainingMinutes} minute(s).` 
        },
        { status: 429 }
      );
    }

    // 2. Validate Credentials against Data Store
    const admin = dataStore.authenticateAdmin(cleanEmail, cleanPassword);

    if (!admin) {
      // Artificial delay (400ms) to neutralize automated timing attacks
      await new Promise(r => setTimeout(r, 400));

      const ipFail = recordFailedLogin(`ip:${ip}`);
      const emailFail = recordFailedLogin(`email:${cleanEmail}`);

      const remaining = Math.min(ipFail.remainingAttempts, emailFail.remainingAttempts);

      if (ipFail.isLocked || emailFail.isLocked) {
        return NextResponse.json(
          {
            success: false,
            error: 'ACCESS LOCKED: 5 consecutive failed attempts. Your sector access is locked for 15 minutes.'
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          error: `ACCESS DENIED: Invalid administrator email or password. (${remaining} attempt(s) remaining before security lockout)` 
        },
        { status: 401 }
      );
    }

    // 3. Clear failed login counters upon successful authentication
    clearFailedLogins(`ip:${ip}`);
    clearFailedLogins(`email:${cleanEmail}`);

    // 4. Generate Cryptographic Tamper-Proof Session Token (HMAC-SHA256)
    const token = createAdminSessionToken(admin);

    const response = NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.full_name,
        role: admin.role
      }
    });

    // 5. Set HTTP-Only Secure Cookie
    response.cookies.set('gg_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60 // 12 Hours
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
