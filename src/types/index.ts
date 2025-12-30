// Types for Simply Backoffice

// ============ ENUMS ============

export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  COMPLIANCE_OFFICER = 'compliance_officer',
  CUSTOMER_SUPPORT = 'customer_support',
  FINANCE = 'finance',
  OPERATIONS = 'operations',
  ANALYST = 'analyst',
  AUDITOR = 'auditor'
}

export enum Permission {
  // Usuarios
  VIEW_USERS = 'view_users',
  EDIT_USERS = 'edit_users',
  SUSPEND_USERS = 'suspend_users',
  DELETE_USERS = 'delete_users',
  
  // Transacciones
  VIEW_TRANSACTIONS = 'view_transactions',
  REVERSE_TRANSACTIONS = 'reverse_transactions',
  
  // Compliance
  VIEW_ROS = 'view_ros',
  CREATE_ROS = 'create_ros',
  APPROVE_KYC = 'approve_kyc',
  REJECT_KYC = 'reject_kyc',
  CREATE_RETENTION = 'create_retention',
  VIEW_RETENTIONS = 'view_retentions',
  RELEASE_RETENTION = 'release_retention',
  
  // Soporte
  VIEW_TICKETS = 'view_tickets',
  RESPOND_TICKETS = 'respond_tickets',
  
  // Finanzas
  VIEW_REPORTS = 'view_reports',
  EXPORT_DATA = 'export_data',
  
  // Configuración
  MANAGE_SETTINGS = 'manage_settings',
  MANAGE_EMPLOYEES = 'manage_employees',
  MANAGE_INTEGRATIONS = 'manage_integrations'
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed'
}

export enum KYCStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum UserLevel {
  PLATA = 'plata',
  ORO = 'oro',
  BLACK = 'black',
  DIAMANTE = 'diamante'
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  INVESTMENT = 'investment',
  REDEMPTION = 'redemption',
  TRANSFER = 'transfer',
  PAYMENT = 'payment',
  INSTALLMENT = 'installment'
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERSED = 'reversed'
}

export enum TicketStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum RetentionType {
  JUDICIAL = 'judicial',
  BCRA = 'bcra'
}

export enum RetentionStatus {
  ACTIVE = 'active',
  PARTIAL = 'partial',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum IntegrationType {
  BIND = 'bind',
  DIDIT = 'didit',
  VISA = 'visa',
  STRIPE = 'stripe',
  RAPIPAGO = 'rapipago',
  COELSA = 'coelsa',
  MODO = 'modo',
  ANTHROPIC = 'anthropic'
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}

// ============ INTERFACES ============

export interface Employee {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  permissions: Permission[];
  status: 'active' | 'inactive';
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  dni: string;
  date_of_birth: string;
  
  kyc_status: KYCStatus;
  kyc_level: number;
  
  cvu?: string;
  alias?: string;
  
  user_level: UserLevel;
  status: UserStatus;
  
  created_at: string;
  updated_at: string;
  last_login?: string;
  
  account?: Account;
}

export interface Account {
  id: string;
  user_id: string;
  balance: number;
  available_balance: number;
  invested_amount: number;
  frozen_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description?: string;
  reference?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  
  user?: User;
}

export interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  
  user?: User;
  assignee?: Employee;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  from_user: boolean;
  employee_id?: string;
  content: string;
  created_at: string;
  
  employee?: Employee;
}

export interface Retention {
  id: string;
  user_id: string;
  user_dni: string;
  user_name: string;
  
  type: RetentionType;
  reference_number: string;
  issuing_authority: string;
  order_date: string;
  
  amount_ordered: number;
  amount_retained: number;
  amount_remaining: number;
  
  status: RetentionStatus;
  expiration_date?: string;
  
  documents: RetentionDocument[];
  internal_notes?: string;
  
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  
  user?: User;
  transactions: RetentionTransaction[];
}

export interface RetentionDocument {
  id: string;
  retention_id: string;
  filename: string;
  file_url: string;
  file_type: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface RetentionTransaction {
  id: string;
  retention_id: string;
  transaction_id: string;
  amount_retained: number;
  retained_at: string;
  notes?: string;
}

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  description: string;
  status: IntegrationStatus;
  is_enabled: boolean;
  config: Record<string, any>;
  last_health_check?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_users: number;
  active_users: number;
  pending_kyc: number;
  
  total_transactions_today: number;
  total_volume_today: number;
  
  open_tickets: number;
  
  active_retentions: number;
  total_retained_amount: number;
  
  aum: number;
  revenue_mtd: number;
}

export interface AuditLog {
  id: string;
  employee_id: string;
  employee_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  changes?: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

// ============ API RESPONSES ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ============ FILTERS ============

export interface UserFilters {
  search?: string;
  status?: UserStatus;
  kyc_status?: KYCStatus;
  level?: UserLevel;
  date_from?: string;
  date_to?: string;
}

export interface TransactionFilters {
  search?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface TicketFilters {
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  assigned_to?: string;
}

export interface RetentionFilters {
  search?: string;
  type?: RetentionType;
  status?: RetentionStatus;
  date_from?: string;
  date_to?: string;
}

// ============ ROLE PERMISSIONS MAPPING ============

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission),
  
  [Role.ADMIN]: [
    Permission.VIEW_USERS,
    Permission.EDIT_USERS,
    Permission.SUSPEND_USERS,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_TICKETS,
    Permission.RESPOND_TICKETS,
    Permission.MANAGE_EMPLOYEES,
    Permission.MANAGE_INTEGRATIONS
  ],
  
  [Role.COMPLIANCE_OFFICER]: [
    Permission.VIEW_USERS,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_ROS,
    Permission.CREATE_ROS,
    Permission.APPROVE_KYC,
    Permission.REJECT_KYC,
    Permission.CREATE_RETENTION,
    Permission.VIEW_RETENTIONS,
    Permission.RELEASE_RETENTION,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA
  ],
  
  [Role.CUSTOMER_SUPPORT]: [
    Permission.VIEW_USERS,
    Permission.EDIT_USERS,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_TICKETS,
    Permission.RESPOND_TICKETS
  ],
  
  [Role.FINANCE]: [
    Permission.VIEW_USERS,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA
  ],
  
  [Role.OPERATIONS]: [
    Permission.VIEW_USERS,
    Permission.VIEW_TRANSACTIONS,
    Permission.REVERSE_TRANSACTIONS
  ],
  
  [Role.ANALYST]: [
    Permission.VIEW_USERS,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_REPORTS
  ],
  
  [Role.AUDITOR]: [
    Permission.VIEW_USERS,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_ROS,
    Permission.VIEW_RETENTIONS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA
  ]
};
