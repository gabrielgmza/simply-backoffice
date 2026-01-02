// ============================================
// USER TYPES
// ============================================
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dni?: string;
  phone?: string;
  userLevel: 'PLATA' | 'ORO' | 'BLACK' | 'DIAMANTE';
  kycStatus: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'PENDING';
  createdAt: string;
  lastLoginAt?: string;
}

export interface Account {
  id: string;
  userId: string;
  cvu: string;
  alias: string;
  balance: number;
  balanceUsd: number;
  balanceUsdt: number;
  dailyLimit: number;
  monthlyLimit: number;
}

export interface UserProfile {
  user: User;
  account?: Account;
  financialSummary: {
    balance: number;
    totalInvested: number;
    totalReturns: number;
    creditLimit: number;
    creditUsed: number;
    creditAvailable: number;
    totalDebt: number;
    netWorth: number;
  };
  investments: {
    total: number;
    active: number;
    list: Investment[];
  };
  financings: {
    total: number;
    active: number;
    overdue: number;
    list: Financing[];
  };
  risk: {
    score: number;
    flags: RiskFlag[];
  };
}

// ============================================
// INVESTMENT TYPES
// ============================================
export interface Investment {
  id: string;
  userId: string;
  fciType: string;
  amount: number;
  currentValue: number;
  returnsEarned: number;
  annualRate: number;
  creditLimit: number;
  creditUsed: number;
  status: 'ACTIVE' | 'LIQUIDATED' | 'LIQUIDATED_BY_PENALTY';
  startedAt: string;
  endedAt?: string;
  user?: User;
}

export interface InvestmentReturn {
  id: string;
  investmentId: string;
  returnDate: string;
  baseValue: number;
  rateApplied: number;
  returnAmount: number;
  finalValue: number;
}

export interface InvestmentStats {
  overview: {
    totalInvested: number;
    totalActive: number;
    totalLiquidated: number;
    totalReturnsGenerated: number;
  };
  distribution: {
    uniqueInvestors: number;
    avgPerUser: number;
  };
  recentInvestments: Investment[];
}

// ============================================
// FINANCING TYPES
// ============================================
export interface Financing {
  id: string;
  userId: string;
  investmentId: string;
  amount: number;
  installments: number;
  installmentAmount: number;
  remaining: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'LIQUIDATED';
  startedAt: string;
  nextDueDate?: string;
  user?: User;
  investment?: Investment;
}

export interface Installment {
  id: string;
  financingId: string;
  number: number;
  amount: number;
  penaltyAmount: number;
  totalDue: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'DROPPED';
  paidAt?: string;
}

export interface FinancingStats {
  overview: {
    totalFinanced: number;
    totalActive: number;
    totalCompleted: number;
    totalDebt: number;
  };
  risk: {
    nplRatio: number;
    overdueInstallments: number;
    totalPenalties: number;
  };
  recentFinancings: Financing[];
}

// ============================================
// SETTINGS TYPES
// ============================================
export interface SystemSetting {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description: string;
  updatedAt: string;
}

export interface SettingsHistory {
  id: string;
  settingKey: string;
  oldValue?: string;
  newValue: string;
  reason?: string;
  changedBy?: string;
  createdAt: string;
}

// ============================================
// AUDIT TYPES
// ============================================
export interface AuditLog {
  id: string;
  actorType: 'employee' | 'user' | 'system';
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  resource: string;
  resourceId?: string;
  description: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed' | 'blocked';
  createdAt: string;
}

export interface AuditStats {
  total: number;
  byAction: { action: string; _count: number }[];
  byResource: { resource: string; _count: number }[];
  byStatus: { status: string; _count: number }[];
}

// ============================================
// EMPLOYEE TYPES
// ============================================
export interface Employee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'COMPLIANCE' | 'CUSTOMER_SERVICE' | 'ANALYST';
  status: 'active' | 'inactive';
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
}

// ============================================
// RISK TYPES
// ============================================
export interface RiskFlag {
  id: string;
  userId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'active' | 'resolved';
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
