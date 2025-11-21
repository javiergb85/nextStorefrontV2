import { AuthRepository } from '../repositories/auth.repository';

export class GetUserProfileUseCase {
  constructor(private repository: AuthRepository) {}

  async execute(email: string): Promise<any> {
    return this.repository.getUserProfile(email);
  }
}
