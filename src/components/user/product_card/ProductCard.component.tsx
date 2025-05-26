import React, { useState } from 'react';
import { Star} from 'lucide-react';
import "./ProductCard.style.scss"
import SvgSelector from "../../SvgSelector.component.tsx";
import type {Product} from "../../../models/Product.model.ts";

interface ProductCardProps {
    product: Product;
    onProductSelect: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductSelect }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Функция для отображения звезд рейтинга
    const renderRating = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Star key={i} fill="#FFD700" color="#FFD700" size={16} />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <div key={i} className="half-star-container">
                        <Star color="#D3D3D3" size={16} />
                        <div className="half-star-overlay">
                            <Star fill="#FFD700" color="#FFD700" size={16} />
                        </div>
                    </div>
                );
            } else {
                stars.push(<Star key={i} color="#D3D3D3" size={16} />);
            }
        }
        return stars;
    };

    const handleProductClick = () => {
        onProductSelect(product);
    };

    // Use the first image from the array
    const productImage = product.images && product.images.length > 0
        ? product.images[0].url
        : "/api/placeholder/200/300";

    return (
        <div
            className={`product-card ${isHovered ? 'hovered' : ''}`}
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
                <div className="add-to-cart-button">
                    <button onClick={(e) => {
                        e.stopPropagation(); // Prevent product selection when clicking the cart button
                    }}>
                        <SvgSelector id="cart" className="h-6 w-6"/>
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
                <div className="product-rating">
                    <div className="stars">
                        {renderRating(product.rating)}
                    </div>
                    <span className="review-count">({product.numberOfPurchases})</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;