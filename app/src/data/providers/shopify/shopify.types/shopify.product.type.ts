export interface ShopifyProductDetail {
    data: Data;
}

export interface Data {
    product: ShopifyProductClass;
}

export interface ShopifyProductClass {
    id:               string;
    title:            string;
    handle:           string;
    descriptionHtml:  string;
    tags:             string[];
    vendor:           string;
    productType:      string;
    availableForSale: boolean;
    createdAt:        Date;
    updatedAt:        Date;
    images:           Images;
    variants:         Variants;
}

export interface Images {
    edges: ImagesEdge[];
}

export interface ImagesEdge {
    node: PurpleNode;
}

export interface PurpleNode {
    url:     string;
    altText: null;
}

export interface Variants {
    edges: VariantsEdge[];
}

export interface VariantsEdge {
    node: FluffyNode;
}

export interface FluffyNode {
    id:                string;
    title:             string;
    sku:               null;
    availableForSale:  boolean;
    quantityAvailable: number;
    selectedOptions:   SelectedOption[];
    price:             Price;
    compareAtPrice:    Price;
}

export interface Price {
    amount:       string;
    currencyCode: string;
}

export interface SelectedOption {
    name:  string;
    value: string;
}