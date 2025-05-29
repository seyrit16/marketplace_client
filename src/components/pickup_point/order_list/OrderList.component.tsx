import React, {useMemo, useState} from 'react';
import "./OrderList.style.scss";
import {
    getOrderStatusColor,
    getOrderStatusText,
    mockOrders,
    type OrderFilters,
    OrderItemStatus
} from "../../../models/Order.model.ts"

interface OrderListProps {
    pickupPointId?: string;
}

const OrderList: React.FC<OrderListProps> = ({ pickupPointId }) => {
    const [filters, setFilters] = useState<OrderFilters>({});
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    //const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Фильтрация и сортировка заказов
    const filteredAndSortedOrders = useMemo(() => {
        let orders = mockOrders;

        // Фильтр по пункту выдачи
        if (pickupPointId) {
            orders = orders.filter(order => order.pickupPointId === pickupPointId);
        }

        // Фильтр по статусу
        if (filters.status && filters.status.length > 0) {
            orders = orders.filter(order =>
                order.items.some(item => filters.status!.includes(item.itemStatus))
            );
        }

        // Фильтр по датам
        if (filters.dateFrom) {
            orders = orders.filter(order =>
                new Date(order.createdAt) >= new Date(filters.dateFrom!)
            );
        }

        if (filters.dateTo) {
            orders = orders.filter(order =>
                new Date(order.createdAt) <= new Date(filters.dateTo!)
            );
        }

        // Поиск по тексту
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            orders = orders.filter(order =>
                order.id.toLowerCase().includes(query) ||
                order.items.some(item =>
                    item.productName?.toLowerCase().includes(query)
                )
            );
        }

        // Сортировка по дате
        orders.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return orders;
    }, [filters, sortOrder, pickupPointId]);

    const handleStatusChange = (orderId: string, itemId: string, newStatus: OrderItemStatus) => {
        // Здесь должна быть логика обновления статуса через API
        console.log(`Изменение статуса товара ${itemId} в заказе ${orderId} на ${newStatus}`);

        // Для демонстрации обновим локально (в реальном приложении это будет через API)
        const orderIndex = mockOrders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            const itemIndex = mockOrders[orderIndex].items.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
                mockOrders[orderIndex].items[itemIndex].itemStatus = newStatus;
                // Обновляем состояние для перерендера
                setFilters({...filters});
            }
        }
    };

    const handleFilterChange = (key: keyof OrderFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const getAvailableStatuses = (currentStatus: OrderItemStatus): OrderItemStatus[] => {
        switch (currentStatus) {
            case OrderItemStatus.NEW:
                return [OrderItemStatus.PROCESSING,OrderItemStatus.CANCELLED]
            case OrderItemStatus.PROCESSING:
                return [OrderItemStatus.IN_TRANSIT,OrderItemStatus.CANCELLED]
            case OrderItemStatus.IN_TRANSIT:
                return [OrderItemStatus.AT_PICKUP_POINT,OrderItemStatus.CANCELLED];
            case OrderItemStatus.AT_PICKUP_POINT:
                return [OrderItemStatus.DELIVERED, OrderItemStatus.RETURNED];
            case OrderItemStatus.DELIVERED:
                return [OrderItemStatus.RETURNED];
            case OrderItemStatus.RETURNED:
                return [OrderItemStatus.REFUNDED];
            default:
                return [];
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="order-section">
            <div className="order-grid-container">
                <div className="container">
                    <div className="order-header">
                        <h2>Управление заказами</h2>

                        {/* Фильтры */}
                        <div className="order-filters">
                            <div className="filter-row">
                                <input
                                    type="text"
                                    placeholder="Поиск по номеру заказа или товару..."
                                    value={filters.searchQuery || ''}
                                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                                    className="search-input"
                                />


                                <select
                                    value={filters.status || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        handleFilterChange('status', value ? value as OrderItemStatus : undefined);
                                    }}
                                    className="status-filter"
                                >
                                    <option value="">Все статусы</option>
                                    {Object.values(OrderItemStatus).map(status => (
                                        <option key={status} value={status}>
                                            {getOrderStatusText(status)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-row">
                                <input
                                    type="date"
                                    value={filters.dateFrom || ''}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                    className="date-input"
                                />
                                <span>—</span>
                                <input
                                    type="date"
                                    value={filters.dateTo || ''}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                    className="date-input"
                                />

                                <button
                                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                                    className="sort-button"
                                >
                                    Дата {sortOrder === 'desc' ? '↓' : '↑'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Список заказов */}
                    <div className="order-list">
                        {filteredAndSortedOrders.length === 0 ? (
                            <div className="no-orders">
                                <p>Заказы не найдены</p>
                            </div>
                        ) : (
                            filteredAndSortedOrders.map(order => (
                                <div key={order.id} className="order-card">
                                    <div className="order-header-info">
                                        <div className="order-basic-info">
                                            <h3>Заказ #{order.id}</h3>
                                            <p className="order-date">{formatDate(order.createdAt)}</p>
                                            <p className="order-price">{order.fullPrice} ₽</p>
                                        </div>
                                        <div className="order-address">
                                            <p>{order.pickupPointAddress}</p>
                                        </div>
                                    </div>

                                    <div className="order-items">
                                        {order.items.map(item => (
                                            <div key={item.id} className="order-item">
                                                <div className="item-info">
                                                    {item.productImage && (
                                                        <img
                                                            src={item.productImage}
                                                            alt={item.productName}
                                                            className="item-image"
                                                        />
                                                    )}
                                                    <div className="item-details">
                                                        <h4>{item.productName}</h4>
                                                        <p>Количество: {item.quantity}</p>
                                                        <p>Цена: {item.itemPrice} ₽</p>
                                                    </div>
                                                </div>

                                                <div className="item-status-control">
                                                    <div className={`current-status status-${getOrderStatusColor(item.itemStatus)}`}>
                                                        {getOrderStatusText(item.itemStatus)}
                                                    </div>

                                                    {getAvailableStatuses(item.itemStatus).length > 0 && (
                                                        <div className="status-actions">
                                                            <label>Изменить статус: </label>
                                                            <select
                                                                onChange={(e) => {
                                                                    if (e.target.value) {
                                                                        handleStatusChange(
                                                                            order.id,
                                                                            item.id,
                                                                            e.target.value as OrderItemStatus
                                                                        );
                                                                    }
                                                                }}
                                                                className="status-select"
                                                                defaultValue=""
                                                            >
                                                                <option value="">{"Выберите статус"}</option>
                                                                {getAvailableStatuses(item.itemStatus).map(status => (
                                                                    <option key={status} value={status}>
                                                                        {getOrderStatusText(status)}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}

                                                    {item.addInfoForStatus && (
                                                        <div className="status-info">
                                                            <small>{item.addInfoForStatus}</small>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderList;