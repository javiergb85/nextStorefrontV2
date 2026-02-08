import { AuthRepository } from '../repositories/auth.repository';

export class GetUserAddressesUseCase {
  constructor(private authRepository: AuthRepository) {}

  async    execute(email: string, userId?: string): Promise<any[]> {
        return this.authRepository.getUserAddresses(email, userId);
    }
}
