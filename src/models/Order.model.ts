export enum OrderItemStatus {
    NEW = 'NEW',
    PROCESSING = 'PROCESSING',
    IN_TRANSIT = 'IN_TRANSIT',
    AT_PICKUP_POINT = 'AT_PICKUP_POINT',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    RETURNED = 'RETURNED',
    REFUNDED = 'REFUNDED'
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    productName?: string;
    productImage?: string;
    quantity: number;
    itemPrice: number;
    itemStatus: OrderItemStatus;
    addInfoForStatus?: string;
}

export interface Order {
    id: string;
    userId: string;
    fullPrice: number;
    pickupPointId: string;
    pickupPointAddress?: string;
    items: OrderItem[];
    createdAt: string;
}

export interface OrderFilters {
    status?: OrderItemStatus[];
    dateFrom?: string;
    dateTo?: string;
    searchQuery?: string;
}

export const getOrderStatusText = (status: OrderItemStatus): string => {
    const statusTexts: Record<OrderItemStatus, string> = {
        [OrderItemStatus.NEW]: 'Новый',
        [OrderItemStatus.PROCESSING]: 'В обработке',
        [OrderItemStatus.IN_TRANSIT]: 'В пути',
        [OrderItemStatus.AT_PICKUP_POINT]: 'В пункте выдачи',
        [OrderItemStatus.DELIVERED]: 'Доставлен',
        [OrderItemStatus.CANCELLED]: 'Отменен',
        [OrderItemStatus.RETURNED]: 'Возвращен',
        [OrderItemStatus.REFUNDED]: 'Возмещен'
    };
    return statusTexts[status];
};

export const getOrderStatusColor = (status: OrderItemStatus): string => {
    const statusColors: Record<OrderItemStatus, string> = {
        [OrderItemStatus.NEW]: 'blue',
        [OrderItemStatus.PROCESSING]: 'orange',
        [OrderItemStatus.IN_TRANSIT]: 'purple',
        [OrderItemStatus.AT_PICKUP_POINT]: 'green',
        [OrderItemStatus.DELIVERED]: 'success',
        [OrderItemStatus.CANCELLED]: 'danger',
        [OrderItemStatus.RETURNED]: 'warning',
        [OrderItemStatus.REFUNDED]: 'info'
    };
    return statusColors[status];
};

export const isActiveOrder = (order: Order): boolean => {
    const activeStatuses = [
        OrderItemStatus.NEW,
        OrderItemStatus.PROCESSING,
        OrderItemStatus.IN_TRANSIT,
        OrderItemStatus.AT_PICKUP_POINT
    ];

    return order.items.some(item => activeStatuses.includes(item.itemStatus));
};

export const getOrderMainStatus = (order: Order): OrderItemStatus => {
    const statuses = order.items.map(item => item.itemStatus);

    const statusPriority: OrderItemStatus[] = [
        OrderItemStatus.NEW,
        OrderItemStatus.PROCESSING,
        OrderItemStatus.IN_TRANSIT,
        OrderItemStatus.AT_PICKUP_POINT,
        OrderItemStatus.DELIVERED,
        OrderItemStatus.CANCELLED,
        OrderItemStatus.RETURNED,
        OrderItemStatus.REFUNDED
    ];

    for (const status of statusPriority) {
        if (statuses.includes(status)) {
            return status;
        }
    }

    return OrderItemStatus.NEW;
};


export const mockOrders: Order[] = [
    {
        id: 'order1',
        userId: 'user123',
        fullPrice: 3200,
        pickupPointId: 'pointA',
        pickupPointAddress: 'ул. Ленина, 10, Москва',
        createdAt: '2025-05-20T12:34:56.000Z',
        items: [
            {
                id: 'item1',
                orderId: 'order1',
                productId: 'prod1',
                productName: 'Кроссовки Adidas',
                productImage: '/images/shoes.png',
                quantity: 1,
                itemPrice: 3200,
                itemStatus: OrderItemStatus.NEW,
            },
        ],
    },
    {
        id: 'order2',
        userId: 'user123',
        fullPrice: 5800,
        pickupPointId: 'pointB',
        pickupPointAddress: 'пр-т Мира, 25, Санкт-Петербург',
        createdAt: '2025-05-15T09:10:00.000Z',
        items: [
            {
                id: 'item2',
                orderId: 'order2',
                productId: 'prod2',
                productName: 'Футболка Nike',
                productImage: '/images/tshirt.png',
                quantity: 2,
                itemPrice: 2900,
                itemStatus: OrderItemStatus.IN_TRANSIT,
            },
        ],
    },
    {
        id: 'order3',
        userId: 'user123',
        fullPrice: 1999,
        pickupPointId: 'pointC',
        pickupPointAddress: 'наб. Фонтанки, 12, СПб',
        createdAt: '2025-04-22T18:00:00.000Z',
        items: [
            {
                id: 'item3',
                orderId: 'order3',
                productId: 'prod3',
                productName: 'Наушники JBL',
                productImage: '/images/headphones.png',
                quantity: 1,
                itemPrice: 1999,
                itemStatus: OrderItemStatus.DELIVERED,
            },
        ],
    },
    {
        id: 'order4',
        userId: 'user123',
        fullPrice: 1200,
        pickupPointId: 'pointA',
        pickupPointAddress: 'ул. Ленина, 10, Москва',
        createdAt: '2025-03-10T14:30:00.000Z',
        items: [
            {
                id: 'item4',
                orderId: 'order4',
                productId: 'prod4',
                productName: 'Книга "Clean Code"',
                productImage: '/images/book.png',
                quantity: 1,
                itemPrice: 1200,
                itemStatus: OrderItemStatus.CANCELLED,
            },
        ],
    },
    {
        id: 'order5',
        userId: 'user123',
        fullPrice: 4500,
        pickupPointId: 'pointD',
        pickupPointAddress: 'ул. Гагарина, 5, Казань',
        createdAt: '2025-05-01T08:00:00.000Z',
        items: [
            {
                id: 'item5',
                orderId: 'order5',
                productId: 'prod5',
                productName: 'Смарт-часы Huawei',
                productImage: '/images/smartwatch.png',
                quantity: 1,
                itemPrice: 4500,
                itemStatus: OrderItemStatus.REFUNDED,
            },
        ],
    },
];