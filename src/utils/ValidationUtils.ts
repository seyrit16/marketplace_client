import type {
    EmailUpdateErrors,
    PasswordUpdateErrors,
    PaymentCardErrors,
    UserProfileErrors
} from "../models/User.model.ts";


export class ValidationUtils {
    // Email validation
    static validateEmail(email: string): string {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) return 'Email не должен быть пустым';
        if (!emailRegex.test(email)) return 'Некорректный формат email';
        return '';
    }

    // Password validation
    static validatePassword(password: string): string {
        if (!password) return 'Пароль не должен быть пустым';
        if (password.length < 8) return 'Пароль должен содержать минимум 8 символов';

        const hasLetter = /[A-Za-zА-Яа-яЁё]/.test(password);
        const hasNumber = /\d/.test(password);

        if (!hasLetter) return 'Пароль должен содержать буквы';
        if (!hasNumber) return 'Пароль должен содержать цифры';

        return '';
    }

    // Phone validation
    static validatePhone(phone: string): string {
        if (!phone.trim()) return ''; // Phone is optional
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phone.replace(/[\s\-()]/g, ''))) {
            return 'Некорректный формат номера телефона';
        }
        return '';
    }

    // Name validation
    static validateName(name: string, fieldName: string = 'Поле'): string {
        if (!name.trim()) return `${fieldName} не должно быть пустым`;
        if (name.trim().length < 2) return `${fieldName} должно содержать минимум 2 символа`;
        if (name.trim().length > 50) return `${fieldName} не должно превышать 50 символов`;
        return '';
    }

    // Card number validation
    static validateCardNumber(cardNumber: string): string {
        const cleanNumber = cardNumber.replace(/\s/g, '');
        if (!cleanNumber) return 'Номер карты обязателен';
        if (!/^\d{16}$/.test(cleanNumber)) return 'Номер карты должен содержать 16 цифр';

        // Luhn algorithm check
        if (!this.luhnCheck(cleanNumber)) return 'Некорректный номер карты';

        return '';
    }

    // Card expiry date validation
    static validateExpiryDate(expiryDate: string): string {
        if (!expiryDate) return 'Срок действия обязателен';
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
            return 'Формат даты должен быть MM/YY';
        }

        const [month, year] = expiryDate.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        const expYear = parseInt(year, 10);
        const expMonth = parseInt(month, 10);

        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            return 'Срок действия карты истек';
        }

        return '';
    }

    // CVV validation
    static validateCVV(cvv: string): string {
        if (!cvv) return 'CVV обязателен';
        if (!/^\d{3}$/.test(cvv)) return 'CVV должен содержать 3 цифры';
        return '';
    }

    // Card holder name validation
    static validateCardHolderName(name: string): string {
        if (!name.trim()) return 'Имя держателя карты обязательно';
        if (name.trim().length < 2) return 'Имя должно содержать минимум 2 символа';
        if (!/^[A-Za-z\s]+$/.test(name.trim())) {
            return 'Имя должно содержать только латинские буквы и пробелы';
        }
        return '';
    }

    // Verification code validation
    static validateVerificationCode(code: string): string {
        if (!code) return 'Код подтверждения обязателен';
        if (code.length !== 6) return 'Код должен содержать 6 цифр';
        if (!/^\d{6}$/.test(code)) return 'Код должен содержать только цифры';
        return '';
    }

    // Luhn algorithm for card number validation
    private static luhnCheck(cardNumber: string): boolean {
        let sum = 0;
        let isEven = false;

        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i), 10);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    // Comprehensive validation methods
    static validateUserProfile(profile: {
        name: string;
        surname: string;
        patronymic: string;
        phoneNumber: string;
    }): UserProfileErrors {
        const errors: UserProfileErrors = {};

        const nameError = this.validateName(profile.name, 'Имя');
        if (nameError) errors.name = nameError;

        const surnameError = this.validateName(profile.surname, 'Фамилия');
        if (surnameError) errors.surname = surnameError;

        const phoneError = this.validatePhone(profile.phoneNumber);
        if (phoneError) errors.phoneNumber = phoneError;

        return errors;
    }

    static validateEmailUpdate(email: string, code?: string): EmailUpdateErrors {
        const errors: EmailUpdateErrors = {};

        const emailError = this.validateEmail(email);
        if (emailError) errors.newEmail = emailError;

        if (code !== undefined) {
            const codeError = this.validateVerificationCode(code);
            if (codeError) errors.verificationCode = codeError;
        }

        return errors;
    }

    static validatePasswordUpdate(
        currentPassword: string,
        newPassword: string,
        code?: string
    ): PasswordUpdateErrors {
        const errors: PasswordUpdateErrors = {};

        if (!currentPassword) errors.currentPassword = 'Текущий пароль обязателен';

        const passwordError = this.validatePassword(newPassword);
        if (passwordError) errors.newPassword = passwordError;

        if (code !== undefined) {
            const codeError = this.validateVerificationCode(code);
            if (codeError) errors.verificationCode = codeError;
        }

        return errors;
    }

    static validatePaymentCard(card: {
        cardNumber: string;
        expiryDate: string;
        cvv: string;
        cardHolderName: string;
    }): PaymentCardErrors {
        const errors: PaymentCardErrors = {};

        const cardNumberError = this.validateCardNumber(card.cardNumber);
        if (cardNumberError) errors.cardNumber = cardNumberError;

        const expiryError = this.validateExpiryDate(card.expiryDate);
        if (expiryError) errors.expiryDate = expiryError;

        const cvvError = this.validateCVV(card.cvv);
        if (cvvError) errors.cvv = cvvError;

        const holderNameError = this.validateCardHolderName(card.cardHolderName);
        if (holderNameError) errors.cardHolderName = holderNameError;

        return errors;
    }
}

// Format utilities
export class FormatUtils {
    // Format card number with spaces
    static formatCardNumber(value: string): string {
        const cleanValue = value.replace(/\s/g, '');
        const chunks = cleanValue.match(/.{1,4}/g) || [];
        const formatted = chunks.join(' ');
        return formatted.substring(0, 19); // Limit to 16 digits + 3 spaces
    }

    // Format expiry date
    static formatExpiryDate(value: string): string {
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length >= 2) {
            return cleanValue.substring(0, 2) + '/' + cleanValue.substring(2, 4);
        }
        return cleanValue;
    }

    // Format phone number
    static formatPhoneNumber(value: string): string {
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.startsWith('7') || cleanValue.startsWith('8')) {
            const formatted = cleanValue.replace(/^[78]/, '+7');
            return formatted.replace(/(\+7)(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 ($2) $3-$4-$5');
        }
        return value;
    }

    // Mask card number for display
    static maskCardNumber(cardNumber: string): string {
        const cleanNumber = cardNumber.replace(/\s/g, '');
        if (cleanNumber.length === 16) {
            return '**** **** **** ' + cleanNumber.slice(-4);
        }
        return cardNumber;
    }

    // Get card type from number
    static getCardType(cardNumber: string): 'VISA' | 'MASTERCARD' | 'MIR' | 'UNKNOWN' {
        const cleanNumber = cardNumber.replace(/\s/g, '');

        if (/^4/.test(cleanNumber)) return 'VISA';
        if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return 'MASTERCARD';
        if (/^2/.test(cleanNumber)) return 'MIR';

        return 'UNKNOWN';
    }

    // Capitalize name
    static capitalizeName(name: string): string {
        return name
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}