export interface Seller {
    email: string;
    isActive: boolean;
    isLocked: boolean;
    sellerProfile: {
        fullCompanyName: string;
        shortCompanyName: string;
        description: string;
    };
    personDetail: {
        surname: string;
        name: string;
        patronimyc: string;
        phoneNumber: string;
    };
    paymentDetail: {
        bankAccountNumber: string;
        bankName: string;
        bic: string;
        accountHolderName: string;
        inn: string;
    };
}

export interface SellerRegistrationData {
    email: string;
    password: string;
    code: string;
    sellerCreateRequest: {
        person: {
            surname: string;
            name: string;
            patronimyc: string;
            phoneNumber: string;
        };
        fullCompanyName: string;
        shortCompanyName: string;
        description: string;
        paymentDetail: {
            bankAccountNumber: string;
            bankName: string;
            bic: string;
            accountHolderName: string;
            inn: string;
        };
    };
}

export function createMockSeller(): Seller {
    return {
        email: "seller@example.com",
        isActive: true,
        isLocked: false,
        sellerProfile: {
            fullCompanyName: "ООО Пример",
            shortCompanyName: "Пример",
            description: "ООО Пример — ведущий поставщик качественной одежды. Мы работаем на рынке более 10 лет и зарекомендовали себя как надежный партнер среди клиентов по всей России. Наша миссия — обеспечивать клиентов лучшими продуктами по доступным ценам. Контроль качества и клиентоориентированность — наш приоритет."
        },
        personDetail: {
            surname: "Иванов",
            name: "Иван",
            patronimyc: "Иванович",
            phoneNumber: "+7900123456"
        },
        paymentDetail: {
            bankAccountNumber: "12345678901234567890",
            bankName: "Сбербанк",
            bic: "123456789",
            accountHolderName: "Иванов Иван Иванович",
            inn: "1234567890"
        }
    };
}

export function createMockSellerRegistration(): SellerRegistrationData {
    return {
        email: "seller@example.com",
        password: "SecurePassword123!",
        code: "123456",
        sellerCreateRequest: {
            person: {
                surname: "Иванов",
                name: "Иван",
                patronimyc: "Иванович",
                phoneNumber: "+79123456789"
            },
            fullCompanyName: "Общество с ограниченной ответственностью \"Торговая компания\"",
            shortCompanyName: "ООО \"Торговая\"",
            description: "Продажа товаров народного потребления",
            paymentDetail: {
                bankAccountNumber: "12345678901234567890",
                bankName: "Сбербанк России",
                bic: "044525225",
                accountHolderName: "ООО \"Торговая компания\"",
                inn: "1234567890"
            }
        }
    };
}