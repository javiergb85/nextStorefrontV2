// /src/utils/vtex-search-utils.ts (Ejemplo de ruta)

/**
 * Define la estructura de entrada de la que se derivan las variables de búsqueda.
 * Adaptada del componente de ejemplo para usar solo strings para los valores de ruta.
 */
export interface SearchInputParams {
  term?: string;
  department?: string;
  category?: string;
  subCategory?: string;
  subCategory2?: string;
  subCategory3?: string;
  subCategory4?: string;
  subCategory5?: string;
  brand?: string;
  collection?: string;
  priceRange?: { from: number | string; to: number | string } | string;
  // Otros filtros de facet podrían ir aquí
  [key: string]: any;
}

/**
 * Construye el 'query' (path de la URL) que VTEX usa para la navegación por categorías y marca.
 * Ej: 'electrodomesticos/televisores/samsung'
 * @param obj Parámetros de entrada de la búsqueda.
 * @returns El path de la ruta de búsqueda.
 */
export const getSearchPath = (obj: SearchInputParams): string => {
  let urlPath = '';

  // La lógica concatena las categorías y la marca.
  if (obj?.department) {
    urlPath += `${obj.department}`;
  }

  if (obj?.category) {
    urlPath += urlPath.length ? `/${obj.category}` : obj.category;
  }

  if (obj?.subCategory) urlPath += `/${obj.subCategory}`;
  if (obj?.subCategory2) urlPath += `/${obj.subCategory2}`;
  if (obj?.subCategory3) urlPath += `/${obj?.subCategory3}`;
  if (obj?.subCategory4) urlPath += `/${obj?.subCategory4}`;
  if (obj?.subCategory5) urlPath += `/${obj?.subCategory5}`;
  if (obj?.brand) urlPath += `/${obj.brand}`;

  // Si hay término de búsqueda (fullText), VTEX lo usa en lugar del path,
  // pero esta función solo construye el path.
  return urlPath;
};

/**
 * Construye el 'fullText' (término de búsqueda libre) para la variable 'query' en GraphQL.
 * @param obj Parámetros de entrada de la búsqueda.
 * @returns El término de búsqueda libre.
 */
export const getQuery = (obj: SearchInputParams): string => {
  // El código de ejemplo usa 'term' para el fullText.
  return obj?.term || '';
};

/**
 * Construye el 'map' que define el significado de cada segmento en la ruta (query).
 * Ej: 'category-1,category-2,brand'
 * @param obj Parámetros de entrada de la búsqueda.
 * @returns La cadena de mapeo (map).
 */
export const getMap = (obj: SearchInputParams): string => {
  const map: string[] = [];

  // Mapeo basado en la jerarquía de categorías
  if (obj?.department) map.push('category-1');
  if (obj?.category) map.push('category-2');
  
  // Asumiendo que subCategory en adelante usan 'category-3'
  if (obj?.subCategory || obj?.subCategory2 || obj?.subCategory3 || obj?.subCategory4 || obj?.subCategory5) {
     // Para evitar duplicados en el array, solo empujamos category-3 si alguna subcategoría existe
     if (!map.includes('category-3')) map.push('category-3');
  }

  // Mapeo para filtros especiales que afectan la ruta
  if (obj?.collection) map.push('productClusterIds');
  if (obj?.brand && !obj.department && !obj.category) map.push('brand'); // Solo si la marca no fue capturada ya en el path

  // Aunque priceRange es un facet, algunos esquemas de VTEX lo incluyen en el map. 
  // Si tu API lo maneja como facet seleccionado, puede no ser necesario aquí.
  // if (obj?.priceRange) map.push('priceRange');

  return map.join(',');
};

/**
 * Construye el array 'selectedFacets' para filtros específicos que no se mapean en la URL (ej: precio, collection).
 * @param obj Parámetros de entrada de la búsqueda.
 * @returns Un array de objetos { key, value }.
 */
export const getSelectedFacets = (
  obj: SearchInputParams
): { key: string; value: string }[] => {
  const selectedFacets: { key: string; value: string }[] = [];

  // Agregar categorías y marca como facets seleccionados (redundancia útil para VTEX)
  if (obj?.department) selectedFacets.push({ key: 'category-1', value: obj.department });
  if (obj?.category) selectedFacets.push({ key: 'category-2', value: obj.category });
  if (obj?.subCategory) selectedFacets.push({ key: 'category-3', value: obj.subCategory });
  if (obj?.subCategory2) selectedFacets.push({ key: 'category-3', value: obj.subCategory2 });
  if (obj?.subCategory3) selectedFacets.push({ key: 'category-3', value: obj.subCategory3 });
  if (obj?.subCategory4) selectedFacets.push({ key: 'category-3', value: obj.subCategory4 });
  if (obj?.subCategory5) selectedFacets.push({ key: 'category-3', value: obj.subCategory5 });
              
  if (obj?.brand) selectedFacets.push({ key: 'brand', value: obj.brand });
  if (obj?.collection) selectedFacets.push({ key: 'productClusterIds', value: obj.collection });

  // Manejo del rango de precio
  if (obj?.priceRange) {
    let rangeString: string;

    if (typeof obj.priceRange === 'string') {
        rangeString = obj.priceRange; // Ej: '100 TO 500'
    } else {
        // Asume que es el objeto {from, to}
        rangeString = `${obj.priceRange.from} TO ${obj.priceRange.to}`; 
    }

    selectedFacets.push({
      key: 'priceRange',
      value: rangeString,
    });
  }

  return selectedFacets;
};