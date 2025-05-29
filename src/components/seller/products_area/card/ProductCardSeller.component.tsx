import React, { useState } from 'react';
import {Trash2} from 'lucide-react';
import "./ProductCardSeller.style.scss";
import type {Product} from "../../../../models/Product.model.ts";


interface ProductCardProps {
    product: Product;
    onProductSelect: (product: Product) => void;
}

const ProductCardSeller: React.FC<ProductCardProps> = ({ product, onProductSelect }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleProductClick = () => {
        onProductSelect(product);
    };

    // Use the first image from the array
    const productImage = product.images && product.images.length > 0
        ? product.images[0].url
        : "/api/placeholder/200/300";

    return (
        <div
            className={`product-seller-card ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleProductClick}
            style={{ cursor: 'pointer' }}
        >
            <div className="product-image-container">
                <div
                    className="product-image-blur"
                    style={{ backgroundImage: `url(${productImage})` }}
                ></div>
                <img
                    src={productImage}
                    alt={product.name}
                    className="product-image"
                />
                <div className="delete-button">
                    <button onClick={(e) => {
                        e.stopPropagation();
                    }}>
                        <Trash2 className="text-red-500 mr-3 mt-1" size={24}/>
                    </button>
                </div>
            </div>

            <div className="product-info">
                <div className="product-price">
                    {product.price.toLocaleString()} ₽
                </div>
                <h3 className="product-name">
                    {product.name}
                </h3>
                <div className="number-purchases">
                    <h3 className="h-number-purchases">{"Куплено: \u00A0"} </h3>
                    <span className="span-number-purchases">{product.numberOfPurchases}</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCardSeller;