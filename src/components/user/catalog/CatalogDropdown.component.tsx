// CatalogDropdown.component.tsx
import React, { useState, useEffect, useRef } from 'react';
import './CatalogDropdown.style.scss';
import SvgSelector from "../../SvgSelector.component.tsx";
import {type Category, useCatalog} from "../../../context/CatalogContext.tsx";
import {useNavigate} from "react-router-dom";
//import axios from 'axios';

interface CatalogDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    setCatalog: (catalog: Category) => void;
}

const CatalogDropdown: React.FC<CatalogDropdownProps> = ({ isOpen, onClose, setCatalog }) => {
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const {setCatalog: setGlobalCatalog } = useCatalog();
    const [localCategories, setLocalCategories] = useState<Category[]>([]);
    const [loading] = useState(false);
    const navigate = useNavigate();
    //const [loading, setLoading] = useState(false);

    // При открытии компонента загружаем категории через axios
    useEffect(() => {
        if (isOpen) {
            // Для начала используем локальные данные, а потом заменим их на загрузку с сервера
            setLocalCategories([
                {
                    id: 1,
                    name: "Электроника",
                    subcategories: [
                        {
                            id: 11,
                            name: "Смартфоны и гаджеты",
                            subcategories: [
                                { id: 111, name: "Смартфоны" },
                                { id: 112, name: "Планшеты" },
                                { id: 113, name: "Умные часы" },
                                { id: 114, name: "Аксессуары" }
                            ]
                        },
                        {
                            id: 12,
                            name: "Компьютеры",
                            subcategories: [
                                { id: 121, name: "Ноутбуки" },
                                { id: 122, name: "Настольные ПК" },
                                { id: 123, name: "Мониторы" },
                                { id: 124, name: "Комплектующие" }
                            ]
                        },
                        {
                            id: 13,
                            name: "ТВ и аудио",
                            subcategories: [
                                { id: 131, name: "Телевизоры" },
                                { id: 132, name: "Домашние кинотеатры" },
                                { id: 133, name: "Наушники" },
                                { id: 134, name: "Колонки" }
                            ]
                        }
                    ]
                },
                {
                    id: 2,
                    name: "Одежда и обувь",
                    subcategories: [
                        {
                            id: 21,
                            name: "Мужская одежда",
                            subcategories: [
                                { id: 211, name: "Футболки"},
                                { id: 212, name: "Брюки" },
                                { id: 213, name: "Верхняя одежда" },
                                { id: 214, name: "Обувь" }
                            ]
                        },
                        {
                            id: 22,
                            name: "Женская одежда",
                            subcategories: [
                                { id: 221, name: "Платья" },
                                { id: 222, name: "Блузки" },
                                { id: 223, name: "Брюки и юбки" },
                                { id: 224, name: "Обувь" }
                            ]
                        },
                        {
                            id: 23,
                            name: "Детская одежда",
                            subcategories: [
                                { id: 231, name: "Для мальчиков" },
                                { id: 232, name: "Для девочек" }
                            ]
                        }
                    ]
                },
                {
                    id: 3,
                    name: "Дом и сад",
                    subcategories: [
                        { id: 31, name: "Мебель", subcategories: [] },
                        { id: 32, name: "Посуда", subcategories: [] },
                        { id: 33, name: "Декор", subcategories: [] },
                        { id: 34, name: "Садовые инструменты", subcategories: [] }
                    ]
                },
                {
                    id: 4,
                    name: "Спорт и отдых",
                    subcategories: []
                },
                {
                    id: 5,
                    name: "Красота и здоровье",
                    subcategories: []
                },
                {
                    id: 6,
                    name: "Автотовары",
                    subcategories: []
                }
            ]);

            // Здесь будет запрос к API, когда вы готовы его реализовать
            /*
            setLoading(true);
            axios.get('/api/categories')
                .then(response => {
                    setLocalCategories(response.data);

                    // Обновляем глобальный каталог
                    setGlobalCatalog(prev => ({
                        ...prev,
                        categories: response.data
                    }));
                })
                .catch(error => {
                    console.error('Ошибка при загрузке категорий:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
            */
        }
    }, [isOpen, setGlobalCatalog]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Функция для обработки выбора категории
    const handleCategoryClick = (category: Category) => {
        setCatalog(category); // Локальный обработчик из пропсов

        // Обновляем выбранную категорию в глобальном состоянии
        setGlobalCatalog(prev => ({
            ...prev,
            selectedCategory: category
        }));

        navigate(`/category/${category.id}`);
        //
        // if(setSection){
        //     setSection(<SearchProductArea onProductSelect={(component) => setSection(component)}/>)
        // }

        onClose(); // Закрываем dropdown после выбора
    };

    if (!isOpen) return null;

    return (
        <div className="catalog-dropdown-overlay">
            <div className="catalog-dropdown" ref={dropdownRef}>
                <div className="catalog-content">
                    {loading ? (
                        <div className="loading">Загрузка категорий...</div>
                    ) : (
                        <>
                            <div className="categories-list">
                                {localCategories.map(category => (
                                    <div
                                        key={category.id}
                                        className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(category.id)}
                                        onMouseEnter={() => setActiveCategory(category.id)}
                                    >
                                        <span>{category.name}</span>
                                        {category.subcategories && category.subcategories.length > 0 && (
                                            <SvgSelector id="chevron-right" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {activeCategory !== null && (
                                <div className="subcategories-container">
                                    {localCategories.find(cat => cat.id === activeCategory)?.subcategories?.map(subcat => (
                                        <div key={subcat.id} className="subcategory-group">
                                            <h3 className="subcategory-title">{subcat.name}</h3>
                                            {subcat.subcategories && subcat.subcategories.length > 0 && (
                                                <ul className="subcategory-items">
                                                    {subcat.subcategories.map(item => (
                                                        <li key={item.id}>
                                                            <a onClick={() => handleCategoryClick(item)}>{item.name}</a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CatalogDropdown;