import { HomeLayout } from "../../domain/entities/home-layout";
import { DEFAULT_HOME_LAYOUT } from "../sources/default-home-data";

export class CMSAdapter {
    static normalize(data: any): HomeLayout {
        // Middleware logic:
        // 1. Validation
        // 2. Transformation
        // 3. Defaults
        
        if (!data) {
            return DEFAULT_HOME_LAYOUT;
        }

        // TODO: Here we would map different CMS structures to our HomeLayout
        // For now, we assume the data matches our structure or we fallback
        try {
            // Placeholder for real normalization logic
            // validation logic could go here
            return data as HomeLayout; 
        } catch (error) {
            console.warn('Failed to normalize CMS data, using default:', error);
            return DEFAULT_HOME_LAYOUT;
        }
    }
}
