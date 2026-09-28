import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { AdminRole } from './types';

// Cryptographic Secret for signing Admin Sessions
// Falls back to a consistent hash of internal app variables if not explicitly provided
const AUTH_SECRET = process.env.ADMIN_AUTH_SECRET || 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  'gg-esports-ultra-secure-2026-auth-secret-key-32bytes';

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  issuedAt: number;
  expiresAt: number;
}

// In-Memory Brute-Force Tracker (IP and Email based)
interface LoginAttemptRecord {
  attempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

const loginAttempts = new Map<string, LoginAttemptRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 Minutes Lockout

/**
 * Check if an IP / email is currently locked out due to brute force attempts
 */
export function checkBruteForceLockout(key: string): { isLocked: boolean; remainingMs?: number; remainingAttempts?: number } {
  const record = loginAttempts.get(key);
  const now = Date.now();

  if (!record) {
    return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  // Check if currently locked
  if (record.lockedUntil && record.lockedUntil > now) {
    return {
      isLocked: true,
      remainingMs: record.lockedUntil - now
    };
  }

  // If lockout expired, reset
  if (record.lockedUntil && record.lockedUntil <= now) {
    loginAttempts.delete(key);
    return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  // Check if attempts are within window (15 mins)
  if (now - record.lastAttempt > LOCKOUT_DURATION_MS) {
    loginAttempts.delete(key);
    return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  return {
    isLocked: false,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - record.attempts)
  };
}

/**
 * Record a failed login attempt
 */
export function recordFailedLogin(key: string): { isLocked: boolean; remainingAttempts: number; lockedUntil?: number } {
  const now = Date.now();
  const record = loginAttempts.get(key) || { attempts: 0, lockedUntil: null, lastAttempt: now };

  record.attempts += 1;
  record.lastAttempt = now;

  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    loginAttempts.set(key, record);
    return { isLocked: true, remainingAttempts: 0, lockedUntil: record.lockedUntil };
  }

  loginAttempts.set(key, record);
  return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS - record.attempts };
}

/**
 * Clear failed login attempts upon successful authentication
 */
export function clearFailedLogins(key: string): void {
  loginAttempts.delete(key);
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      // Force comparison to take constant time even on mismatched lengths
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Create a signed, tamper-proof admin session token (HMAC-SHA256)
 */
export function createAdminSessionToken(admin: { id: string; email: string; full_name: string; role: AdminRole }): string {
  const now = Date.now();
  const session: AdminSession = {
    id: admin.id,
    email: admin.email.toLowerCase().trim(),
    name: admin.full_name,
    role: admin.role,
    issuedAt: now,
    expiresAt: now + (12 * 60 * 60 * 1000) // 12 hours
  };

  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payload)
    .digest('base64url');

  return `${payload}.${signature}`;
}

/**
 * Verify and decode an admin session token
 */
export function verifyAdminSessionToken(token?: string | null): AdminSession | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  try {
    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(payload)
      .digest('base64url');

    // Constant-time signature verification
    if (!timingSafeCompare(signature, expectedSignature)) {
      return null;
    }

    const sessionJson = Buffer.from(payload, 'base64url').toString('utf8');
    const session: AdminSession = JSON.parse(sessionJson);

    // Check expiration
    if (!session.expiresAt || session.expiresAt < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Extract authenticated admin session from an incoming NextRequest
 */
export function getAdminFromRequest(req: NextRequest): AdminSession | null {
  // 1. Check Authorization Bearer Header
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const session = verifyAdminSessionToken(token);
    if (session) return session;
  }

  // 2. Check HTTP-only or standard secure cookie
  const cookieToken = req.cookies.get('gg_admin_token')?.value;
  if (cookieToken) {
    const session = verifyAdminSessionToken(cookieToken);
    if (session) return session;
  }

  return null;
}
