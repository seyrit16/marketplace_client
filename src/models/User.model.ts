export interface UserProfile {
    surname: string;
    name: string;
    patronymic: string;
    phoneNumber: string;
}

export interface User {
    email: string;
    role: 'USER' | 'ADMIN';
    isActive: boolean;
    isLocked: boolean;
    userProfile: UserProfile;
}

export interface PaymentCard {
    id: number;
    lastFourDigits: string;
    cardType: 'VISA' | 'MASTERCARD' | 'MIR';
    expiryDate: string; // MM/YY format
    cardHolderName: string;
    isDefault: boolean;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
}

export interface UpdateEmailRequest {
    newEmail: string;
    verificationCode: string;
}

export interface UpdatePasswordRequest {
    currentPassword: string;
    newPassword: string;
    verificationCode: string;
}

export interface AddPaymentCardRequest {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardHolderName: string;
    isDefault?: boolean;
}

// Validation types
export interface UserProfileErrors {
    surname?: string;
    name?: string;
    patronymic?: string;
    phoneNumber?: string;
}

export interface EmailUpdateErrors {
    newEmail?: string;
    verificationCode?: string;
}

export interface PasswordUpdateErrors {
    currentPassword?: string;
    newPassword?: string;
    verificationCode?: string;
}

export interface PaymentCardErrors {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardHolderName?: string;
}