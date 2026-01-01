import React from 'react';
import { Shield, UserCog, FileCheck, Headphones, BarChart } from 'lucide-react';

export type EmployeeRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'COMPLIANCE' 
  | 'CUSTOMER_SERVICE' 
  | 'ANALYST';

export interface RoleSelectorProps {
  value: EmployeeRole;
  onChange: (role: EmployeeRole) => void;
  allowedRoles?: EmployeeRole[];
  disabled?: boolean;
  error?: string;
}

const roleInfo: Record<EmployeeRole, { 
  label: string; 
  description: string;
  icon: React.ReactNode;
  color: string;
}> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    description: 'Acceso total al sistema',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-purple-600'
  },
  ADMIN: {
    label: 'Administrador',
    description: 'Gestión de usuarios y empleados',
    icon: <UserCog className="w-5 h-5" />,
    color: 'text-blue-600'
  },
  COMPLIANCE: {
    label: 'Compliance',
    description: 'KYC y verificaciones',
    icon: <FileCheck className="w-5 h-5" />,
    color: 'text-green-600'
  },
  CUSTOMER_SERVICE: {
    label: 'Atención al Cliente',
    description: 'Soporte y tickets',
    icon: <Headphones className="w-5 h-5" />,
    color: 'text-orange-600'
  },
  ANALYST: {
    label: 'Analista',
    description: 'Visualización y reportes',
    icon: <BarChart className="w-5 h-5" />,
    color: 'text-indigo-600'
  }
};

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  allowedRoles,
  disabled = false,
  error
}) => {
  const roles = allowedRoles || Object.keys(roleInfo) as EmployeeRole[];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Rol del Empleado
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {roles.map((role) => {
          const info = roleInfo[role];
          const isSelected = value === role;
          
          return (
            <button
              key={role}
              type="button"
              disabled={disabled}
              onClick={() => onChange(role)}
              className={`
                relative flex items-start p-4 border rounded-lg transition-all
                ${isSelected 
                  ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600' 
                  : 'border-gray-300 bg-white hover:border-gray-400'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className={`flex-shrink-0 ${info.color}`}>
                {info.icon}
              </div>
              
              <div className="ml-3 flex-1 text-left">
                <p className={`text-sm font-medium ${
                  isSelected ? 'text-indigo-900' : 'text-gray-900'
                }`}>
                  {info.label}
                </p>
                <p className={`text-xs ${
                  isSelected ? 'text-indigo-700' : 'text-gray-500'
                }`}>
                  {info.description}
                </p>
              </div>
              
              {isSelected && (
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Select dropdown version (más compacto)
export const RoleSelectDropdown: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  allowedRoles,
  disabled = false,
  error
}) => {
  const roles = allowedRoles || Object.keys(roleInfo) as EmployeeRole[];

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        Rol
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as EmployeeRole)}
        disabled={disabled}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {roleInfo[role].label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
