export interface Products {
    data: Data;
}

export interface Data {
    productSearch: ProductSearch;
    facets: Facets;
}

export interface Facets {
    facets: Facet[];
}

export interface Facet {
    name: string;
    values: Value[];
}

export interface Value {
    id: null | string;
    quantity: number;
    name: string;
    key: string;
    value: null | string;
    selected: boolean;
    range: Range | null;
    link: null;
    linkEncoded: null;
    href: null | string;
}

export interface Range {
    from: number;
    to: number;
}

export interface ProductSearch {
    products: Product[];
    recordsFiltered: number;
}

export interface Product {
    cacheId: string;
    productId: string;
    description: string;
    productName: string;
    productReference: string;
    linkText: string;
    brand: string;
    brandId: number;
    link: string;
    categories: string[];
    categoryId: string;
    clusterHighlights: any[];
    productClusters: ProductCluster[];
    categoryTree: CategoryTree[];
    priceRange: PriceRange;
    specificationGroups: SpecificationGroup[];
    skuSpecifications: any[];
    items: Item[];
    selectedProperties: null;
}

export interface CategoryTree {
    cacheId: string;
    href: string;
    slug: string;
    id: number;
    name: string;
    titleTag: string;
    hasChildren: boolean;
    metaTagDescription: string;
    children?: CategoryTree[];
}

export interface Item {
    itemId: string;
    name: string;
    nameComplete: string;
    complementName: string;
    ean: string;
    variations: any[];
    referenceId: ReferenceID[];
    measurementUnit: string;
    unitMultiplier: number;
    images: Image[];
    kitItems: any[];
    sellers: Seller[];
}

export interface Image {
    cacheId: string;
    imageId: string;
    imageLabel: string;
    imageTag: string;
    imageUrl: string;
    imageText: string;
}

export interface ReferenceID {
    Key: string;
    Value: string;
}

export interface Seller {
    commertialOffer: CommertialOffer;
    sellerId: string;
    sellerName: string;
    sellerDefault: boolean;
}

export interface CommertialOffer {
    teasers: any[];
    discountHighlights: any[];
    Price: number;
    ListPrice: number;
    Tax: number;
    taxPercentage: number;
    spotPrice: number;
    PriceWithoutDiscount: number;
    RewardValue: number;
    PriceValidUntil: Date;
    AvailableQuantity: number;
    Installments: Installment[];
}

export interface Installment {
    Value: number;
    InterestRate: number;
    TotalValuePlusInterestRate: number;
    NumberOfInstallments: number;
    Name: string;
    PaymentSystemName: string;
}

export interface PriceRange {
    sellingPrice: Price;
    listPrice: Price;
}

export interface Price {
    highPrice: number;
    lowPrice: number;
}

export interface ProductCluster {
    id: string;
    name: string;
}

export interface SpecificationGroup {
    name: string;
    originalName: string;
    specifications: Specification[];
}

export interface Specification {
    name: string;
    originalName: string;
    values: string[];
}



export interface ProductFetchInput {
    query?: string;
    fullText?: string;
    map?: string;
    selectedFacets?: { key: string; value: string }[];
    orderBy?: string;
    priceRange?: string;
    from?: number; // Índice inicial (paginación)
    to?: number; // Índice final (paginación)
    collection?: string;
}