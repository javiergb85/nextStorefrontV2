// src/data/providers/shopify.types.ts
export interface ShopifyProducts {
    data: Data;
}

export interface Data {
    products: ProductsClass;
}

export interface ProductsClass {
    edges: ProductsEdge[];
}

export interface ProductsEdge {
    node: PurpleNode;
}

export interface PurpleNode {
    id: string;
    title: string;
    handle: string;
    descriptionHtml: string;
    tags: string[];
    vendor: string;
    productType: string;
    availableForSale: boolean;
    createdAt: Date;
    updatedAt: Date;
    images: Images;
    variants: Variants;
}

export interface Images {
    edges: ImagesEdge[];
}

export interface ImagesEdge {
    node: FluffyNode;
}

export interface FluffyNode {
    url: string;
    altText: null;
}

export interface Variants {
    edges: VariantsEdge[];
}

export interface VariantsEdge {
    node: TentacledNode;
}

export interface TentacledNode {
    id: string;
    title: string;
    sku: null | string;
    availableForSale: boolean;
    quantityAvailable: number;
    selectedOptions: SelectedOption[];
    price: Price;
    compareAtPrice: Price | null;
}

export interface Price {
    amount: string;
    currencyCode: CurrencyCode;
}

export enum CurrencyCode {
    Cop = "COP",
}

export interface SelectedOption {
    name: Name;
    value: string;
}

export enum Name {
    Color = "Color",
    Size = "Size",
    Title = "Title",
}




