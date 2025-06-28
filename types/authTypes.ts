// types\authTypes.ts
// Types
export interface UserProfileData {
  id?: number;
  user?: number;
  name?: string;
  profile_picture?: string;
  phone_number?: string;
  joined_date?: string;
}

export interface UserProfile {
  id?: number;
  email?: string;
  role?: string;
  is_verified?: boolean;
  user_profile?: UserProfileData;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  profile?: UserProfile;
  access_token?: string;
  refresh_token?: string;
  is_verified?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string; 
  terms_condition?: boolean; 
}

export interface OtpRequest {
  email: string;
}

export interface OtpVerification {
  email: string;
  otp: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  email: string;
  otp: string;
  new_password: string;
}
