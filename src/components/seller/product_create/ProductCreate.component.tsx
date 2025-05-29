import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { type ProductAttrVal } from "../../../models/Product.model.ts";
import { Trash2, Save, X, Plus, Upload, GripVertical } from "lucide-react";
import "./ProductCreate.style.scss";

interface ProductCreateData {
    name: string;
    description: string;
    price: number;
    categoryId: number;
    attributes: ProductAttrVal[];
    images: File[];
}

interface ImagePreview {
    file: File;
    url: string;
    sortOrder: number;
}

const ProductCreate: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [productData, setProductData] = useState<ProductCreateData>({
        name: '',
        description: '',
        price: 0,
        categoryId: 1,
        attributes: [],
        images: []
    });

    const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
    const [isAddGroup, setIsAddGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Группировка атрибутов
    const groupedAttributes = productData.attributes.reduce((groups, attr) => {
        if (!groups[attr.group]) {
            groups[attr.group] = [];
        }
        groups[attr.group].push(attr);
        return groups;
    }, {} as Record<string, ProductAttrVal[]>);

    // Обработка изменений в полях
    const handleInputChange = (field: keyof ProductCreateData, value: string | number) => {
        setProductData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Обработка изменений атрибутов
    const handleAttributeChange = (groupName: string, attrIndex: number, field: 'name' | 'value', value: string) => {
        setProductData(prev => ({
            ...prev,
            attributes: prev.attributes.map((attr, index) => {
                if (attr.group === groupName &&
                    prev.attributes.filter(a => a.group === groupName).indexOf(attr) === attrIndex) {
                    return { ...attr, [field]: value };
                }
                return attr;
            })
        }));
    };

    // Добавление атрибута
    const addAttribute = (groupName: string) => {
        setProductData(prev => ({
            ...prev,
            attributes: [...prev.attributes, { group: groupName, name: '', value: '' }]
        }));
    };

    // Удаление атрибута
    const removeAttribute = (groupName: string, attrIndex: number) => {
        setProductData(prev => ({
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

    // Добавление новой группы
    const addNewGroup = () => {
        if (newGroupName && newGroupName.trim()) {
            addAttribute(newGroupName.trim());
            setNewGroupName('');
            setIsAddGroup(false);
        } else {
            setIsAddGroup(false);
        }
    };

    // Обработка загрузки изображений
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);

        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const newImage: ImagePreview = {
                        file,
                        url: e.target?.result as string,
                        sortOrder: imagePreviews.length
                    };

                    setImagePreviews(prev => [...prev, newImage]);
                    setProductData(prev => ({
                        ...prev,
                        images: [...prev.images, file]
                    }));
                };
                reader.readAsDataURL(file);
            }
        });

        // Очищаем input для возможности повторного выбора того же файла
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Удаление изображения
    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, sortOrder: i })));
        setProductData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    // Drag and Drop для изображений
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedImageIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();

        if (draggedImageIndex === null || draggedImageIndex === dropIndex) {
            setDraggedImageIndex(null);
            return;
        }

        const newPreviews = [...imagePreviews];
        const draggedItem = newPreviews[draggedImageIndex];

        // Удаляем элемент из старой позиции
        newPreviews.splice(draggedImageIndex, 1);
        // Вставляем элемент в новую позицию
        newPreviews.splice(dropIndex, 0, draggedItem);

        // Обновляем sortOrder
        const updatedPreviews = newPreviews.map((img, index) => ({
            ...img,
            sortOrder: index
        }));

        setImagePreviews(updatedPreviews);

        // Обновляем массив файлов в том же порядке
        const newFiles = updatedPreviews.map(preview => preview.file);
        setProductData(prev => ({
            ...prev,
            images: newFiles
        }));

        setDraggedImageIndex(null);
    };

    // Валидация формы
    const isFormValid = () => {
        return productData.name.trim() !== '' &&
            productData.description.trim() !== '' &&
            productData.price > 0 &&
            imagePreviews.length > 0;
    };

    // Отправка формы
    const handleSubmit = async () => {
        if (!isFormValid()) {
            alert('Пожалуйста, заполните все обязательные поля и добавьте хотя бы одно изображение');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();

            // Добавляем данные продукта
            const productJson = {
                name: productData.name,
                description: productData.description,
                price: productData.price,
                categoryId: productData.categoryId,
                attributes: productData.attributes.filter(attr => attr.name.trim() && attr.value.trim())
            };

            formData.append('product', JSON.stringify(productJson));

            // Добавляем изображения в правильном порядке
            imagePreviews.forEach((preview, index) => {
                formData.append('images', preview.file);
                formData.append(`imageSortOrder_${index}`, index.toString());
            });

            // Здесь должен быть API вызов
            console.log('Отправка продукта:', productJson);
            console.log('Изображения:', imagePreviews.map(p => p.file.name));

            console.log('<UNK> <UNK>:', productData.categoryId);
            console.log(formData);
            // Симуляция API вызова
            await new Promise(resolve => setTimeout(resolve, 2000));

            alert('Товар успешно создан!');
            navigate('/seller/products');

        } catch (error) {
            console.error('Ошибка при создании товара:', error);
            alert('Произошла ошибка при создании товара');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('Вы уверены, что хотите отменить создание товара? Все данные будут потеряны.')) {
            navigate('/seller/products');
        }
    };

    return (
        <div className="product-create">
            <div className="product-create-container">
                <h1>Создание нового товара</h1>

                {/* Загрузка изображений */}
                <div className="images-section">
                    <h3>Изображения товара *</h3>
                    <div className="image-upload-area">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
                        <button
                            className="upload-button"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload size={20} />
                            Загрузить изображения
                        </button>
                        <p className="upload-hint">Перетащите изображения для изменения порядка</p>
                    </div>

                    {imagePreviews.length > 0 && (
                        <div className="image-previews">
                            {imagePreviews.map((preview, index) => (
                                <div
                                    key={index}
                                    className={`image-preview ${draggedImageIndex === index ? 'dragging' : ''}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                >
                                    <div className="drag-handle">
                                        <GripVertical size={16} />
                                    </div>
                                    <img src={preview.url} alt={`Preview ${index + 1}`} />
                                    <div className="image-order">#{index + 1}</div>
                                    <button
                                        className="remove-image-btn"
                                        onClick={() => removeImage(index)}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Основная информация */}
                <div className="basic-info-section">
                    <h3>Основная информация</h3>

                    <div className="form-field">
                        <label>Название товара *</label>
                        <input
                            type="text"
                            value={productData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="form-input"
                            placeholder="Введите название товара"
                        />
                    </div>

                    <div className="form-field">
                        <label>Описание товара *</label>
                        <textarea
                            value={productData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="form-textarea"
                            placeholder="Подробное описание товара"
                            rows={6}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label>Цена (₽) *</label>
                            <input
                                type="number"
                                value={productData.price || ''}
                                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                                className="form-input"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="form-field">
                            <label>Категория *</label>
                            <select
                                value={productData.categoryId}
                                onChange={(e) => handleInputChange('categoryId', parseInt(e.target.value))}
                                className="form-select"
                            >
                                <option value={1}>Футболки</option>
                                <option value={2}>Джинсы</option>
                                <option value={3}>Обувь</option>
                                <option value={4}>Аксессуары</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Характеристики */}
                <div className="attributes-section">
                    <div className="attributes-header">
                        <h3>Характеристики</h3>
                        {!isAddGroup && (
                            <button className="add-group-btn" onClick={() => setIsAddGroup(true)}>
                                <Plus size={16} />
                                Добавить группу
                            </button>
                        )}
                        {isAddGroup && (
                            <div className="add-group-wrapper">
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    className="form-input add-group-input"
                                    placeholder="Название группы"
                                />
                                <button className="add-group-btn" onClick={addNewGroup}>
                                    Добавить
                                </button>
                            </div>
                        )}
                    </div>

                    {Object.entries(groupedAttributes).map(([group, attrs]) => (
                        <div key={group} className="attribute-group">
                            <div className="group-header">
                                <h4>{group}</h4>
                                <button
                                    className="add-attr-btn"
                                    onClick={() => addAttribute(group)}
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div className="attribute-list">
                                {attrs.map((attr, index) => (
                                    <div key={index} className="attribute-item">
                                        <input
                                            type="text"
                                            value={attr.name}
                                            onChange={(e) => handleAttributeChange(group, index, 'name', e.target.value)}
                                            className="form-input attr-name-input"
                                            placeholder="Название характеристики"
                                        />
                                        <input
                                            type="text"
                                            value={attr.value}
                                            onChange={(e) => handleAttributeChange(group, index, 'value', e.target.value)}
                                            className="form-input attr-value-input"
                                            placeholder="Значение"
                                        />
                                        <button
                                            className="remove-attr-btn"
                                            onClick={() => removeAttribute(group, index)}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Кнопки действий */}
                <div className="form-actions">
                    <button
                        className={`save-button ${!isFormValid() || isSubmitting ? 'disabled' : ''}`}
                        onClick={handleSubmit}
                        disabled={!isFormValid() || isSubmitting}
                    >
                        <Save size={20} />
                        {isSubmitting ? 'Создание...' : 'Создать товар'}
                    </button>
                    <button className="cancel-button" onClick={handleCancel} disabled={isSubmitting}>
                        <X size={20} />
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCreate;