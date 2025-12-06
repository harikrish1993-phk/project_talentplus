// ============================================================================
// Role-Based Access Control (RBAC) System
// ============================================================================

export type UserRole = 'admin' | 'team_lead' | 'recruiter' | 'viewer';

export type Permission =
  // Job permissions
  | 'jobs.view'
  | 'jobs.create'
  | 'jobs.edit.own'
  | 'jobs.edit.all'
  | 'jobs.delete.own'
  | 'jobs.delete.all'
  | 'jobs.match'
  | 'jobs.post_external'
  
  // Candidate permissions
  | 'candidates.view'
  | 'candidates.create'
  | 'candidates.edit.own'
  | 'candidates.edit.all'
  | 'candidates.delete.own'
  | 'candidates.delete.all'
  | 'candidates.import'
  | 'candidates.export'
  | 'candidates.manual_review'
  
  // Client permissions
  | 'clients.view'
  | 'clients.create'
  | 'clients.edit'
  | 'clients.delete'
  
  // User management
  | 'users.view'
  | 'users.invite'
  | 'users.edit'
  | 'users.delete'
  | 'users.manage_roles'
  
  // Reports and analytics
  | 'reports.view.own'
  | 'reports.view.team'
  | 'reports.view.all'
  | 'reports.export'
  
  // Settings
  | 'settings.view'
  | 'settings.edit.own'
  | 'settings.edit.organization'
  | 'settings.edit.ai'
  | 'settings.billing'
  
  // Activity and audit
  | 'activity.view.own'
  | 'activity.view.team'
  | 'activity.view.all'
  | 'audit.view'
  
  // API and integrations
  | 'api_keys.create'
  | 'api_keys.revoke'
  | 'webhooks.manage'
  | 'integrations.manage';

// ============================================================================
// Role Definitions
// ============================================================================

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Viewer: Read-only access
  viewer: [
    'jobs.view',
    'candidates.view',
    'clients.view',
    'reports.view.own',
    'settings.view',
    'settings.edit.own',
    'activity.view.own',
  ],

  // Recruiter: Full CRUD on jobs and candidates they own
  recruiter: [
    // Jobs
    'jobs.view',
    'jobs.create',
    'jobs.edit.own',
    'jobs.delete.own',
    'jobs.match',
    
    // Candidates
    'candidates.view',
    'candidates.create',
    'candidates.edit.own',
    'candidates.delete.own',
    'candidates.import',
    'candidates.export',
    'candidates.manual_review',
    
    // Clients
    'clients.view',
    'clients.create',
    
    // Reports
    'reports.view.own',
    'reports.export',
    
    // Settings
    'settings.view',
    'settings.edit.own',
    
    // Activity
    'activity.view.own',
  ],

  // Team Lead: Manage team members and view team reports
  team_lead: [
    // Jobs
    'jobs.view',
    'jobs.create',
    'jobs.edit.all',
    'jobs.delete.own',
    'jobs.match',
    'jobs.post_external',
    
    // Candidates
    'candidates.view',
    'candidates.create',
    'candidates.edit.all',
    'candidates.delete.own',
    'candidates.import',
    'candidates.export',
    'candidates.manual_review',
    
    // Clients
    'clients.view',
    'clients.create',
    'clients.edit',
    
    // Users (limited)
    'users.view',
    
    // Reports
    'reports.view.own',
    'reports.view.team',
    'reports.export',
    
    // Settings
    'settings.view',
    'settings.edit.own',
    
    // Activity
    'activity.view.own',
    'activity.view.team',
  ],

  // Admin: Full access to everything
  admin: [
    // Jobs
    'jobs.view',
    'jobs.create',
    'jobs.edit.all',
    'jobs.delete.all',
    'jobs.match',
    'jobs.post_external',
    
    // Candidates
    'candidates.view',
    'candidates.create',
    'candidates.edit.all',
    'candidates.delete.all',
    'candidates.import',
    'candidates.export',
    'candidates.manual_review',
    
    // Clients
    'clients.view',
    'clients.create',
    'clients.edit',
    'clients.delete',
    
    // Users
    'users.view',
    'users.invite',
    'users.edit',
    'users.delete',
    'users.manage_roles',
    
    // Reports
    'reports.view.own',
    'reports.view.team',
    'reports.view.all',
    'reports.export',
    
    // Settings
    'settings.view',
    'settings.edit.own',
    'settings.edit.organization',
    'settings.edit.ai',
    'settings.billing',
    
    // Activity
    'activity.view.own',
    'activity.view.team',
    'activity.view.all',
    'audit.view',
    
    // API
    'api_keys.create',
    'api_keys.revoke',
    'webhooks.manage',
    'integrations.manage',
  ],
};

// ============================================================================
// Permission Checking Functions
// ============================================================================

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

// ============================================================================
// Resource Ownership Checking
// ============================================================================

export interface ResourceOwnership {
  userId: string;
  resourceOwnerId: string;
  resourceType: 'job' | 'candidate' | 'client' | 'report';
}

export function canAccessResource(
  role: UserRole,
  ownership: ResourceOwnership
): boolean {
  const { userId, resourceOwnerId, resourceType } = ownership;

  // Admins can access everything
  if (role === 'admin') {
    return true;
  }

  // Team leads can access team resources
  if (role === 'team_lead') {
    // You would need to check if the resource owner is in the same team
    // For now, we'll allow team leads to access all resources
    return true;
  }

  // Recruiters and viewers can only access their own resources
  return userId === resourceOwnerId;
}

// ============================================================================
// Role Hierarchy
// ============================================================================

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 1,
  recruiter: 2,
  team_lead: 3,
  admin: 4,
};

export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY[role];
}

export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  return getRoleLevel(managerRole) > getRoleLevel(targetRole);
}

// ============================================================================
// Permission Middleware Helper
// ============================================================================

export function requirePermission(permission: Permission) {
  return (role: UserRole): boolean => {
    return hasPermission(role, permission);
  };
}

export function requireAnyPermission(permissions: Permission[]) {
  return (role: UserRole): boolean => {
    return hasAnyPermission(role, permissions);
  };
}

export function requireAllPermissions(permissions: Permission[]) {
  return (role: UserRole): boolean => {
    return hasAllPermissions(role, permissions);
  };
}

// ============================================================================
// User-Friendly Permission Names
// ============================================================================

export const PERMISSION_LABELS: Record<Permission, string> = {
  // Jobs
  'jobs.view': 'View Jobs',
  'jobs.create': 'Create Jobs',
  'jobs.edit.own': 'Edit Own Jobs',
  'jobs.edit.all': 'Edit All Jobs',
  'jobs.delete.own': 'Delete Own Jobs',
  'jobs.delete.all': 'Delete All Jobs',
  'jobs.match': 'Match Candidates to Jobs',
  'jobs.post_external': 'Post Jobs to External Platforms',
  
  // Candidates
  'candidates.view': 'View Candidates',
  'candidates.create': 'Add Candidates',
  'candidates.edit.own': 'Edit Own Candidates',
  'candidates.edit.all': 'Edit All Candidates',
  'candidates.delete.own': 'Delete Own Candidates',
  'candidates.delete.all': 'Delete All Candidates',
  'candidates.import': 'Import Candidates',
  'candidates.export': 'Export Candidates',
  'candidates.manual_review': 'Manually Review Candidates',
  
  // Clients
  'clients.view': 'View Clients',
  'clients.create': 'Create Clients',
  'clients.edit': 'Edit Clients',
  'clients.delete': 'Delete Clients',
  
  // Users
  'users.view': 'View Users',
  'users.invite': 'Invite Users',
  'users.edit': 'Edit Users',
  'users.delete': 'Delete Users',
  'users.manage_roles': 'Manage User Roles',
  
  // Reports
  'reports.view.own': 'View Own Reports',
  'reports.view.team': 'View Team Reports',
  'reports.view.all': 'View All Reports',
  'reports.export': 'Export Reports',
  
  // Settings
  'settings.view': 'View Settings',
  'settings.edit.own': 'Edit Own Settings',
  'settings.edit.organization': 'Edit Organization Settings',
  'settings.edit.ai': 'Configure AI Settings',
  'settings.billing': 'Manage Billing',
  
  // Activity
  'activity.view.own': 'View Own Activity',
  'activity.view.team': 'View Team Activity',
  'activity.view.all': 'View All Activity',
  'audit.view': 'View Audit Logs',
  
  // API
  'api_keys.create': 'Create API Keys',
  'api_keys.revoke': 'Revoke API Keys',
  'webhooks.manage': 'Manage Webhooks',
  'integrations.manage': 'Manage Integrations',
};

export function getPermissionLabel(permission: Permission): string {
  return PERMISSION_LABELS[permission] || permission;
}

// ============================================================================
// Role Labels
// ============================================================================

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  team_lead: 'Team Lead',
  recruiter: 'Recruiter',
  viewer: 'Viewer',
};

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role];
}
