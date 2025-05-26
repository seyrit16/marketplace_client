// components/user_profile/UserProfile.component.tsx
import React, {useState, useRef, useEffect} from 'react';
import {ArrowLeft, User, Mail, Lock, CreditCard, Plus, Trash2, Star, Eye, EyeOff, Package} from 'lucide-react';

import './UserProfile.style.scss';
import {useUser} from '../../../context/UserContext';
import type {
    EmailUpdateErrors,
    PasswordUpdateErrors,
    PaymentCardErrors,
    UserProfileErrors
} from '../../../models/User.model';
import {
    getOrderMainStatus,
    getOrderStatusText,
    isActiveOrder, mockOrders,
    type Order,
    type OrderFilters,
    OrderItemStatus
} from "../../../models/Order.model.ts";

type ProfileSection = 'orders' |'overview' | 'personal' | 'email' | 'password' | 'cards' | 'delete';

const UserProfile: React.FC = () => {
    const {
        state,
        updateUserProfile,
        updateUserEmail,
        updateUserPassword,
        sendEmailVerificationCode,
        sendPasswordResetCode,
        addPaymentCard,
        deletePaymentCard,
        setDefaultCard
    } = useUser();

    const [activeSection, setActiveSection] = useState<ProfileSection>('overview');
    const [errors, setErrors] = useState<{
        profile?: UserProfileErrors;
        email?: EmailUpdateErrors;
        password?: PasswordUpdateErrors;
        card?: PaymentCardErrors;
    }>({});

    // Personal info form state
    const [personalForm, setPersonalForm] = useState({
        surname: state.user?.userProfile.surname || '',
        name: state.user?.userProfile.name || '',
        patronymic: state.user?.userProfile.patronymic || '',
        phoneNumber: state.user?.userProfile.phoneNumber || '',
    });

    // Email update form state
    const [emailForm, setEmailForm] = useState({
        newEmail: '',
        verificationCode: '',
        step: 1, // 1 - enter email, 2 - enter code
    });

    // Password update form state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        verificationCode: '',
        step: 1, // 1 - enter passwords, 2 - enter code
        showCurrentPassword: false,
        showNewPassword: false,
    });

    // Payment card form state
    const [cardForm, setCardForm] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolderName: '',
        isDefault: false,
        showForm: false,
    });

    // Code input states
    const [emailCodeInputs, setEmailCodeInputs] = useState<string[]>(Array(6).fill(''));
    const [passwordCodeInputs, setPasswordCodeInputs] = useState<string[]>(Array(6).fill(''));

    // Refs for autofocus
    const emailInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const passwordInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [orderTab, setOrderTab] = useState<'active' | 'history'>('active');
    const [filters, setFilters] = useState<OrderFilters>({});
    const [orders, setOrders] = useState<Order[]>(mockOrders);//([]);

    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    const filteredOrders = orders
        .filter(order => !isActiveOrder(order))
        .filter(order => {
            if (filters.status) {
                const statuses = order.items.map(i => i.itemStatus);
                if (!filters.status.some(status => statuses.includes(status))) return false;
            }
            if (filters.dateFrom && new Date(order.createdAt) < new Date(filters.dateFrom)) return false;
            if (filters.dateTo && new Date(order.createdAt) > new Date(filters.dateTo)) return false;
            if (
                filters.searchQuery &&
                !order.pickupPointAddress?.toLowerCase().includes(filters.searchQuery.toLowerCase())
            ) return false;

            return true;
        });

    useEffect(() => {
        if (state.user) {
            setPersonalForm({
                surname: state.user.userProfile.surname,
                name: state.user.userProfile.name,
                patronymic: state.user.userProfile.patronymic,
                phoneNumber: state.user.userProfile.phoneNumber,
            });
        }
    }, [state.user]);

    // Validation functions
    const validatePersonalInfo = () => {
        const profileErrors: UserProfileErrors = {};

        if (!personalForm.name.trim()) profileErrors.name = 'Имя не должно быть пустым';
        if (!personalForm.surname.trim()) profileErrors.surname = 'Фамилия не должна быть пустой';
        if (personalForm.phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(personalForm.phoneNumber)) {
            profileErrors.phoneNumber = 'Некорректный номер телефона';
        }

        setErrors(prev => ({...prev, profile: profileErrors}));
        return Object.keys(profileErrors).length === 0;
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) ? '' : 'Некорректный email адрес';
    };

    const validatePassword = (password: string) => {
        const passwordRegex = /^(?=.*[A-Za-zА-Яа-яЁё])(?=.*\d)[A-Za-zА-Яа-яЁё\d]{8,}$/;
        return passwordRegex.test(password)
            ? ''
            : 'Пароль должен содержать минимум 8 символов, включая буквы и цифры';
    };

    const validateCard = () => {
        const cardErrors: PaymentCardErrors = {};

        if (!/^\d{16}$/.test(cardForm.cardNumber.replace(/\s/g, ''))) {
            cardErrors.cardNumber = 'Номер карты должен содержать 16 цифр';
        }
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardForm.expiryDate)) {
            cardErrors.expiryDate = 'Дата должна быть в формате MM/YY';
        }
        if (!/^\d{3}$/.test(cardForm.cvv)) {
            cardErrors.cvv = 'CVV должен содержать 3 цифры';
        }
        if (!cardForm.cardHolderName.trim()) {
            cardErrors.cardHolderName = 'Имя держателя карты обязательно';
        }

        setErrors(prev => ({...prev, card: cardErrors}));
        return Object.keys(cardErrors).length === 0;
    };

    // Code input handlers
    const handleCodeChange = (
        index: number,
        value: string,
        codeInputs: string[],
        setCodeInputs: React.Dispatch<React.SetStateAction<string[]>>,
        inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
    ) => {
        if (/^[0-9]?$/.test(value)) {
            const newCodeInputs = [...codeInputs];
            newCodeInputs[index] = value;
            setCodeInputs(newCodeInputs);

            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleCodeKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
        codeInputs: string[],
        inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
    ) => {
        if (e.key === 'Backspace' && !codeInputs[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Form handlers
    const handlePersonalInfoSubmit = async () => {
        if (!validatePersonalInfo()) return;

        try {
            await updateUserProfile(personalForm);
            alert('Личные данные успешно обновлены');
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
        }
    };

    const handleEmailUpdate = async () => {
        if (emailForm.step === 1) {
            const emailError = validateEmail(emailForm.newEmail);
            if (emailError) {
                setErrors(prev => ({...prev, email: {newEmail: emailError}}));
                return;
            }

            try {
                // todo добавить отправку кода
                //await sendEmailVerificationCode(emailForm.newEmail);
                setEmailForm(prev => ({...prev, step: 2}));
                setErrors(prev => ({...prev, email: {}}));
            } catch (error) {
                console.error('<UNK> <UNK> <UNK>:', error);
                setErrors(prev => ({...prev, email: {newEmail: 'Ошибка отправки кода'}}));
            }
        } else {
            const code = emailCodeInputs.join('');
            if (code.length !== 6) {
                setErrors(prev => ({...prev, email: {verificationCode: 'Введите полный код'}}));
                return;
            }

            try {
                await updateUserEmail(emailForm.newEmail, code);
                alert('Email успешно обновлен');
                setEmailForm({newEmail: '', verificationCode: '', step: 1});
                setEmailCodeInputs(Array(6).fill(''));
                setActiveSection('overview');
            } catch (error) {
                console.error('<UNK> <UNK> <UNK>:', error);
                setErrors(prev => ({...prev, email: {verificationCode: 'Неверный код'}}));
            }
        }
    };

    const handlePasswordUpdate = async () => {
        if (passwordForm.step === 1) {
            const passwordError = validatePassword(passwordForm.newPassword);
            if (passwordError) {
                setErrors(prev => ({...prev, password: {newPassword: passwordError}}));
                return;
            }

            try {
                // todo добавить отправку кода
                //await sendPasswordResetCode();
                setPasswordForm(prev => ({...prev, step: 2}));
                setErrors(prev => ({...prev, password: {}}));
            } catch (error) {
                console.error('<UNK> <UNK> <UNK>:', error);
                setErrors(prev => ({...prev, password: {currentPassword: 'Ошибка отправки кода'}}));
            }
        } else {
            const code = passwordCodeInputs.join('');
            if (code.length !== 6) {
                setErrors(prev => ({...prev, password: {verificationCode: 'Введите полный код'}}));
                return;
            }

            try {
                await updateUserPassword(passwordForm.currentPassword, passwordForm.newPassword, code);
                alert('Пароль успешно обновлен');
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    verificationCode: '',
                    step: 1,
                    showCurrentPassword: false,
                    showNewPassword: false,
                });
                setPasswordCodeInputs(Array(6).fill(''));
                setActiveSection('overview');
            } catch (error) {
                console.error('<UNK> <UNK> <UNK>:', error);
                setErrors(prev => ({...prev, password: {verificationCode: 'Неверный код'}}));
            }
        }
    };

    const handleAddCard = async () => {
        if (!validateCard()) return;

        try {
            const cardData = {
                cardNumber: cardForm.cardNumber.replace(/\s/g, ''),
                expiryDate: cardForm.expiryDate,
                cvv: cardForm.cvv,
                cardHolderName: cardForm.cardHolderName,
                isDefault: cardForm.isDefault,
            };
            await addPaymentCard(cardData);
            setCardForm({
                cardNumber: '',
                expiryDate: '',
                cvv: '',
                cardHolderName: '',
                isDefault: false,
                showForm: false,
            });
            alert('Карта успешно добавлена');
        } catch (error) {
            console.error('Ошибка добавления карты:', error);
        }
    };

    const formatCardNumber = (value: string) => {
        return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    };

    const getCardTypeIcon = (cardType: string) => {
        switch (cardType) {
            case 'VISA':
                return '💳';
            case 'MASTERCARD':
                return '💳';
            case 'MIR':
                return '💳';
            default:
                return '💳';
        }
    };

    const handleDeleteProfile = async () => {
        if (deleteConfirmation !== 'УДАЛИТЬ') {
            alert('Введите "УДАЛИТЬ" для подтверждения');
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            setActiveSection('overview');
        } catch (error) {
            console.error('Ошибка удаления профиля:', error);
        } finally {
        }
    };

    return (
        <div className="user-profile">

            <div className="profile-container">
                <div className="profile-sidebar">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            <User size={40}/>
                        </div>
                        <div className="profile-info">
                            <h2>{state.user.userProfile.name} {state.user.userProfile.surname}</h2>
                            <p>{state.user.email}</p>
                        </div>
                    </div>

                    <nav className="profile-nav">
                        <button
                            className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveSection('overview')}
                        >
                            <User size={20}/>
                            <span>Профиль</span>
                        </button>
                        <button
                            className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveSection('orders')}
                        >
                            <Package size={20} />
                            <span>Заказы</span>
                        </button>
                        <button
                            className={`nav-item ${activeSection === 'personal' ? 'active' : ''}`}
                            onClick={() => setActiveSection('personal')}
                        >
                            <User size={20}/>
                            <span>Личные данные</span>
                        </button>
                        <button
                            className={`nav-item ${activeSection === 'email' ? 'active' : ''}`}
                            onClick={() => setActiveSection('email')}
                        >
                            <Mail size={20}/>
                            <span>Изменить Email</span>
                        </button>
                        <button
                            className={`nav-item ${activeSection === 'password' ? 'active' : ''}`}
                            onClick={() => setActiveSection('password')}
                        >
                            <Lock size={20}/>
                            <span>Изменить пароль</span>
                        </button>
                        <button
                            className={`nav-item ${activeSection === 'cards' ? 'active' : ''}`}
                            onClick={() => setActiveSection('cards')}
                        >
                            <CreditCard size={20}/>
                            <span>Способы оплаты</span>
                        </button>
                        <button
                            onClick={() => setActiveSection('delete')}
                            className={`nav-item w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                activeSection === 'delete' ? 'delete' : ''
                            }`}
                        >
                            <Trash2 size={20}/>
                            <span>Удаление профиля</span>
                        </button>
                    </nav>
                </div>

                <div className="profile-content">
                    {activeSection === 'overview' && (
                        <div className="overview-section">
                            <h3>Профиль</h3>
                            <div className="overview-cards">
                                <div className="info-card">
                                    <h4>Личная информация</h4>
                                    <p><strong>Имя:</strong> {state.user.userProfile.name}</p>
                                    <p><strong>Фамилия:</strong> {state.user.userProfile.surname}</p>
                                    <p>
                                        <strong>Отчество:</strong> {state.user.userProfile.patronymic || 'Не указано'}
                                    </p>
                                </div>
                                <div className="info-card">
                                    <h4>Контактная информация</h4>
                                    <p>
                                        <strong>Телефон:</strong> {state.user.userProfile.phoneNumber || 'Не указан'}
                                    </p>
                                    <p><strong>Email:</strong> {state.user.email}</p>
                                </div>
                                <div className="info-card">
                                    <h4>Способы оплаты</h4>
                                    <p><strong>Добавлено карт:</strong> {state.paymentCards.length}</p>
                                    {state.paymentCards.length > 0 && (
                                        <p><strong>Основная
                                            карта:</strong> **** {state.paymentCards.find(c => c.isDefault)?.lastFourDigits || 'Не выбрана'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'orders' && (
                        <div className="orders-section">
                            <h3>Мои заказы</h3>

                            <div className="orders-tabs">
                                <button
                                    className={`tab ${orderTab === 'active' ? 'active' : ''}`}
                                    onClick={() => setOrderTab('active')}
                                >
                                    Активные
                                </button>
                                <button
                                    className={`tab ${orderTab === 'history' ? 'active' : ''}`}
                                    onClick={() => setOrderTab('history')}
                                >
                                    История
                                </button>
                            </div>

                            {orderTab === 'active' && (
                                <div className="order-list">
                                    {orders.filter(isActiveOrder).map(order => (
                                        <div key={order.id} className="order-card">
                                            <h4>Заказ #{order.id.slice(0, 8)}</h4>
                                            <p>Статус: {getOrderStatusText(getOrderMainStatus(order))}</p>
                                            <p>Сумма: {order.fullPrice.toFixed(2)} ₽</p>
                                            <p>Дата: {new Date(order.createdAt).toLocaleDateString()}</p>
                                            <p>Пункт выдачи: {order.pickupPointAddress}</p>
                                        </div>
                                    ))}
                                    {orders.filter(isActiveOrder).length === 0 && <p>Нет активных заказов.</p>}
                                </div>
                            )}

                            {orderTab === 'history' && (
                                <>
                                    <div className="order-filters">
                                        <label>Статус:</label>
                                        <select
                                            value={filters.status || ''}
                                            onChange={e =>
                                                setFilters(prev => ({
                                                    ...prev,
                                                    status: e.target.value ? [e.target.value as OrderItemStatus] : undefined
                                                }))
                                            }
                                        >
                                            <option value="">Все</option>
                                            {Object.values(OrderItemStatus).map(status => (
                                                <option key={status} value={status}>
                                                    {getOrderStatusText(status)}
                                                </option>
                                            ))}
                                        </select>

                                        <label>С даты:</label>
                                        <input
                                            type="date"
                                            value={filters.dateFrom || ''}
                                            onChange={e =>
                                                setFilters(prev => ({ ...prev, dateFrom: e.target.value }))
                                            }
                                        />
                                        <label>По дату:</label>
                                        <input
                                            type="date"
                                            value={filters.dateTo || ''}
                                            onChange={e =>
                                                setFilters(prev => ({ ...prev, dateTo: e.target.value }))
                                            }
                                        />

                                        <label>Поиск:</label>
                                        <input
                                            type="text"
                                            placeholder="Поиск по адресу"
                                            value={filters.searchQuery || ''}
                                            onChange={e =>
                                                setFilters(prev => ({ ...prev, searchQuery: e.target.value }))
                                            }
                                        />
                                    </div>

                                    <div className="order-list">
                                        {filteredOrders.map(order => (
                                            <div key={order.id} className="order-card">
                                                <h4>Заказ #{order.id.slice(0, 8)}</h4>
                                                <p>Статус: {getOrderStatusText(getOrderMainStatus(order))}</p>
                                                <p>Сумма: {order.fullPrice.toFixed(2)} ₽</p>
                                                <p>Дата: {new Date(order.createdAt).toLocaleDateString()}</p>
                                                <p>Пункт выдачи: {order.pickupPointAddress}</p>
                                            </div>
                                        ))}
                                        {filteredOrders.length === 0 && <p>Нет заказов по выбранным фильтрам.</p>}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeSection === 'personal' && (
                        <div className="personal-section">
                            <h3>Личные данные</h3>
                            <form className="personal-form">
                                <div className="form-group">
                                    <label>Имя *</label>
                                    <input
                                        type="text"
                                        value={personalForm.name}
                                        onChange={(e) => setPersonalForm(prev => ({
                                            ...prev,
                                            name: e.target.value
                                        }))}
                                        className={errors.profile?.name ? 'error' : ''}
                                    />
                                    {errors.profile?.name &&
                                        <span className="error-text">{errors.profile.name}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Фамилия *</label>
                                    <input
                                        type="text"
                                        value={personalForm.surname}
                                        onChange={(e) => setPersonalForm(prev => ({
                                            ...prev,
                                            surname: e.target.value
                                        }))}
                                        className={errors.profile?.surname ? 'error' : ''}
                                    />
                                    {errors.profile?.surname &&
                                        <span className="error-text">{errors.profile.surname}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Отчество</label>
                                    <input
                                        type="text"
                                        value={personalForm.patronymic}
                                        onChange={(e) => setPersonalForm(prev => ({
                                            ...prev,
                                            patronymic: e.target.value
                                        }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Номер телефона</label>
                                    <input
                                        type="tel"
                                        value={personalForm.phoneNumber}
                                        onChange={(e) => setPersonalForm(prev => ({
                                            ...prev,
                                            phoneNumber: e.target.value
                                        }))}
                                        className={errors.profile?.phoneNumber ? 'error' : ''}
                                    />
                                    {errors.profile?.phoneNumber &&
                                        <span className="error-text">{errors.profile.phoneNumber}</span>}
                                </div>
                                <button type="button" onClick={handlePersonalInfoSubmit}
                                        className="submit-button">
                                    Сохранить изменения
                                </button>
                            </form>
                        </div>
                    )}

                    {activeSection === 'email' && (
                        <div className="email-section">
                            <h3>Изменить Email</h3>
                            {emailForm.step === 1 ? (
                                <form className="email-form">
                                    <div className="form-group">
                                        <label>Текущий email</label>
                                        <input type="email" value={state.user.email} disabled/>
                                    </div>
                                    <div className="form-group">
                                        <label>Новый email *</label>
                                        <input
                                            type="email"
                                            value={emailForm.newEmail}
                                            onChange={(e) => setEmailForm(prev => ({
                                                ...prev,
                                                newEmail: e.target.value
                                            }))}
                                            className={errors.email?.newEmail ? 'error' : ''}
                                        />
                                        {errors.email?.newEmail &&
                                            <span className="error-text">{errors.email.newEmail}</span>}
                                    </div>
                                    <button type="button" onClick={handleEmailUpdate} className="submit-button">
                                        Отправить код подтверждения
                                    </button>
                                </form>
                            ) : (
                                <div className="verification-form">
                                    <p>Код подтверждения отправлен на {state.user.email}</p>
                                    <div className="code-inputs">
                                        {emailCodeInputs.map((value, index) => (
                                            <input
                                                key={index}
                                                type="text"
                                                maxLength={1}
                                                value={value}
                                                onChange={(e) => handleCodeChange(index, e.target.value, emailCodeInputs, setEmailCodeInputs, emailInputRefs)}
                                                onKeyDown={(e) => handleCodeKeyDown(index, e, emailCodeInputs, emailInputRefs)}
                                                ref={(el) => {
                                                    emailInputRefs.current[index] = el;
                                                }}
                                                className="code-input"
                                            />
                                        ))}
                                    </div>
                                    {errors.email?.verificationCode &&
                                        <span className="error-text">{errors.email.verificationCode}</span>}
                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            onClick={() => setEmailForm(prev => ({...prev, step: 1}))}
                                            className="secondary-button"
                                        >
                                            Назад
                                        </button>
                                        <button type="button" onClick={handleEmailUpdate}
                                                className="submit-button">
                                            Подтвердить
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'password' && (
                        <div className="password-section">
                            <h3>Изменить пароль</h3>
                            {passwordForm.step === 1 ? (
                                <form className="password-form">

                                    <div className="form-group">
                                        <label>Новый пароль *</label>
                                        <div className="password-input">
                                            <input
                                                type={passwordForm.showNewPassword ? 'text' : 'password'}
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm(prev => ({
                                                    ...prev,
                                                    newPassword: e.target.value
                                                }))}
                                                className={errors.password?.newPassword ? 'error' : ''}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setPasswordForm(prev => ({
                                                    ...prev,
                                                    showNewPassword: !prev.showNewPassword
                                                }))}
                                                className="password-toggle"
                                            >
                                                {passwordForm.showNewPassword ? <EyeOff size={20}/> :
                                                    <Eye size={20}/>}
                                            </button>
                                        </div>
                                        {errors.password?.newPassword &&
                                            <span className="error-text">{errors.password.newPassword}</span>}
                                    </div>
                                    <button type="button" onClick={handlePasswordUpdate}
                                            className="submit-button">
                                        Отправить код подтверждения
                                    </button>
                                </form>
                            ) : (
                                <div className="verification-form">
                                    <p>Код подтверждения отправлен на ваш email</p>
                                    <div className="code-inputs">
                                        {passwordCodeInputs.map((value, index) => (
                                            <input
                                                key={index}
                                                type="text"
                                                maxLength={1}
                                                value={value}
                                                onChange={(e) => handleCodeChange(index, e.target.value, passwordCodeInputs, setPasswordCodeInputs, passwordInputRefs)}
                                                onKeyDown={(e) => handleCodeKeyDown(index, e, passwordCodeInputs, passwordInputRefs)}
                                                ref={(el) => {
                                                    passwordInputRefs.current[index] = el;
                                                }}
                                                className="code-input"
                                            />
                                        ))}
                                    </div>
                                    {errors.password?.verificationCode &&
                                        <span className="error-text">{errors.password.verificationCode}</span>}
                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            onClick={() => setPasswordForm(prev => ({...prev, step: 1}))}
                                            className="secondary-button"
                                        >
                                            Назад
                                        </button>
                                        <button type="button" onClick={handlePasswordUpdate}
                                                className="submit-button">
                                            Подтвердить
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'cards' && (
                        <div className="cards-section">
                            <div className="cards-header">
                                <h3>Способы оплаты</h3>
                                <button
                                    className="add-card-button"
                                    onClick={() => setCardForm(prev => ({...prev, showForm: !prev.showForm}))}
                                >
                                    <Plus size={20}/>
                                    <span>Добавить карту</span>
                                </button>
                            </div>

                            {cardForm.showForm && (
                                <form className="card-form">
                                    <div className="form-group">
                                        <label>Номер карты *</label>
                                        <input
                                            type="text"
                                            value={formatCardNumber(cardForm.cardNumber)}
                                            onChange={(e) => setCardForm(prev => ({
                                                ...prev,
                                                cardNumber: e.target.value.replace(/\s/g, '')
                                            }))}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                            className={errors.card?.cardNumber ? 'error' : ''}
                                        />
                                        {errors.card?.cardNumber &&
                                            <span className="error-text">{errors.card.cardNumber}</span>}
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Срок действия *</label>
                                            <input
                                                type="text"
                                                value={cardForm.expiryDate}
                                                onChange={(e) => {
                                                    let value = e.target.value.replace(/\D/g, '');
                                                    if (value.length >= 2) {
                                                        value = value.substring(0, 2) + '/' + value.substring(2, 4);
                                                    }
                                                    setCardForm(prev => ({...prev, expiryDate: value}));
                                                }}
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                className={errors.card?.expiryDate ? 'error' : ''}
                                            />
                                            {errors.card?.expiryDate &&
                                                <span className="error-text">{errors.card.expiryDate}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>CVV *</label>
                                            <input
                                                type="text"
                                                value={cardForm.cvv}
                                                onChange={(e) => setCardForm(prev => ({
                                                    ...prev,
                                                    cvv: e.target.value.replace(/\D/g, '')
                                                }))}
                                                placeholder="123"
                                                maxLength={3}
                                                className={errors.card?.cvv ? 'error' : ''}
                                            />
                                            {errors.card?.cvv &&
                                                <span className="error-text">{errors.card.cvv}</span>}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Имя держателя карты *</label>
                                        <input
                                            type="text"
                                            value={cardForm.cardHolderName}
                                            onChange={(e) => setCardForm(prev => ({
                                                ...prev,
                                                cardHolderName: e.target.value
                                            }))}
                                            placeholder="IVAN IVANOV"
                                            className={errors.card?.cardHolderName ? 'error' : ''}
                                        />
                                        {errors.card?.cardHolderName &&
                                            <span className="error-text">{errors.card.cardHolderName}</span>}
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={cardForm.isDefault}
                                                onChange={(e) => setCardForm(prev => ({
                                                    ...prev,
                                                    isDefault: e.target.checked
                                                }))}
                                            />
                                            <span>Сделать основной картой</span>
                                        </label>
                                    </div>
                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            onClick={() => setCardForm(prev => ({...prev, showForm: false}))}
                                            className="secondary-button"
                                        >
                                            Отмена
                                        </button>
                                        <button type="button" onClick={handleAddCard} className="submit-button">
                                            Добавить карту
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="cards-list">
                                {state.paymentCards.length === 0 ? (
                                    <div className="no-cards">
                                        <CreditCard size={48}/>
                                        <p>У вас пока нет добавленных карт</p>
                                    </div>
                                ) : (
                                    state.paymentCards.map(card => (
                                        <div key={card.id}
                                             className={`payment-card ${card.isDefault ? 'default' : ''}`}>
                                            <div className="card-info">
                                                <div className="card-number">
                                                            <span
                                                                className="card-icon">{getCardTypeIcon(card.cardType)}</span>
                                                    <span>**** **** **** {card.lastFourDigits}</span>
                                                    {card.isDefault &&
                                                        <span className="default-badge">Основная</span>}
                                                </div>
                                            </div>
                                            <div className="card-actions">
                                                {!card.isDefault && (
                                                    <button
                                                        onClick={() => setDefaultCard(card.id)}
                                                        className="make-default-button"
                                                    >
                                                        <Star size={16}/>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deletePaymentCard(card.id)}
                                                    className="delete-button"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                    {activeSection === 'delete' && (
                        <div className="delete-section">
                            <h3 className="text-2xl font-bold mb-6 text-red-600">Удаление профиля</h3>
                            <div className="max-w-2xl form-wrapper">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                                    <div className="flex items-start">
                                        <Trash2 className="text-red-500 mr-3 mt-1" size={24}/>
                                        <div className={"form-group"}>
                                            <h4 className="text-lg font-semibold text-red-800 mb-2 disclaimer">
                                                Внимание!
                                            </h4>
                                            <div className="text-red-700 space-y-2 ">
                                                <p>При удалении профиля будут удалены:</p>
                                                <ul className="list-disc list-inside ml-4 space-y-1">
                                                    <li>Все личные данные аккаунта</li>
                                                    <li>Банковские данные</li>
                                                    <li>История заказов</li>
                                                    <li>Доступ к личному кабинету</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Для подтверждения удаления введите слово <strong className="text-red-600">"УДАЛИТЬ"</strong> в поле ниже:
                                        </label>
                                        <input
                                            type="text"
                                            value={deleteConfirmation}
                                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                                            placeholder="Введите УДАЛИТЬ"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        />
                                        <p className="text-sm text-gray-600 mt-1 disclaimer">
                                            Это поле чувствительно к регистру
                                        </p>
                                    </div>

                                    <div className="flex space-x-4 pt-4 form-actions">
                                        <button
                                            onClick={handleDeleteProfile}
                                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors delete-button"
                                        >
                                            Удалить профиль
                                        </button>
                                        <button
                                            onClick={() => {
                                                setActiveSection('overview');
                                                setDeleteConfirmation('');
                                            }}
                                            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 cancel-button"
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
};

export default UserProfile;