export interface VtexProductDetail {
    data: Data;
}

export interface Data {
    product: VTEXProductClass;
}

export interface VTEXProductClass {
    cacheId:             string;
    productId:           string;
    description:         string;
    productName:         string;
    productReference:    string;
    linkText:            string;
    brand:               string;
    brandId:             number;
    link:                string;
    categoryId:          string;
    categoryTree:        CategoryTree[];
    skuSpecifications:   SkuSpecification[];
    clusterHighlights:   any[];
    productClusters:     ProductCluster[];
    priceRange:          PriceRange;
    properties:          Property[];
    specificationGroups: SpecificationGroup[];
    items:               ProductItem[];
    recommendations:     Recommendations;
}

export interface CategoryTree {
    id:                 number;
    cacheId:            string;
    href:               string;
    slug:               string;
    name:               string;
    titleTag:           string;
    hasChildren:        boolean;
    metaTagDescription: string;
    children?:          CategoryTree[];
}

export interface ProductItem {
    itemId:          string;
    name:            string;
    nameComplete:    string;
    complementName:  string;
    ean:             string;
    sellers:         PurpleSeller[];
    kitItems:        any[];
    variations:      Variation[];
    measurementUnit: MeasurementUnit;
    unitMultiplier:  number;
    images:          PurpleImage[];
}

export interface PurpleImage {
    cacheId:  string;
    imageId:  string;
    imageTag: string;
    imageUrl: string;
}

export enum MeasurementUnit {
    G = "g",
    Un = "un",
}

export interface PurpleSeller {
    sellerId:        string;
    sellerName:      string;
    addToCartLink:   string;
    sellerDefault:   boolean;
    commertialOffer: PurpleCommertialOffer;
}

export interface PurpleCommertialOffer {
    discountHighlights:   any[];
    teasers:              any[];
    Price:                number;
    ListPrice:            number;
    Tax:                  number;
    taxPercentage:        number;
    spotPrice:            number;
    PriceWithoutDiscount: number;
    RewardValue:          number;
    PriceValidUntil:      Date;
    AvailableQuantity:    number;
    Installments:         Installment[];
}

export interface Installment {
    Value:                      number;
    InterestRate:               number;
    TotalValuePlusInterestRate: number;
    NumberOfInstallments:       number;
    Name:                       string;
    PaymentSystemName:          string;
}

export interface Variation {
    name:   string;
    values: string[];
}

export interface PriceRange {
    sellingPrice: Price;
    listPrice:    Price;
}

export interface Price {
    highPrice: number;
    lowPrice:  number;
}

export interface ProductCluster {
    id:   string;
    name: string;
}

export interface Property {
    originalName: string;
    name:         string;
    values:       string[];
}

export interface Recommendations {
    view: View[];
}

export interface View {
    brand:              string;
    brandId:            number;
    cacheId:            string;
    categoryId:         string;
    description:        string;
    link:               string;
    linkText:           string;
    productId:          string;
    productName:        string;
    productReference:   string;
    titleTag:           string;
    metaTagDescription: string;
    jsonSpecifications: string;
    releaseDate:        Date;
    items:              ViewItem[];
    priceRange:         PriceRange;
}

export interface ViewItem {
    itemId:               string;
    name:                 string;
    nameComplete:         string;
    complementName:       string;
    ean:                  string;
    measurementUnit:      MeasurementUnit;
    unitMultiplier:       number;
    estimatedDateArrival: null;
    images:               FluffyImage[];
    sellers:              FluffySeller[];
}

export interface FluffyImage {
    cacheId:    string;
    imageId:    string;
    imageLabel: string;
    imageTag:   string;
    imageUrl:   string;
    imageText:  string;
}

export interface FluffySeller {
    sellerId:        string;
    commertialOffer: FluffyCommertialOffer;
}

export interface FluffyCommertialOffer {
    discountHighlights:   any[];
    AvailableQuantity:    number;
    Price:                number;
    ListPrice:            number;
    PriceWithoutDiscount: number;
    teasers:              any[];
}

export interface SkuSpecification {
    field:  Field;
    values: Field[];
}

export interface Field {
    originalName: string;
    name:         string;
}

export interface SpecificationGroup {
    name:           string;
    originalName:   string;
    specifications: Property[];
}
