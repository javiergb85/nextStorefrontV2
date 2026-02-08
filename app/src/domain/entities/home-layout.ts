export interface BannerItem {
    id: string;
    title: string;
    subtitle: string;
    buttonText: string;
    image: string;
    backgroundColor: string;
    textColor: string;
    link?: string;
}

export interface CategoryItem {
    id: string;
    name: string;
    iconName: string;
    image?: string;
    link?: string;
}

export interface ProductItem {
    id: string;
    name: string;
    price?: number;
    image: string;
    link?: string;
}

export type HomeSection = 
    | { type: 'hero-slider'; items: BannerItem[] }
    | { type: 'categories'; items: CategoryItem[] }
    | { type: 'featured-products'; title: string; items: ProductItem[] };

export interface HomeLayout {
    sections: HomeSection[];
}
