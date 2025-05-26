// context/UserContext.tsx
import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type {User, PaymentCard, AuthTokens} from '../models/User.model';

interface UserState {
    user: User | null;
    paymentCards: PaymentCard[];
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

type UserAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_USER'; payload: User }
    | { type: 'UPDATE_USER_PROFILE'; payload: Partial<User['userProfile']> }
    | { type: 'UPDATE_USER_EMAIL'; payload: string }
    | { type: 'SET_PAYMENT_CARDS'; payload: PaymentCard[] }
    | { type: 'ADD_PAYMENT_CARD'; payload: PaymentCard }
    | { type: 'UPDATE_PAYMENT_CARD'; payload: PaymentCard }
    | { type: 'DELETE_PAYMENT_CARD'; payload: number }
    | { type: 'SET_DEFAULT_CARD'; payload: number }
    | { type: 'LOGOUT' };

const initialState: UserState = {
    user: null,
    paymentCards: [],
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

const userReducer = (state: UserState, action: UserAction): UserState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_USER':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                error: null,
            };
        case 'UPDATE_USER_PROFILE':
            return state.user
                ? {
                    ...state,
                    user: {
                        ...state.user,
                        userProfile: { ...state.user.userProfile, ...action.payload },
                    },
                }
                : state;
        case 'UPDATE_USER_EMAIL':
            return state.user
                ? {
                    ...state,
                    user: { ...state.user, email: action.payload },
                }
                : state;
        case 'SET_PAYMENT_CARDS':
            return { ...state, paymentCards: action.payload };
        case 'ADD_PAYMENT_CARD':
            return {
                ...state,
                paymentCards: [...state.paymentCards, action.payload],
            };
        case 'UPDATE_PAYMENT_CARD':
            return {
                ...state,
                paymentCards: state.paymentCards.map(card =>
                    card.id === action.payload.id ? action.payload : card
                ),
            };
        case 'DELETE_PAYMENT_CARD':
            return {
                ...state,
                paymentCards: state.paymentCards.filter(card => card.id !== action.payload),
            };
        case 'SET_DEFAULT_CARD':
            return {
                ...state,
                paymentCards: state.paymentCards.map(card => ({
                    ...card,
                    isDefault: card.id === action.payload,
                })),
            };
        case 'LOGOUT':
            // Clear tokens from secure storage
            TokenManager.clearTokens();
            return {
                ...initialState,
            };
        default:
            return state;
    }
};

interface UserContextType {
    state: UserState;
    // User profile actions
    updateUserProfile: (profileData: Partial<User['userProfile']>) => Promise<void>;
    updateUserEmail: (newEmail: string, verificationCode: string) => Promise<void>;
    updateUserPassword: (currentPassword: string, newPassword: string, verificationCode: string) => Promise<void>;
    sendEmailVerificationCode: (email: string) => Promise<void>;
    sendPasswordResetCode: () => Promise<void>;

    // Payment card actions
    loadPaymentCards: () => Promise<void>;
    addPaymentCard: (cardData: any) => Promise<void>;
    deletePaymentCard: (cardId: number) => Promise<void>;
    setDefaultCard: (cardId: number) => Promise<void>;

    // Auth actions
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuthStatus: () => Promise<void>;
}

// Secure token management
class TokenManager {
    private static readonly ACCESS_TOKEN_KEY = 'access_token';
    private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

    static setTokens(tokens: AuthTokens): void {
        // Store in httpOnly cookies or secure storage
        // For now using sessionStorage (should be replaced with secure solution)
        sessionStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
        if (tokens.refreshToken) {
            sessionStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
        }
    }

    static getAccessToken(): string | null {
        return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
    }

    static getRefreshToken(): string | null {
        return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    static clearTokens(): void {
        sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
        sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
}

// API service class
class UserApiService {
    private static readonly BASE_URL = '/api';

    private static async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = TokenManager.getAccessToken();
        const url = `${this.BASE_URL}${endpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        };

        const response = await fetch(url, config);

        if (response.status === 401) {
            // Token expired, try to refresh
            const refreshToken = TokenManager.getRefreshToken();
            if (refreshToken) {
                // Attempt token refresh logic here
                // For now, just logout
                TokenManager.clearTokens();
                window.location.href = '/login';
                throw new Error('Session expired');
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    static async updateProfile(profileData: Partial<User['userProfile']>): Promise<User> {
        return this.makeRequest<User>('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    static async updateEmail(newEmail: string, verificationCode: string): Promise<User> {
        return this.makeRequest<User>('/user/email', {
            method: 'PUT',
            body: JSON.stringify({ newEmail, verificationCode }),
        });
    }

    static async updatePassword(
        currentPassword: string,
        newPassword: string,
        verificationCode: string
    ): Promise<void> {
        return this.makeRequest<void>('/user/password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword, verificationCode }),
        });
    }

    static async sendEmailVerificationCode(email: string): Promise<void> {
        return this.makeRequest<void>('/user/send-email-verification', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    static async sendPasswordResetCode(): Promise<void> {
        return this.makeRequest<void>('/user/send-password-reset', {
            method: 'POST',
        });
    }

    static async getPaymentCards(): Promise<PaymentCard[]> {
        return this.makeRequest<PaymentCard[]>('/user/payment-cards');
    }

    static async addPaymentCard(cardData: any): Promise<PaymentCard> {
        return this.makeRequest<PaymentCard>('/user/payment-cards', {
            method: 'POST',
            body: JSON.stringify(cardData),
        });
    }

    static async deletePaymentCard(cardId: number): Promise<void> {
        return this.makeRequest<void>(`/user/payment-cards/${cardId}`, {
            method: 'DELETE',
        });
    }

    static async setDefaultCard(cardId: number): Promise<PaymentCard[]> {
        return this.makeRequest<PaymentCard[]>(`/user/payment-cards/${cardId}/default`, {
            method: 'PUT',
        });
    }

    static async getCurrentUser(): Promise<User> {
        return this.makeRequest<User>('/user/me');
    }

    static async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
        return this.makeRequest<{ user: User; tokens: AuthTokens }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(userReducer, initialState);

    useEffect(() => {
        const simulateUser = async () => {
            const fakeUser: User = {
                email: 'test.user@example.com',
                role: 'USER',
                isActive: true,
                isLocked: false,
                userProfile: {
                    surname: 'Иванов',
                    name: 'Иван',
                    patronymic: 'Иванович',
                    phoneNumber: '+79998887766',
                },
            };

            const fakeCards: PaymentCard[] = [
                {
                    id: 1,
                    lastFourDigits: '1234',
                    cardType: 'VISA',
                    expiryDate: '12/26',
                    cardHolderName: 'IVAN IVANOV',
                    isDefault: true,
                },
                {
                    id: 2,
                    lastFourDigits: '5678',
                    cardType: 'MASTERCARD',
                    expiryDate: '01/27',
                    cardHolderName: 'IVAN IVANOV',
                    isDefault: false,
                },
            ];

            dispatch({ type: 'SET_USER', payload: fakeUser });
            dispatch({ type: 'SET_PAYMENT_CARDS', payload: fakeCards });
        };

        simulateUser();
    }, []);

    // Check authentication status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async (): Promise<void> => {
        const token = TokenManager.getAccessToken();
        if (!token) return;

        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const user = await UserApiService.getCurrentUser();
            dispatch({ type: 'SET_USER', payload: user });

            // Load payment cards
            const cards = await UserApiService.getPaymentCards();
            dispatch({ type: 'SET_PAYMENT_CARDS', payload: cards });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
            TokenManager.clearTokens();
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const updateUserProfile = async (profileData: Partial<User['userProfile']>): Promise<void> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const updatedUser = await UserApiService.updateProfile(profileData);
            dispatch({ type: 'UPDATE_USER_PROFILE', payload: updatedUser.userProfile });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const updateUserEmail = async (newEmail: string, verificationCode: string): Promise<void> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const updatedUser = await UserApiService.updateEmail(newEmail, verificationCode);
            dispatch({ type: 'UPDATE_USER_EMAIL', payload: updatedUser.email });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const updateUserPassword = async (
        currentPassword: string,
        newPassword: string,
        verificationCode: string
    ): Promise<void> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            await UserApiService.updatePassword(currentPassword, newPassword, verificationCode);
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const sendEmailVerificationCode = async (email: string): Promise<void> => {
        try {
            await UserApiService.sendEmailVerificationCode(email);
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
            throw error;
        }
    };

    const sendPasswordResetCode = async (): Promise<void> => {
        try {
            await UserApiService.sendPasswordResetCode();
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
            throw error;
        }
    };

    const loadPaymentCards = async (): Promise<void> => {
        try {
            const cards = await UserApiService.getPaymentCards();
            dispatch({ type: 'SET_PAYMENT_CARDS', payload: cards });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
            throw error;
        }
    };

    const addPaymentCard = async (cardData: any): Promise<void> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const newCard = await UserApiService.addPaymentCard(cardData);
            dispatch({ type: 'ADD_PAYMENT_CARD', payload: newCard });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const deletePaymentCard = async (cardId: number): Promise<void> => {
        try {
            await UserApiService.deletePaymentCard(cardId);
            dispatch({ type: 'DELETE_PAYMENT_CARD', payload: cardId });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
            throw error;
        }
    };

    const setDefaultCard = async (cardId: number): Promise<void> => {
        try {
            const updatedCards = await UserApiService.setDefaultCard(cardId);
            dispatch({ type: 'SET_PAYMENT_CARDS', payload: updatedCards });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
            throw error;
        }
    };

    const login = async (email: string, password: string): Promise<void> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const { user, tokens } = await UserApiService.login(email, password);

            TokenManager.setTokens(tokens);
            dispatch({ type: 'SET_USER', payload: user });

            // Load payment cards after login
            const cards = await UserApiService.getPaymentCards();
            dispatch({ type: 'SET_PAYMENT_CARDS', payload: cards });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const logout = (): void => {
        dispatch({ type: 'LOGOUT' });
    };

    const value: UserContextType = {
        state,
        updateUserProfile,
        updateUserEmail,
        updateUserPassword,
        sendEmailVerificationCode,
        sendPasswordResetCode,
        loadPaymentCards,
        addPaymentCard,
        deletePaymentCard,
        setDefaultCard,
        login,
        logout,
        checkAuthStatus,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};