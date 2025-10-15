export interface Search {
    data: Data;
}

export interface Data {
    search: SearchClass;
}

export interface SearchClass {
    edges:          SearchEdge[];
    pageInfo:       PageInfo;
    productFilters: ProductFilter[];
    totalCount:     number;
}

export interface SearchEdge {
    cursor: string;
    node:   PurpleNode;
}

export interface PurpleNode {
    id:            string;
    title:         string;
    handle:        string;
    featuredImage: FeaturedImage;
    variants:      Variants;
}

export interface FeaturedImage {
    url: string;
}

export interface Variants {
    edges: VariantsEdge[];
}

export interface VariantsEdge {
    node: FluffyNode;
}

export interface FluffyNode {
    price: Price;
}

export interface Price {
    amount: string;
}

export interface PageInfo {
    hasNextPage: boolean;
    endCursor:   string;
}

export interface ProductFilter {
    id:     string;
    label:  string;
    values: Value[];
}

export interface Value {
    id:    string;
    label: string;
    count: number;
    input: string;
}