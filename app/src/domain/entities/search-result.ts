import { Facet } from "./facet";
import { Product } from "./product";

export interface SearchResult {
  products: Product[];
  facets: Facet[];
  totalCount: number;
}
