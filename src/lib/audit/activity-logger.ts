// ============================================================================
// Activity Tracking and Audit Logging
// ============================================================================

import { createServerClient } from '@/lib/supabase/server';

export type ActivityAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'signup'
  | 'invite'
  | 'approve'
  | 'reject'
  | 'match'
  | 'import'
  | 'export'
  | 'view'
  | 'download';

export type EntityType =
  | 'user'
  | 'candidate'
  | 'job'
  | 'client'
  | 'manual_review'
  | 'organization'
  | 'api_key'
  | 'webhook'
  | 'settings';

export interface ActivityLogData {
  organization_id: string;
  user_id?: string;
  action: ActivityAction | string;
  entity_type: EntityType | string;
  entity_id?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export interface AuditLogData extends ActivityLogData {
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
}

// ============================================================================
// Activity Logging Functions
// ============================================================================

export async function logActivity(data: ActivityLogData): Promise<void> {
  try {
    const supabase = createServerClient();

    await supabase.from('activities').insert({
      organization_id: data.organization_id,
      user_id: data.user_id || null,
      action: data.action,
      entity_type: data.entity_type,
      entity_id: data.entity_id || null,
      metadata: data.metadata || {},
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    // Don't throw errors for activity logging failures
    console.error('Failed to log activity:', error);
  }
}

export async function logAudit(data: AuditLogData): Promise<void> {
  try {
    const supabase = createServerClient();

    await supabase.from('audit_logs').insert({
      organization_id: data.organization_id,
      user_id: data.user_id || null,
      action: data.action,
      entity_type: data.entity_type,
      entity_id: data.entity_id || null,
      changes: data.changes || null,
      ip_address: data.ip_address || null,
      user_agent: data.user_agent || null,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}

// ============================================================================
// Convenience Functions for Common Activities
// ============================================================================

export async function logUserLogin(
  userId: string,
  organizationId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logActivity({
    organization_id: organizationId,
    user_id: userId,
    action: 'login',
    entity_type: 'user',
    entity_id: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
  });
}

export async function logUserLogout(
  userId: string,
  organizationId: string
): Promise<void> {
  await logActivity({
    organization_id: organizationId,
    user_id: userId,
    action: 'logout',
    entity_type: 'user',
    entity_id: userId,
  });
}

export async function logCandidateCreated(
  userId: string,
  organizationId: string,
  candidateId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logActivity({
    organization_id: organizationId,
    user_id: userId,
    action: 'create',
    entity_type: 'candidate',
    entity_id: candidateId,
    metadata,
  });
}

export async function logJobCreated(
  userId: string,
  organizationId: string,
  jobId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logActivity({
    organization_id: organizationId,
    user_id: userId,
    action: 'create',
    entity_type: 'job',
    entity_id: jobId,
    metadata,
  });
}

export async function logMatchPerformed(
  userId: string,
  organizationId: string,
  jobId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logActivity({
    organization_id: organizationId,
    user_id: userId,
    action: 'match',
    entity_type: 'job',
    entity_id: jobId,
    metadata,
  });
}

export async function logBulkImport(
  userId: string,
  organizationId: string,
  metadata: {
    total_count: number;
    success_count: number;
    error_count: number;
  }
): Promise<void> {
  await logActivity({
    organization_id: organizationId,
    user_id: userId,
    action: 'import',
    entity_type: 'candidate',
    metadata,
  });
}

export async function logDataExport(
  userId: string,
  organizationId: string,
  entityType: EntityType,
  metadata?: Record<string, any>
): Promise<void> {
  await logActivity({
    organization_id: organizationId,
    user_id: userId,
    action: 'export',
    entity_type: entityType,
    metadata,
  });
}

// ============================================================================
// Audit Logging with Change Tracking
// ============================================================================

export async function logEntityUpdate<T extends Record<string, any>>(
  userId: string,
  organizationId: string,
  entityType: EntityType,
  entityId: string,
  before: T,
  after: T,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  // Calculate what changed
  const changes: Record<string, { from: any; to: any }> = {};

  for (const key in after) {
    if (before[key] !== after[key]) {
      changes[key] = {
        from: before[key],
        to: after[key],
      };
    }
  }

  await logAudit({
    organization_id: organizationId,
    user_id: userId,
    action: 'update',
    entity_type: entityType,
    entity_id: entityId,
    changes: {
      before,
      after,
    },
    ip_address: ipAddress,
    user_agent: userAgent,
  });

  // Also log to activities for timeline
  await logActivity({
    organization_id: organizationId,
    user_id: userId,
    action: 'update',
    entity_type: entityType,
    entity_id: entityId,
    metadata: {
      changed_fields: Object.keys(changes),
    },
  });
}

export async function logEntityDelete(
  userId: string,
  organizationId: string,
  entityType: EntityType,
  entityId: string,
  deletedData: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    organization_id: organizationId,
    user_id: userId,
    action: 'delete',
    entity_type: entityType,
    entity_id: entityId,
    changes: {
      before: deletedData,
      after: null,
    },
    ip_address: ipAddress,
    user_agent: userAgent,
  });

  await logActivity({
    organization_id: organizationId,
    user_id: userId,
    action: 'delete',
    entity_type: entityType,
    entity_id: entityId,
  });
}

// ============================================================================
// Activity Retrieval Functions
// ============================================================================

export async function getRecentActivities(
  organizationId: string,
  limit: number = 50
): Promise<any[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('activities')
    .select(
      `
      *,
      users (
        id,
        name,
        email
      )
    `
    )
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activities:', error);
    return [];
  }

  return data || [];
}

export async function getUserActivities(
  userId: string,
  limit: number = 50
): Promise<any[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user activities:', error);
    return [];
  }

  return data || [];
}

export async function getEntityActivities(
  entityType: EntityType,
  entityId: string,
  limit: number = 50
): Promise<any[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('activities')
    .select(
      `
      *,
      users (
        id,
        name,
        email
      )
    `
    )
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching entity activities:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// Activity Statistics
// ============================================================================

export async function getActivityStats(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  total: number;
  by_action: Record<string, number>;
  by_entity_type: Record<string, number>;
  by_user: Record<string, number>;
}> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('activities')
    .select('action, entity_type, user_id')
    .eq('organization_id', organizationId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (error || !data) {
    return {
      total: 0,
      by_action: {},
      by_entity_type: {},
      by_user: {},
    };
  }

  const stats = {
    total: data.length,
    by_action: {} as Record<string, number>,
    by_entity_type: {} as Record<string, number>,
    by_user: {} as Record<string, number>,
  };

  data.forEach((activity) => {
    // Count by action
    stats.by_action[activity.action] =
      (stats.by_action[activity.action] || 0) + 1;

    // Count by entity type
    stats.by_entity_type[activity.entity_type] =
      (stats.by_entity_type[activity.entity_type] || 0) + 1;

    // Count by user
    if (activity.user_id) {
      stats.by_user[activity.user_id] =
        (stats.by_user[activity.user_id] || 0) + 1;
    }
  });

  return stats;
}
