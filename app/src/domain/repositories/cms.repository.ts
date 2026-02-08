import { HomeLayout } from "../entities/home-layout";

export interface CMSRepository {
    getHomeLayout(): Promise<HomeLayout>;
}
