import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {createDefaultProduct, type ProductAttrVal} from "../../../models/Product.model.ts";
import {Trash2, Edit, Save, X, Plus} from "lucide-react";
import "./ProductDetailSeller.style.scss"

const ProductDetailSeller: React.FC = () => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showFullTitle, setShowFullTitle] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isAddGroup, setIsAddGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    const [originalProduct] = useState(createDefaultProduct(
        1,
        "Футболка 1 обосраться какая крутая супер черная как говно негра выходящая за рамки всего смысла черного",
        299.3,
        4.5,
        128,
        "http://localhost:8085/files?filename=/products/ee864d5c-25b3-4ecc-bb42-c2bfc27be551/ee864d5c-25b3-4ecc-bb42-c2bfc27be551-7220720778.jpg"
    ));

    const [editedProduct, setEditedProduct] = useState(originalProduct);

    const {id} = useParams();

    const nameSlice = 40;
    const descriptionSlice = 500;
    const product = editedProduct;

    useEffect(() => {
        console.log(id);
    }, []);


    // Функция для глубокого сравнения объектов
    const deepEqual = (obj1: any, obj2: any): boolean => {
        if (obj1 === obj2) return true;

        if (obj1 == null || obj2 == null) return false;

        if (typeof obj1 !== typeof obj2) return false;

        if (typeof obj1 !== 'object') return obj1 === obj2;

        if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

        if (Array.isArray(obj1)) {
            if (obj1.length !== obj2.length) return false;
            for (let i = 0; i < obj1.length; i++) {
                if (!deepEqual(obj1[i], obj2[i])) return false;
            }
            return true;
        }

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        for (let key of keys1) {
            if (!keys2.includes(key)) return false;
            if (!deepEqual(obj1[key], obj2[key])) return false;
        }

        return true;
    };

    // Проверяем, есть ли изменения
    const hasChanges = !deepEqual(originalProduct, editedProduct);

    const groupedAttributes = product.attributes.reduce((groups, attr) => {
        if (!groups[attr.group]) {
            groups[attr.group] = [];
        }
        groups[attr.group].push(attr);
        return groups;
    }, {} as Record<string, ProductAttrVal[]>);

    const currentImage = product.images[selectedImageIndex]?.url || '/api/placeholder/400/400';

    const toggleDescription = () => setShowFullDescription(!showFullDescription);

    const handleInputChange = (field: string, value: string | number) => {
        setEditedProduct(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCategoryChange = (value: string) => {
        setEditedProduct(prev => ({
            ...prev,
            category: {
                ...prev.category,
                name: value
            }
        }));
    };

    const handleAttributeChange = (groupName: string, attrIndex: number, field: 'name' | 'value', value: string) => {
        setEditedProduct(prev => ({
            ...prev,
            attributes: prev.attributes.map((attr, index) => {
                if (attr.group === groupName &&
                    prev.attributes.filter(a => a.group === groupName).indexOf(attr) === attrIndex) {
                    return {...attr, [field]: value};
                }
                return attr;
            })
        }));
    };

    const addAttribute = (groupName: string) => {
        setEditedProduct(prev => ({
            ...prev,
            attributes: [...prev.attributes, {group: groupName, name: '', value: ''}]
        }));
    };

    const removeAttribute = (groupName: string, attrIndex: number) => {
        setEditedProduct(prev => ({
            ...prev,
            attributes: prev.attributes.filter((attr, index) => {
                if (attr.group === groupName) {
                    const groupAttrs = prev.attributes.filter(a => a.group === groupName);
                    return groupAttrs.indexOf(attr) !== attrIndex;
                }
                return true;
            })
        }));
    };

    const addNewGroup = () => {
        if (newGroupName && newGroupName.trim()) {
            addAttribute(newGroupName.trim());
        }
        else{
            setIsAddGroup(false); 
        }
    };

    const handleSave = () => {
        console.log('Сохранение товара:', editedProduct);
        setIsEditing(false);
        // Здесь будет API вызов для сохранения
    };

    const handleCancel = () => {
        // Восстанавливаем исходные данные
        setEditedProduct(createDefaultProduct(
            1,
            "Футболка 1 обосраться какая крутая супер черная как говно негра выходящая за рамки всего смысла черного",
            299.3,
            4.5,
            128,
            "http://localhost:8085/files?filename=/products/ee864d5c-25b3-4ecc-bb42-c2bfc27be551/ee864d5c-25b3-4ecc-bb42-c2bfc27be551-7220720778.jpg"
        ));
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
            console.log('Удаление товара:', product.id);
            // Здесь будет API вызов для удаления
        }
    };

    return (
        <div className="product-seller-detail">
            <div className="product-detail-container">
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

                <div className="product-info">
                    <div className="product-title-wrapper">
                        {isEditing ? (
                            <textarea
                                value={product.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="edit-textarea desc-textarea"
                                placeholder="Название товара"
                            />
                        ) : (
                            <h1 className="product-title">
                                {showFullTitle || product.name.length <= nameSlice
                                    ? product.name
                                    : `${product.name.slice(0, nameSlice)}...`}
                            </h1>
                        )}
                        {!isEditing && product.name.length > 60 && (
                            <button className="expand-btn" onClick={() => setShowFullTitle(!showFullTitle)}>
                                {showFullTitle ? 'Свернуть' : 'Подробнее'}
                            </button>
                        )}
                    </div>

                    {!isEditing && (<div className="product-meta">
                        <div className="product-purchases">

                            <span className="purchase-count">{product.numberOfPurchases} покупок</span>

                        </div>
                    </div>)}

                    <div className="product-price">
                        {isEditing ? (
                            <div className="edit-field">
                                <label>Цена (₽):</label>
                                <input
                                    type="number"
                                    value={product.price}
                                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                                    className="edit-input number-input"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        ) : (
                            `${product.price.toLocaleString()} ₽`
                        )}
                    </div>

                    <div className="product-actions">
                        {isEditing ? (
                            <div className="edit-actions">
                                <button
                                    className={`save-button ${!hasChanges ? 'disabled' : ''}`}
                                    onClick={handleSave}
                                    disabled={!hasChanges}
                                >
                                    <Save size={20}/>
                                    Сохранить
                                </button>
                                <button className="cancel-button" onClick={handleCancel}>
                                    <X size={20}/>
                                    Отмена
                                </button>
                            </div>
                        ) : (
                            <div className="view-actions">
                                <button className="edit-button" onClick={() => setIsEditing(true)}>
                                    <Edit size={20}/>
                                    Редактировать
                                </button>
                                <button className="delete-button" onClick={handleDelete}>
                                    <Trash2 className="text-red-500" size={20}/>
                                    Удалить товар
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="product-description">
                    <h3>Описание</h3>
                    {isEditing ? (
                        <textarea
                            value={product.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="edit-textarea desc-textarea"
                            placeholder="Описание товара"
                            rows={8}
                        />
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>

            {/* Product attributes */}
            <div className="product-attributes">
                <div className="attributes-header">
                    <h2>Характеристики</h2>
                    {(isEditing && !isAddGroup) && (
                        <button className="add-group-btn" onClick={() => setIsAddGroup(true)}>
                            <Plus size={16}/>
                            Добавить группу
                        </button>
                    )}
                    {(isEditing && isAddGroup) && (
                        <div  className="add-group-wrapper">
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={(e) => {setNewGroupName(e.target.value)}}
                                className="edit-input add-group-input"
                                placeholder="Название группы"
                            />
                            <button className="add-group-btn"  onClick={addNewGroup}>
                                Добавить
                            </button>
                        </div>

                    )}
                </div>

                <div className="attribute-group">
                    <div className="attribute-list">
                        <div className="attribute-item">
                            <span className="attribute-name">Категория</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={product.category.name}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="edit-input category-input"
                                />
                            ) : (
                                <span className="attribute-value">{product.category.name}</span>
                            )}
                        </div>
                    </div>
                </div>

                {Object.entries(groupedAttributes).map(([group, attrs]) => (
                    <div key={group} className="attribute-group">
                        <div className="group-header">
                            <h3>{group}</h3>
                            {isEditing && (
                                <button
                                    className="add-attr-btn"
                                    onClick={() => addAttribute(group)}
                                >
                                    <Plus size={14}/>
                                </button>
                            )}
                        </div>
                        <div className="attribute-list">
                            {attrs.map((attr, index) => (
                                <div key={index} className="attribute-item">
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="text"
                                                value={attr.name}
                                                onChange={(e) => handleAttributeChange(group, index, 'name', e.target.value)}
                                                className="edit-input attr-name-input"
                                                placeholder="Название характеристики"
                                            />
                                            <input
                                                type="text"
                                                value={attr.value}
                                                onChange={(e) => handleAttributeChange(group, index, 'value', e.target.value)}
                                                className="edit-input attr-value-input"
                                                placeholder="Значение"
                                            />
                                            <button
                                                className="remove-attr-btn"
                                                onClick={() => removeAttribute(group, index)}
                                            >
                                                <X size={16}/>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="attribute-name">{attr.name}</span>
                                            <span className="attribute-value">{attr.value}</span>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductDetailSeller;