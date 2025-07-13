// Authentication Types for WordPress JWT Integration

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  roles: string[];
  registered_date?: string;
}

export interface AuthToken {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface AuthError {
  code: string;
  message: string;
  data?: {
    status: number;
    [key: string]: any;
  };
}

// JWT Token validation response (actual WordPress format)
export interface JWTValidationResponse {
  code: string;
  data?: {
    status: number;
  };
  message?: string;
}

// WordPress API endpoints for authentication
export interface AuthEndpoints {
  login: '/jwt-auth/v1/token';
  validate: '/jwt-auth/v1/token/validate';
  register: '/auth/v1/register';
  profile: '/auth/v1/profile';
  changePassword: '/auth/v1/change-password';
}

// Context type for authentication provider
export interface AuthContextType {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<void>;
}
