// src/domain/use-cases/login.usecase.ts

import { AuthRepository } from '../repositories/auth.repository';

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string, password: string): Promise<string> {
    try {
      // El caso de uso solo llama al repositorio de autenticación
    
      const accessToken = await this.authRepository.login(email, password);
 
      return accessToken;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unexpected error occurred during login.');
    }
  }
}