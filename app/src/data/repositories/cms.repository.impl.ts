import { HomeLayout } from "../../domain/entities/home-layout";
import { CMSRepository } from "../../domain/repositories/cms.repository";
import { CMSAdapter } from "../adapters/cms.adapter";
import { DEFAULT_HOME_LAYOUT } from "../sources/default-home-data";

export class CMSRepositoryImpl implements CMSRepository {
    async getHomeLayout(): Promise<HomeLayout> {
        // Simulate API Call
        // In a real app, this would be: 
        // const response = await fetch('cms-endpoint');
        // const data = await response.json();
        
        const data = null; // Simulating no API response for now to trigger default

        if (!data) {
            return DEFAULT_HOME_LAYOUT;
        }

        return CMSAdapter.normalize(data);
    }
}
