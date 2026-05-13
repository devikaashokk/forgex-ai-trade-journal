// client/src/features/auth/auth.api.ts
import api from "@/lib/api";
import { User } from "@/types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<{ success: boolean; data: AuthResponse }>("/auth/register", payload);
  return data.data!;
}

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<{ success: boolean; data: AuthResponse }>("/auth/login", payload);
  return data.data!;
}

export async function getMeApi(): Promise<User> {
  const { data } = await api.get<{ success: boolean; data: { user: User } }>("/auth/me");
  return data.data!.user;
}
