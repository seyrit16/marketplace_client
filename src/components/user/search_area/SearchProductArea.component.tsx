import React, {useEffect} from 'react';
import "./SearchProduct.style.scss";
import {createDefaultProduct, type Product} from "../../../models/Product.model.ts";
import ProductCard from "../product_card/ProductCard.component.tsx";
import {useNavigate, useParams} from 'react-router-dom';
import {useCatalog} from "../../../context/CatalogContext.tsx";

const SearchProductArea: React.FC = () => {
    const navigate = useNavigate();
    const { categoryId } = useParams<{ categoryId: string }>();
    const {getCategory} = useCatalog();

    const category = categoryId ? getCategory(parseInt(categoryId)) : null;

    useEffect(() => {
        if (category) {
            // тут может быть логика фильтрации товаров по категории
            console.log("Выбрана категория:", category.name);
        }
    }, [category]);

    const products: Product[] = [
        createDefaultProduct(
            1,
            "Футболка 1 обосраться какая крутая супер черная как говно негра выходящая за рамки всего смысла черного",
            299.3,
            4.5,
            128,
            "http://localhost:8085/files?filename=/products/ee864d5c-25b3-4ecc-bb42-c2bfc27be551/ee864d5c-25b3-4ecc-bb42-c2bfc27be551-7220720778.jpg"
        ),
        createDefaultProduct(
            2,
            "Футболка 2",
            599.23,
            5,
            84,
            "http://localhost:8085/files?filename=/products/ee864d5c-25b3-4ecc-bb42-c2bfc27be551/ee864d5c-25b3-4ecc-bb42-c2bfc27be551-7220657026.jpg"
        ),
        createDefaultProduct(
            3,
            "Футболка 3",
            450.21,
            4,
            56,
            "http://localhost:8085/files?filename=/products/ee864d5c-25b3-4ecc-bb42-c2bfc27be551/ee864d5c-25b3-4ecc-bb42-c2bfc27be551-7220683094.jpg"
        ),
        createDefaultProduct(
            4,
            "Футболка 4",
            199.34,
            3.5,
            42,
            "http://localhost:8085/files?filename=/products/ee864d5c-25b3-4ecc-bb42-c2bfc27be551/ee864d5c-25b3-4ecc-bb42-c2bfc27be551-7220720778.jpg"
        ),
        createDefaultProduct(
            5,
            "Футболка 5",
            350.52,
            4.7,
            93,
            "http://localhost:8085/files?filename=/products/ee864d5c-25b3-4ecc-bb42-c2bfc27be551/ee864d5c-25b3-4ecc-bb42-c2bfc27be551-7220657026.jpg"
        ),
        createDefaultProduct(
            6,
            "Футболка 6",
            499.32,
            4.2,
            37,
            "http://localhost:8085/files?filename=/products/ee864d5c-25b3-4ecc-bb42-c2bfc27be551/ee864d5c-25b3-4ecc-bb42-c2bfc27be551-7220683094.jpg"
        ),
        createDefaultProduct(
            7,
            "Футболка 7",
            150.11,
            4.8,
            112,
            "http://localhost:8085/files?filename=/products/ee864d5c-25b3-4ecc-bb42-c2bfc27be551/ee864d5c-25b3-4ecc-bb42-c2bfc27be551-7220720778.jpg"
        ),
        createDefaultProduct(
            8,
            "Футболка 8",
            399.89,
            4.3,
            64,
            "http://localhost:8085/files?filename=/products/ee864d5c-25b3-4ecc-bb42-c2bfc27be551/ee864d5c-25b3-4ecc-bb42-c2bfc27be551-7220657026.jpg"
        ),
    ];

    const handleProductSelect = (product: Product) => {

        navigate(`/product/${product.id}`);
        // if (onProductSelect) {
        //     onProductSelect(<ProductDetailComponent
        //         product={product}
        //         onBack={() => {
        //             if (onProductSelect) {
        //                 onProductSelect(<SearchProductArea onProductSelect={onProductSelect} />);
        //             }
        //         }}
        //     />);
        // }
    };

    return (
        <div className="product-section">
            <div className="product-grid-container">
                <div className="container">
                    <div className="product-grid">
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onProductSelect={handleProductSelect}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchProductArea;