import { useEffect, useCallback, useRef } from 'react';
import type {AuthTokens} from '../models/User.model';

interface SecureStorageConfig {
    encryptionKey?: string;
    tokenRefreshThreshold?: number; // minutes before expiry to refresh
    autoRefresh?: boolean;
}

// Simple encryption/decryption utilities
class CryptoUtils {
    private static readonly CRYPTO_KEY = 'user_session_key_2024';

    static encrypt(text: string): string {
        try {
            // Simple XOR encryption for demo purposes
            // In production, use Web Crypto API or a proper encryption library
            let result = '';
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(
                    text.charCodeAt(i) ^ this.CRYPTO_KEY.charCodeAt(i % this.CRYPTO_KEY.length)
                );
            }
            return btoa(result);
        } catch (error) {
            console.error('Encryption failed:', error);
            return text;
        }
    }

    static decrypt(encryptedText: string): string {
        try {
            const decoded = atob(encryptedText);
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                result += String.fromCharCode(
                    decoded.charCodeAt(i) ^ this.CRYPTO_KEY.charCodeAt(i % this.CRYPTO_KEY.length)
                );
            }
            return result;
        } catch (error) {
            console.error('Decryption failed:', error);
            return encryptedText;
        }
    }
}

// Token storage interface
interface StoredTokenData {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
    issuedAt: number;
}

class SecureTokenStorage {
    private static readonly ACCESS_TOKEN_KEY = '__auth_access_token';
    private static readonly REFRESH_TOKEN_KEY = '__auth_refresh_token';
    private static readonly TOKEN_DATA_KEY = '__auth_token_data';

    // Check if we're in a secure context (HTTPS)
    private static isSecureContext(): boolean {
        return location.protocol === 'https:' || location.hostname === 'localhost';
    }

    // Store tokens securely
    static setTokens(tokens: AuthTokens, expiresIn: number = 3600): void {
        const now = Date.now();
        const tokenData: StoredTokenData = {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: now + (expiresIn * 1000),
            issuedAt: now,
        };

        try {
            if (this.isSecureContext() && 'sessionStorage' in window) {
                // Store encrypted tokens in sessionStorage (cleared on tab close)
                const encryptedData = CryptoUtils.encrypt(JSON.stringify(tokenData));
                sessionStorage.setItem(this.TOKEN_DATA_KEY, encryptedData);
            } else {
                // Fallback to memory storage (less secure but works)
                this.memoryStorage.set(this.TOKEN_DATA_KEY, tokenData);
            }
        } catch (error) {
            console.error('Failed to store tokens:', error);
            // Fallback to memory storage
            this.memoryStorage.set(this.TOKEN_DATA_KEY, tokenData);
        }
    }

    // Memory storage fallback
    private static memoryStorage = new Map<string, any>();

    // Get stored token data
    static getTokenData(): StoredTokenData | null {
        try {
            let tokenDataStr: string | null = null;

            if (this.isSecureContext() && 'sessionStorage' in window) {
                const encryptedData = sessionStorage.getItem(this.TOKEN_DATA_KEY);
                if (encryptedData) {
                    tokenDataStr = CryptoUtils.decrypt(encryptedData);
                }
            } else {
                const tokenData = this.memoryStorage.get(this.TOKEN_DATA_KEY);
                if (tokenData) {
                    return tokenData as StoredTokenData;
                }
            }

            if (tokenDataStr) {
                return JSON.parse(tokenDataStr) as StoredTokenData;
            }
        } catch (error) {
            console.error('Failed to retrieve tokens:', error);
            this.clearTokens(); // Clear corrupted data
        }

        return null;
    }

    // Get access token
    static getAccessToken(): string | null {
        const tokenData = this.getTokenData();
        return tokenData?.accessToken || null;
    }

    // Get refresh token
    static getRefreshToken(): string | null {
        const tokenData = this.getTokenData();
        return tokenData?.refreshToken || null;
    }

    // Check if token is expired
    static isTokenExpired(): boolean {
        const tokenData = this.getTokenData();
        if (!tokenData) return true;

        return Date.now() >= tokenData.expiresAt;
    }

    // Check if token needs refresh (within threshold)
    static needsRefresh(thresholdMinutes: number = 5): boolean {
        const tokenData = this.getTokenData();
        if (!tokenData) return true;

        const thresholdMs = thresholdMinutes * 60 * 1000;
        return Date.now() >= (tokenData.expiresAt - thresholdMs);
    }

    // Clear all tokens
    static clearTokens(): void {
        try {
            if (this.isSecureContext() && 'sessionStorage' in window) {
                sessionStorage.removeItem(this.TOKEN_DATA_KEY);
                sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
                sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
            }
            this.memoryStorage.clear();
        } catch (error) {
            console.error('Failed to clear tokens:', error);
        }
    }

    // Get time until token expires
    static getTimeUntilExpiry(): number {
        const tokenData = this.getTokenData();
        if (!tokenData) return 0;

        return Math.max(0, tokenData.expiresAt - Date.now());
    }
}

// Custom hook for secure token management
export const useSecureStorage = (config: SecureStorageConfig = {}) => {
    const {
        tokenRefreshThreshold = 5,
        autoRefresh = true,
    } = config;

    const refreshTimeoutRef = useRef<number | null>(null);
    const refreshCallbackRef = useRef<(() => Promise<void>) | null>(null);

    // Set refresh callback
    const setRefreshCallback = useCallback((callback: () => Promise<void>) => {
        refreshCallbackRef.current = callback;
    }, []);

    // Store tokens
    const setTokens = useCallback((tokens: AuthTokens, expiresIn?: number) => {
        SecureTokenStorage.setTokens(tokens, expiresIn);

        if (autoRefresh && expiresIn) {
            scheduleTokenRefresh(expiresIn);
        }
    }, [autoRefresh]);

    // Get access token
    const getAccessToken = useCallback((): string | null => {
        return SecureTokenStorage.getAccessToken();
    }, []);

    // Get refresh token
    const getRefreshToken = useCallback((): string | null => {
        return SecureTokenStorage.getRefreshToken();
    }, []);

    // Check if authenticated
    const isAuthenticated = useCallback((): boolean => {
        return !SecureTokenStorage.isTokenExpired();
    }, []);

    // Check if token needs refresh
    const needsRefresh = useCallback((): boolean => {
        return SecureTokenStorage.needsRefresh(tokenRefreshThreshold);
    }, [tokenRefreshThreshold]);

    // Clear tokens
    const clearTokens = useCallback(() => {
        SecureTokenStorage.clearTokens();

        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
            refreshTimeoutRef.current = null;
        }
    }, []);

    // Schedule automatic token refresh
    const scheduleTokenRefresh = useCallback((expiresIn: number) => {
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }

        const refreshTime = (expiresIn - tokenRefreshThreshold * 60) * 1000;

        if (refreshTime > 0) {
            refreshTimeoutRef.current = setTimeout(async () => {
                if (refreshCallbackRef.current) {
                    try {
                        await refreshCallbackRef.current();
                    } catch (error) {
                        console.error('Token refresh failed:', error);
                        clearTokens();
                    }
                }
            }, refreshTime);
        }
    }, [tokenRefreshThreshold, clearTokens]);

    // Get time until token expires
    const getTimeUntilExpiry = useCallback((): number => {
        return SecureTokenStorage.getTimeUntilExpiry();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, []);

    // Check token status on mount
    useEffect(() => {
        if (autoRefresh && needsRefresh() && refreshCallbackRef.current) {
            refreshCallbackRef.current().catch(error => {
                console.error('Initial token refresh failed:', error);
            });
        }
    }, [autoRefresh, needsRefresh]);

    return {
        setTokens,
        getAccessToken,
        getRefreshToken,
        isAuthenticated,
        needsRefresh,
        clearTokens,
        getTimeUntilExpiry,
        setRefreshCallback,
    };
};

// Export storage class for direct usage
export { SecureTokenStorage };

// Utility hook for making authenticated API calls
export const useAuthenticatedFetch = () => {
    const { getAccessToken, clearTokens } = useSecureStorage();

    const authenticatedFetch = useCallback(async (
        url: string,
        options: RequestInit = {}
    ): Promise<Response> => {
        const token = getAccessToken();

        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        };

        const response = await fetch(url, config);

        // Handle authentication errors
        if (response.status === 401) {
            clearTokens();
            // Redirect to login or trigger auth flow
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
            throw new Error('Authentication required');
        }

        return response;
    }, [getAccessToken, clearTokens]);

    return { authenticatedFetch };
};