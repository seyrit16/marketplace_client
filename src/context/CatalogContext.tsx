// context/CatalogContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface SubCategory {
    id: number;
    name: string;
    subcategories?: SubCategory[];
}

export interface Category {
    id: number;
    name: string;
    subcategories?: SubCategory[];
}

export interface Catalog {
    categories: Category[];
    selectedCategory?: Category | null;
}

interface CatalogContextProps {
    catalog: Catalog;
    setCatalog: React.Dispatch<React.SetStateAction<Catalog>>;

    getCategory: (id: number) => Category | undefined;
    updateCategory: (category: Category) => void;
    addCategory: (category: Category) => void;
    removeCategory: (id: number) => void;
}

const STORAGE_KEY = 'app_catalog';

// Начальное значение каталога
const initialCatalog: Catalog = {
    categories: [],
    selectedCategory: null
};

const CatalogContext = createContext<CatalogContextProps | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [catalog, setCatalog] = useState<Catalog>(() => {
        const storedCatalog = sessionStorage.getItem(STORAGE_KEY);
        return storedCatalog ? JSON.parse(storedCatalog) : initialCatalog;
    });

    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
    }, [catalog]);

    const getCategory = (id: number): Category | undefined => {
        const findCategoryRecursive = (
            categories: Category[] | SubCategory[] | undefined,
            targetId: number
        ): Category | SubCategory | undefined => {
            if (!categories) return undefined;

            for (const category of categories) {
                if (category.id === targetId) {
                    return category;
                }

                const foundInSubcategories = findCategoryRecursive(category.subcategories, targetId);
                if (foundInSubcategories) {
                    return foundInSubcategories;
                }
            }

            return undefined;
        };

        return findCategoryRecursive(catalog.categories, id) as Category | undefined;
    };

    // Обновление существующей категории
    const updateCategory = (updatedCategory: Category) => {
        setCatalog(prevCatalog => {
            const newCatalog = JSON.parse(JSON.stringify(prevCatalog)) as Catalog;

            const updateCategoryRecursive = (
                categories: Category[] | SubCategory[] | undefined,
                targetId: number,
                updated: Category | SubCategory
            ): boolean => {
                if (!categories) return false;

                for (let i = 0; i < categories.length; i++) {
                    if (categories[i].id === targetId) {
                        categories[i] = updated;
                        return true;
                    }

                    if (updateCategoryRecursive(categories[i].subcategories, targetId, updated)) {
                        return true;
                    }
                }

                return false;
            };

            updateCategoryRecursive(newCatalog.categories, updatedCategory.id, updatedCategory);
            return newCatalog;
        });
    };

    // Добавление новой категории верхнего уровня
    const addCategory = (newCategory: Category) => {
        setCatalog(prevCatalog => ({
            ...prevCatalog,
            categories: [...prevCatalog.categories, newCategory]
        }));
    };

    // Удаление категории по ID
    const removeCategory = (id: number) => {
        setCatalog(prevCatalog => {
            const newCatalog = JSON.parse(JSON.stringify(prevCatalog)) as Catalog;

            const removeCategoryRecursive = (
                categories: Category[] | SubCategory[] | undefined,
                targetId: number
            ): boolean => {
                if (!categories) return false;

                for (let i = 0; i < categories.length; i++) {
                    if (categories[i].id === targetId) {
                        categories.splice(i, 1);
                        return true;
                    }

                    if (removeCategoryRecursive(categories[i].subcategories, targetId)) {
                        return true;
                    }
                }

                return false;
            };

            removeCategoryRecursive(newCatalog.categories, id);
            return newCatalog;
        });
    };

    return (
        <CatalogContext.Provider
            value={{
                catalog,
                setCatalog,
                getCategory,
                updateCategory,
                addCategory,
                removeCategory
            }}
        >
            {children}
        </CatalogContext.Provider>
    );
};

export const useCatalog = () => {
    const context = useContext(CatalogContext);
    if (!context) {
        throw new Error('useCatalog must be used within a CatalogProvider');
    }
    return context;
};