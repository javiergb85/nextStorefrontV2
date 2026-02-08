export interface FacetValue {
  id: string | null;
  name: string;
  key: string;
  value: string | null;
  quantity: number;
  selected: boolean;
  href: string | null;
  range?: {
    from: number;
    to: number;
  } | null;
}

export interface Facet {
  name: string;
  values: FacetValue[];
}
