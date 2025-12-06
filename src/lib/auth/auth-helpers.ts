// ============================================================================
// Authentication Helper Functions
// ============================================================================

import { createClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// ============================================================================
// Types
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'team_lead' | 'recruiter' | 'viewer';
  organization_id: string;
  email_verified: boolean;
  avatar_url?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  organization_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
  remember_me?: boolean;
}

// ============================================================================
// Password Utilities
// ============================================================================

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ============================================================================
// Email Verification
// ============================================================================

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    // If using Resend
    if (process.env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || 'noreply@talentpulse.ai',
          to: email,
          subject: 'Verify your email address',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Welcome to TalentPulse AI!</h2>
              <p>Please verify your email address by clicking the link below:</p>
              <p>
                <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Verify Email Address
                </a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
              <p style="color: #999; font-size: 12px; margin-top: 24px;">
                This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }
    } else {
      // Log to console in development
      console.log('Verification email would be sent to:', email);
      console.log('Verification URL:', verificationUrl);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Password Reset
// ============================================================================

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || 'noreply@talentpulse.ai',
          to: email,
          subject: 'Reset your password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Password Reset Request</h2>
              <p>We received a request to reset your password. Click the link below to create a new password:</p>
              <p>
                <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Reset Password
                </a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="color: #666; word-break: break-all;">${resetUrl}</p>
              <p style="color: #999; font-size: 12px; margin-top: 24px;">
                This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send password reset email');
      }
    } else {
      console.log('Password reset email would be sent to:', email);
      console.log('Reset URL:', resetUrl);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Session Management
// ============================================================================

export async function createUserSession(
  userId: string,
  organizationId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const supabase = createServerClient();
  const token = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  const { error } = await supabase.from('user_sessions').insert({
    user_id: userId,
    organization_id: organizationId,
    token: hashToken(token),
    ip_address: ipAddress,
    user_agent: userAgent,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    throw new Error('Failed to create session');
  }

  return token;
}

export async function validateSession(
  token: string
): Promise<AuthUser | null> {
  const supabase = createServerClient();
  const hashedToken = hashToken(token);

  const { data: session, error } = await supabase
    .from('user_sessions')
    .select(
      `
      *,
      users (
        id,
        email,
        name,
        role,
        organization_id,
        email_verified,
        avatar_url
      )
    `
    )
    .eq('token', hashedToken)
    .gt('expires_at', new Date().toISOString())
    .is('revoked_at', null)
    .single();

  if (error || !session) {
    return null;
  }

  // Update last activity
  await supabase
    .from('user_sessions')
    .update({ last_activity: new Date().toISOString() })
    .eq('id', session.id);

  return session.users as unknown as AuthUser;
}

export async function revokeSession(token: string): Promise<void> {
  const supabase = createServerClient();
  const hashedToken = hashToken(token);

  await supabase
    .from('user_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('token', hashedToken);
}

// ============================================================================
// Login Attempt Tracking
// ============================================================================

export async function logLoginAttempt(
  email: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  failureReason?: string
): Promise<void> {
  const supabase = createServerClient();

  await supabase.from('login_attempts').insert({
    email,
    success,
    ip_address: ipAddress,
    user_agent: userAgent,
    failure_reason: failureReason,
  });
}

export async function checkAccountLockout(email: string): Promise<{
  locked: boolean;
  remainingAttempts?: number;
  lockoutUntil?: Date;
}> {
  const supabase = createServerClient();
  const fifteenMinutesAgo = new Date();
  fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

  const { data: attempts } = await supabase
    .from('login_attempts')
    .select('*')
    .eq('email', email)
    .eq('success', false)
    .gte('created_at', fifteenMinutesAgo.toISOString())
    .order('created_at', { ascending: false });

  const failedAttempts = attempts?.length || 0;
  const maxAttempts = 5;

  if (failedAttempts >= maxAttempts) {
    const lockoutUntil = new Date(fifteenMinutesAgo);
    lockoutUntil.setMinutes(lockoutUntil.getMinutes() + 15);

    return {
      locked: true,
      lockoutUntil,
    };
  }

  return {
    locked: false,
    remainingAttempts: maxAttempts - failedAttempts,
  };
}

// ============================================================================
// User Lookup
// ============================================================================

export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  const supabase = createServerClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return null;
  }

  return user as unknown as AuthUser;
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const supabase = createServerClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !user) {
    return null;
  }

  return user as unknown as AuthUser;
}
