// src/domain/repositories/auth.repository.ts

export interface AuthRepository {
  login(email: string, password: string): Promise<string>;
  getUserProfile(email: string): Promise<any>;
}