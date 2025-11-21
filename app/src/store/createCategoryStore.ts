import { create } from 'zustand';

interface Category {
    id: number;
    name: string;
    url: string;
    hasChildren: boolean;
    children: Category[];
}

interface CategoryState {
    categories: Category[];
    isLoading: boolean;
    error: string | null;
    fetchCategories: () => Promise<void>;
}

export const createCategoryStore = (provider: any) => create<CategoryState>((set) => ({
    categories: [],
    isLoading: false,
    error: null,
    fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            // We access the provider directly here. Ideally this should be a UseCase.
            // But for simplicity and following the pattern of direct provider access in some parts:
            // We need to ensure the provider has fetchCategories.
            if (!provider.fetchCategories) {
                 throw new Error("Provider does not support fetchCategories");
            }
            const categories = await provider.fetchCategories();
            set({ categories, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },
}));
