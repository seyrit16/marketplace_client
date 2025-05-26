import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import './Cart.style.scss';
import type { Product } from '../../../models/Product.model';

interface CartItem extends Product {
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
}

interface ShoppingCartProps {
    onBack?: () => void;
    onCheckout?: (items: CartItem[], total: number) => void;
}

const Cart: React.FC<ShoppingCartProps> = ({ onBack, onCheckout }) => {
    // Демонстрационные данные корзины
    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: "1",
            sellerId: "1",
            category: { id: "1", name: "Футболки" },
            name: "Футболка премиум класса с длинным названием для проверки отображения",
            description: "Описание товара",
            price: 1299.34,
            rating: 4.5,
            numberOfPurchases: 128,
            attributes: [],
            images: [
                {
                    fileName: "image1.jpg",
                    url: "http://localhost:8085/files?filename=/products/ee864d5c-25b3-4ecc-bb42-c2bfc27be551/ee864d5c-25b3-4ecc-bb42-c2bfc27be551-7220720778.jpg",
                    sortOrder: 1
                }
            ],
            deleted: false,
            quantity: 2,
            selectedSize: "M",
            selectedColor: "Черный"
        },
        {
            id: "2",
            sellerId: "1",
            category: { id: "1", name: "Футболки" },
            name: "Классическая футболка",
            description: "Описание товара",
            price: 799.23,
            rating: 4.2,
            numberOfPurchases: 84,
            attributes: [],
            images: [
                {
                    fileName: "image2.jpg",
                    url: "http://localhost:8085/files?filename=/products/ee864d5c-25b3-4ecc-bb42-c2bfc27be551/ee864d5c-25b3-4ecc-bb42-c2bfc27be551-7220657026.jpg",
                    sortOrder: 1
                }
            ],
            deleted: false,
            quantity: 1,
            selectedSize: "L"
        },
        {
            id: "3",
            sellerId: "1",
            category: { id: "1", name: "Футболки" },
            name: "Спортивная футболка",
            description: "Описание товара",
            price: 1599.12,
            rating: 4.8,
            numberOfPurchases: 256,
            attributes: [],
            images: [
                {
                    fileName: "image3.jpg",
                    url: "http://localhost:8085/files?filename=/products/ee864d5c-25b3-4ecc-bb42-c2bfc27be551/ee864d5c-25b3-4ecc-bb42-c2bfc27be551-7220683094.jpg",
                    sortOrder: 1
                }
            ],
            deleted: false,
            quantity: 3
        }
    ]);

    // Обновление количества товара
    const updateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(itemId);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    // Удаление товара из корзины
    const removeItem = (itemId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    // Очистка корзины
    const clearCart = () => {
        setCartItems([]);
    };

    // Расчет общей стоимости
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Расчет общего количества товаров
    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    // Обработка оформления заказа
    const handleCheckout = () => {
        if (onCheckout) {
            onCheckout(cartItems, calculateTotal());
        }
    };

    return (
        <div className="shopping-cart">
            {onBack && (
                <div className="back-button-container">
                    <button className="back-button" onClick={onBack}>
                        <ArrowLeft size={20} />
                        <span>Продолжить покупки</span>
                    </button>
                </div>
            )}

            <div className="cart-container">
                <div className="cart-header">
                    <h1 className="cart-title">
                        <ShoppingBag size={32} />
                        Корзина
                    </h1>
                    {cartItems.length > 0 && (
                        <button className="clear-cart-button" onClick={clearCart}>
                            <Trash2 size={18} />
                            Очистить корзину
                        </button>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <ShoppingBag size={80} />
                        <h2>Ваша корзина пуста</h2>
                        <p>Добавьте товары из каталога, чтобы они появились здесь</p>
                        {onBack && (
                            <button className="continue-shopping-button" onClick={onBack}>
                                Перейти к покупкам
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="cart-content">
                            <div className="cart-items">
                                <div className="cart-items-header">
                                    <h3>Товары ({getTotalItems()})</h3>
                                </div>

                                {cartItems.map(item => (
                                    <div key={`${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`} className="cart-item">
                                        <div className="item-image">
                                            <img
                                                src={item.images[0]?.url || '/api/placeholder/100/100'}
                                                alt={item.name}
                                            />
                                        </div>

                                        <div className="item-details">
                                            <h4 className="item-name">{item.name}</h4>
                                            <div className="item-variants">
                                                {item.selectedSize && (
                                                    <span className="variant">Размер: {item.selectedSize}</span>
                                                )}
                                                {item.selectedColor && (
                                                    <span className="variant">Цвет: {item.selectedColor}</span>
                                                )}
                                            </div>
                                            <div className="item-price">
                                                {item.price.toLocaleString()} ₽
                                            </div>
                                        </div>

                                        <div className="item-controls">
                                            <div className="quantity-controls">
                                                <button
                                                    className="quantity-button decrease"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="quantity">{item.quantity}</span>
                                                <button
                                                    className="quantity-button increase"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <div className="item-total">
                                                {(item.price * item.quantity).toLocaleString()} ₽
                                            </div>

                                            <button
                                                className="remove-button"
                                                onClick={() => removeItem(item.id)}
                                                title="Удалить товар"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="cart-summary">
                                <div className="summary-card">
                                    <h3>Итого</h3>

                                    <div className="summary-row">
                                        <span className="summary-label">Товары ({getTotalItems()})</span>
                                        <span className="summary-value">{calculateTotal().toLocaleString()} ₽</span>
                                    </div>

                                    <div className="summary-row">
                                        <span className="summary-label">Доставка</span>
                                        <span className="summary-value free">Бесплатно</span>
                                    </div>

                                    <div className="summary-divider"></div>

                                    <div className="summary-row total">
                                        <span className="summary-label">К оплате</span>
                                        <span className="summary-value">{calculateTotal().toLocaleString()} ₽</span>
                                    </div>

                                    <button
                                        className="checkout-button"
                                        onClick={handleCheckout}
                                    >
                                        Оформить заказ
                                    </button>

                                    <div className="delivery-info">
                                        <p>🚚 Бесплатная доставка от 2000 ₽</p>
                                        <p>⏰ Доставка 1-3 рабочих дня</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Cart;