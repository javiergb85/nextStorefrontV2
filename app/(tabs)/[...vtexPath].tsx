// src/app/search/[...vtexPath].tsx

import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
// Importamos el componente visual (ProductListScreen)
import ProductListScreen from '../src/presentation/screens/ProductListScreen';

// Importamos el StorefrontProvider para obtener los utils (si no está ya en tu archivo principal)
// Aunque ProductListScreen ya usa useStorefront(), es buena práctica de tipado.
import { useStorefront } from '../src/context/storefront.context';


/**
 * Este componente es el Wrapper de la ruta.
 * Su única tarea es extraer los parámetros de la URL
 * y pasarlos de forma limpia al componente visual ProductListScreen.
 */
const PAGE_SIZE = 10; // Define el tamaño de la página

export default function SearchPage() {
  const params = useLocalSearchParams();
  console.log("SearchPage params:", JSON.stringify(params));

  const [orderBy, setOrderBy] = useState<string>((params.orderBy as string) || 'OrderByPriceDESC');
  const [selectedFacetsState, setSelectedFacetsState] = useState<{ key: string; value: string }[]>([]);
  
  // 💡 1. Manejo del estado de paginación local
  // 'from' se inicializa con el valor que venga de los params (si existe) o 0
  const initialFrom = Number(params.from) || 0;
  const initialTo = Number(params.to) || PAGE_SIZE - 1; // Primer página de 0 a 9
  
  const [pagination, setPagination] = useState({
    from: initialFrom,
    to: initialTo,
  });

  // 💡 2. Función para cargar la siguiente página
  const loadNextPage = React.useCallback(() => {
    // Incrementa el rango para la siguiente solicitud
    setPagination(prev => ({
      from: prev.to + 1,
      to: prev.to + PAGE_SIZE, // 10 productos más
    }));
  }, []);

  const handleToggleFacet = React.useCallback((facet: any) => {
    setSelectedFacetsState(prev => {
      const exists = prev.find(f => f.key === facet.key && f.value === facet.value);
      if (exists) {
        return prev.filter(f => !(f.key === facet.key && f.value === facet.value));
      } else {
        return [...prev, { key: facet.key, value: facet.value }];
      }
    });
    // Al filtrar, siempre reseteamos la paginación
    setPagination({ from: 0, to: PAGE_SIZE - 1 });
  }, []);

  const handleClearAllFacets = React.useCallback(() => {
    setSelectedFacetsState([]);
    setPagination({ from: 0, to: PAGE_SIZE - 1 });
  }, []);
  
  // 💡 2.5 RESET PAGINATION ON NAVIGATION
  // When navigating to a new category/search, we MUST reset pagination to 0.
  // Otherwise, if the component is reused, we might request page 2 of the new category.
  const searchKey = JSON.stringify({
    path: params.vtexPath,
    map: params.map,
    term: params.term,
    dept: params.department,
    cat: params.category
  });

  React.useEffect(() => {
      console.log("Route changed, resetting pagination and sort. Key:", searchKey);
      setPagination({
          from: 0,
          to: PAGE_SIZE - 1
      });
      setOrderBy((params.orderBy as string) || 'OrderByPriceDESC');
      setSelectedFacetsState([]); // Opcional: ¿Resetear filtros al cambiar de categoría? Normalmente sí en VTEX navigation.
  }, [searchKey]);
  
  const pathSegments = params.vtexPath as string[] | undefined; 
  const { utils } = useStorefront();
  const { getSearchPath, getMap, getSelectedFacets, getQuery } = utils.vtexSearch;
  
  const searchInput = React.useMemo(() => {
    
    const vtexInput = { ...params };
    // Si no hay un término de búsqueda, construimos la ruta a partir de los segmentos.
    // Si hay un 'term', la búsqueda por texto libre tiene prioridad.
    if (pathSegments && !params.term) {
      vtexInput.department = pathSegments[0];
      vtexInput.category = pathSegments[1];
      vtexInput.subCategory = pathSegments[2];
      vtexInput.brand = pathSegments[3]; 
    }
     
    // Construir el objeto ProductFetchInput final

    // Construir el objeto ProductFetchInput final
    console.log("Constructing searchInput with vtexInput:", JSON.stringify(vtexInput));

    const generatedInput = {
      query: getSearchPath(vtexInput),
      fullText: getQuery(vtexInput),
      map: getMap(vtexInput),
      orderBy: orderBy,
      from: pagination.from,
      to: pagination.to,
      selectedFacets: [...getSelectedFacets(vtexInput), ...selectedFacetsState],
    };

    console.log("Final searchInput:", JSON.stringify(generatedInput));
    return generatedInput;
    // 💡 IMPORTANTE: 'pagination' es una dependencia. El useMemo se recalculará cuando cambie.
  }, [params, pathSegments, getSearchPath, getMap, getSelectedFacets, getQuery, pagination]); 
  
  // 💡 4. Pasamos la función 'loadNextPage' y el 'searchInput' al componente visual
  return (
    <ProductListScreen 
      searchInput={searchInput} 
      loadNextPage={loadNextPage}
      orderBy={orderBy}
      onOrderByChange={setOrderBy}
      onToggleFacet={handleToggleFacet}
      onClearAllFacets={handleClearAllFacets}
    />
  );
}