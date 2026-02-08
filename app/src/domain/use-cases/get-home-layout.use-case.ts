import { HomeLayout } from "../entities/home-layout";
import { CMSRepository } from "../repositories/cms.repository";

export class GetHomeLayoutUseCase {
    constructor(private cmsRepository: CMSRepository) {}

    async execute(): Promise<HomeLayout> {
        return this.cmsRepository.getHomeLayout();
    }
}
