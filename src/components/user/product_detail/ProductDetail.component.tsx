import React, {useEffect, useState} from 'react';
import {ArrowLeft, Star} from 'lucide-react';
import SvgSelector from '../../SvgSelector.component.tsx';
import './ProductDetail.style.scss';
import {createDefaultProduct, type ProductAttrVal} from "../../../models/Product.model.ts";
import {useNavigate, useParams} from "react-router-dom";
import {createMockSeller, type Seller} from "../../../models/Seller.model.ts";


const ProductDetailComponent: React.FC = () => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showFullTitle, setShowFullTitle] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [seller, setSeller] = useState<Seller | null>(null);

    const [showFullSellerDescription, setShowFullSellerDescription] = useState(false);
    const {id} = useParams();
    const navigate = useNavigate();

    const nameSlice = 40;
    const descriptionSlice = 500;
    const sellerDescriptionSlice = 300;
    const product = createDefaultProduct(
        1,
        "Футболка 1 обосраться какая крутая супер черная как говно негра выходящая за рамки всего смысла черного",
        299.3,
        4.5,
        128,
        "http://localhost:8085/files?filename=/products/ee864d5c-25b3-4ecc-bb42-c2bfc27be551/ee864d5c-25b3-4ecc-bb42-c2bfc27be551-7220720778.jpg"
    )

    useEffect(() => {
        console.log(id);
        // Имитация получения данных о продавце
        const mockSeller = createMockSeller();
        setSeller(mockSeller);
    }, []);

    // Group attributes by their group name
    const groupedAttributes = product.attributes.reduce((groups, attr) => {
        if (!groups[attr.group]) {
            groups[attr.group] = [];
        }
        groups[attr.group].push(attr);
        return groups;
    }, {} as Record<string, ProductAttrVal[]>);

    // Get the currently selected image
    const currentImage = product.images[selectedImageIndex]?.url || '/api/placeholder/400/400';

    // Function to render rating stars
    const renderRating = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Star key={i} fill="#FFD700" color="#FFD700" size={20}/>);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <div key={i} className="half-star-container">
                        <Star color="#D3D3D3" size={20}/>
                        <div className="half-star-overlay">
                            <Star fill="#FFD700" color="#FFD700" size={20}/>
                        </div>
                    </div>
                );
            } else {
                stars.push(<Star key={i} color="#D3D3D3" size={20}/>);
            }
        }
        return stars;
    };

    // Toggle description expansion
    const toggleDescription = () => setShowFullDescription(!showFullDescription);

    return (
        <div className="product-detail">
            <div className="back-button-container">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20}/>
                    <span>Назад к каталогу</span>
                </button>
            </div>

            <div className="product-detail-container">
                {/* Left side - Images */}
                <div className="product-images">
                    <div className="main-image-container">
                        <div
                            className="main-image-blur"
                            style={{backgroundImage: `url(${currentImage})`}}
                        ></div>
                        <img
                            src={currentImage}
                            alt={product.name}
                            className="main-image"
                        />
                    </div>

                    {product.images.length > 1 && (
                        <div className="thumbnail-container">
                            {product.images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImageIndex(index)}
                                >
                                    <img src={image.url} alt={`Thumbnail ${index + 1}`}/>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right side - Product info */}
                <div className="product-info">
                    <div className="product-title-wrapper">
                        <h1 className="product-title">
                            {showFullTitle || product.name.length <= nameSlice
                                ? product.name
                                : `${product.name.slice(0, nameSlice)}...`}
                        </h1>
                        {product.name.length > 60 && (
                            <button className="expand-btn" onClick={() => setShowFullTitle(!showFullTitle)}>
                                {showFullTitle ? 'Свернуть' : 'Подробнее'}
                            </button>
                        )}
                    </div>

                    <div className="product-meta">
                        <div className="product-rating">
                            <div className="stars">
                                {renderRating(product.rating)}
                            </div>
                            <span className="rating-value">{product.rating.toFixed(1)}</span>
                        </div>

                        <div className="product-purchases">
                            <span className="purchase-count">{product.numberOfPurchases} покупок</span>
                        </div>

                    </div>

                    <div className="product-price">
                        {product.price.toLocaleString()} ₽
                    </div>

                    <div className="product-actions">
                        <button className="add-to-cart">
                            <SvgSelector id="cart" className="h-6 w-6"/>
                            Добавить в корзину
                        </button>
                    </div>
                </div>
                <div className="product-description">
                    <h3>Описание</h3>
                    <div className={`description-content ${showFullDescription ? 'expanded' : ''}`}>
                        {showFullDescription || product.description.length <= descriptionSlice
                            ? product.description
                            : `${product.description.slice(0, descriptionSlice)}...`}
                    </div>
                    {product.description.length > descriptionSlice && (
                        <button className="expand-btn" onClick={toggleDescription}>
                            {showFullDescription ? 'Свернуть' : 'Подробнее'}
                        </button>
                    )}
                </div>
            </div>

            {/* Product attributes */}
            {Object.keys(groupedAttributes).length > 0 && (
                <div className="product-attributes">
                    <h2>Характеристики</h2>

                    <div className="attribute-group">
                        <div className="attribute-list">
                            <div className="attribute-item">
                                <span className="attribute-name">Категория</span>
                                <span className="attribute-value">{product.category.name}</span>
                            </div>
                        </div>
                    </div>
                    {Object.entries(groupedAttributes).map(([group, attrs]) => (
                        <div key={group} className="attribute-group">
                            <h3>{group}</h3>
                            <div className="attribute-list">
                                {attrs.map((attr, index) => (
                                    <div key={index} className="attribute-item">
                                        <span className="attribute-name">{attr.name}</span>
                                        <span className="attribute-value">{attr.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Seller Info */}
            {seller && (
                <div className="seller-info">
                    <h3>О продавце: {seller?.sellerProfile.shortCompanyName}</h3>
                    <div className="seller-flex-container">
                        {/* Левая часть — мета */}
                        <div className="seller-meta">
                            <div><strong>Компания:</strong> {seller?.sellerProfile.fullCompanyName}</div>
                            <div><strong>Контакт:</strong> {seller?.personDetail.surname} {seller?.personDetail.name} {seller?.personDetail.patronimyc}</div>
                            <div><strong>Телефон:</strong> {seller?.personDetail.phoneNumber}</div>
                            <div><strong>Email:</strong> {seller?.email}</div>
                        </div>

                        {/* Правая часть — описание */}
                        <div className="seller-description">

                            <h3>Описание</h3>
                            <div className={`seller-description-content ${showFullSellerDescription ? 'expanded' : ''}`}>
                                {showFullSellerDescription || seller?.sellerProfile.description.length <= sellerDescriptionSlice
                                    ? seller?.sellerProfile.description
                                    : `${seller?.sellerProfile.description.slice(0, sellerDescriptionSlice)}...`}
                            </div>
                            {seller?.sellerProfile.description.length > sellerDescriptionSlice && (
                                <button className="expand-btn" onClick={() => setShowFullSellerDescription(!showFullSellerDescription)}>
                                    {showFullSellerDescription ? 'Свернуть' : 'Подробнее'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )
            }
        </div>
    );
};

export default ProductDetailComponent;