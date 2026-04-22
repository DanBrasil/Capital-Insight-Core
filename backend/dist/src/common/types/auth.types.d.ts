export type UserRole = 'admin' | 'manager' | 'viewer';
export type FeatureFlag = 'reports' | 'investments' | 'credit' | 'notifications' | 'multi-account' | 'export-csv' | 'audit-log' | 'portfolio' | 'market-overview' | 'operations' | 'ai-insights';
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    tenantId: string;
    iat?: number;
    exp?: number;
}
export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId: string;
}
