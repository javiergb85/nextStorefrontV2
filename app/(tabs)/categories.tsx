import React from 'react';
import ProductListScreen from '../src/presentation/screens/ProductListScreen';

const CategoriesScreen = () => {
    // Pass default search input or logic to show all categories
    // For now, we reuse ProductListScreen which fetches products
    return (
        <ProductListScreen 
            searchInput={{}} 
            loadNextPage={() => {}} 
        />
    );
};

export default CategoriesScreen;
