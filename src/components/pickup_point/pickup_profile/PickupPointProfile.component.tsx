import React, {useState, useEffect, useRef} from 'react';
import {MapPin, Mail, Trash2, CheckCircle, Lock, EyeOff, Eye, Info} from 'lucide-react';
import type {EmailUpdateErrors, PasswordUpdateErrors} from "../../../models/User.model.ts";
import type {PickupPointUpdateRequest} from "../../../models/PickupPoint.model.ts";
import "./PickupPointProfile.style.scss"

// Mock pickup point data
const mockPickupPoint = {
    id: "pickup_001",
    email: "pickup@example.com",
    isActive: true,
    isLocked: false,
    address: {
        id: "addr_001",
        region: "Московская область",
        city: "Москва",
        street: "ул. Тверская",
        house: "12А",
        postalCode: "123456"
    },
    workingHours: "Пн-Пт: 9:00-18:00, Сб: 10:00-16:00",
    phoneNumber: "+7900654321",
    addInfo: "Вход со двора, 2 этаж, офис 205. Работаем без перерыва на обед. При получении заказа необходим документ, удостоверяющий личность."
};

type ProfileSection = 'overview' | 'info' | 'delete' | 'email' | 'password';

interface FormErrors {
    info?: Partial<PickupPointUpdateRequest>;
    email?: EmailUpdateErrors;
    password?: PasswordUpdateErrors;
}

const PickupPointProfile: React.FC = () => {
    const [pickupPointData, setPickupPointData] = useState(mockPickupPoint);
    const [activeSection, setActiveSection] = useState<ProfileSection>('overview');
    const [errors, setErrors] = useState<FormErrors>({});
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const [emailCodeInputs, setEmailCodeInputs] = useState<string[]>(Array(6).fill(''));
    const [passwordCodeInputs, setPasswordCodeInputs] = useState<string[]>(Array(6).fill(''));

    const emailInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const passwordInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [infoForm, setInfoForm] = useState<PickupPointUpdateRequest>({
        workingHours: pickupPointData.workingHours,
        phoneNumber: pickupPointData.phoneNumber,
        addInfo: pickupPointData.addInfo,
    });

    const [emailForm, setEmailForm] = useState({
        newEmail: '',
        verificationCode: '',
        step: 1,
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        verificationCode: '',
        step: 1,
        showCurrentPassword: false,
        showNewPassword: false,
    });

    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    useEffect(() => {
        setInfoForm({
            workingHours: pickupPointData.workingHours,
            phoneNumber: pickupPointData.phoneNumber,
            addInfo: pickupPointData.addInfo,
        });
    }, [pickupPointData]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Validation functions
    const validateInfoForm = (): { isValid: boolean; requestBody: Partial<PickupPointUpdateRequest> } => {
        const infoErrors: Partial<PickupPointUpdateRequest> = {};
        const requestBody: Partial<PickupPointUpdateRequest> = {};
        if (pickupPointData.workingHours !== infoForm.workingHours) {
            if (!infoForm.workingHours.trim()) {
                infoErrors.workingHours = 'Режим работы обязателен';
            } else {
                requestBody.workingHours = infoForm.workingHours;
            }
        }

        if (pickupPointData.phoneNumber !== infoForm.phoneNumber) {
            if (!infoForm.phoneNumber.trim()) {
                infoErrors.phoneNumber = 'Номер телефона обязателен';
            } else if (!/^\+?[1-9]\d{9,14}$/.test(infoForm.phoneNumber)) {
                infoErrors.phoneNumber = 'Некорректный номер телефона';
            } else {
                requestBody.phoneNumber = infoForm.phoneNumber;
            }
        }

        if (pickupPointData.addInfo !== infoForm.addInfo) {
            requestBody.addInfo = infoForm.addInfo.trim();
        }

        setErrors(prev => ({ ...prev, info: infoErrors }));
        return {
            isValid: Object.keys(infoErrors).length === 0,
            requestBody,
        };
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

    // Submit handlers
    const handleInfoUpdate = async () => {
        const { isValid, requestBody } = validateInfoForm();

        if (!isValid) return;

        if (Object.keys(requestBody).length === 0) {
            setSuccessMessage('Нет изменений для сохранения');
            return;
        }

        setIsLoading(true);
        try {
            console.log(requestBody);
            // Имитация API-запроса
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Обновим только изменённые поля в pickupPointData
            setPickupPointData(prev => ({
                ...prev,
                ...requestBody,
            }));

            setSuccessMessage('Информация о пункте выдачи успешно обновлена');
            setActiveSection('overview');
        } catch (error) {
            console.error('Ошибка обновления информации:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProfile = async () => {
        if (deleteConfirmation !== 'УДАЛИТЬ') {
            alert('Введите "УДАЛИТЬ" для подтверждения');
            return;
        }

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSuccessMessage('Пункт выдачи успешно удален');
            setActiveSection('overview');
        } catch (error) {
            console.error('Ошибка удаления пункта выдачи:', error);
        } finally {
            setIsLoading(false);
        }
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
                console.error('Ошибка отправки кода:', error);
                setErrors(prev => ({...prev, email: {newEmail: 'Ошибка отправки кода'}}));
            }
        } else {
            const code = emailCodeInputs.join('');
            if (code.length !== 6) {
                setErrors(prev => ({...prev, email: {verificationCode: 'Введите полный код'}}));
                return;
            }

            try {
                //await updateUserEmail(emailForm.newEmail, code);
                setSuccessMessage('Email успешно обновлен');
                setEmailForm({newEmail: '', verificationCode: '', step: 1});
                setEmailCodeInputs(Array(6).fill(''));
                setActiveSection('overview');
            } catch (error) {
                console.error('Ошибка обновления email:', error);
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
                console.error('Ошибка отправки кода:', error);
                setErrors(prev => ({...prev, password: {currentPassword: 'Ошибка отправки кода'}}));
            }
        } else {
            const code = passwordCodeInputs.join('');
            if (code.length !== 6) {
                setErrors(prev => ({...prev, password: {verificationCode: 'Введите полный код'}}));
                return;
            }

            try {
                //await updateUserPassword(passwordForm.currentPassword, passwordForm.newPassword, code);
                setSuccessMessage('Пароль успешно обновлен');
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
                console.error('Ошибка обновления пароля:', error);
                setErrors(prev => ({...prev, password: {verificationCode: 'Неверный код'}}));
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="pickup-point-profile max-w-6xl mx-auto px-4">
                {successMessage && (
                    <div
                        className="success-message mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                        <CheckCircle size={20} className="mr-2"/>
                        {successMessage}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="profile-wrapper flex">
                        {/* Sidebar */}
                        <div className="sidebar w-1/4 bg-gray-100 border-r">
                            <div className="seller-header p-6 border-b">
                                <div className="company-info flex items-center space-x-3">
                                    <div
                                        className="avatar w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                        <MapPin size={24} className="text-white"/>
                                    </div>
                                    <div className="text-info">
                                        <h2 className="font-semibold text-lg">Пункт выдачи</h2>
                                        <p className="text-sm text-gray-600">{pickupPointData.email}</p>
                                        <div className="status flex items-center mt-1">
                                            <div
                                                className={`w-2 h-2 rounded-full mr-2 ${pickupPointData.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="text-xs text-gray-500">
                                                {pickupPointData.isActive ? 'Активен' : 'Неактивен'}
                                                {pickupPointData.isLocked && ' (Заблокирован)'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <nav className="nav p-4 space-y-2">
                                <button
                                    onClick={() => setActiveSection('overview')}
                                    className={`nav-item w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                        activeSection === 'overview' ? 'active' : ''
                                    }`}
                                >
                                    <MapPin size={20}/>
                                    <span>Обзор</span>
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
                                    onClick={() => setActiveSection('info')}
                                    className={`nav-item w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                        activeSection === 'info' ? 'active' : ''
                                    }`}
                                >
                                    <Info size={20}/>
                                    <span>Информация о пвз</span>
                                </button>
                                <button
                                    onClick={() => setActiveSection('delete')}
                                    className={`nav-item w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                        activeSection === 'delete' ? 'delete' : ''
                                    }`}
                                >
                                    <Trash2 size={20}/>
                                    <span>Удаление аккаунта</span>
                                </button>
                            </nav>
                        </div>

                        {/* Main Content */}
                        <div className="seller-overview flex-1 p-8">
                            {activeSection === 'overview' && (
                                <div>
                                    <h3 className="text-2xl font-bold mb-6">Обзор пункта выдачи</h3>
                                    <div className="info-grid grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="info-block bg-gray-50 p-6 rounded-lg">
                                            <h4 className="font-semibold text-lg mb-3">Основная информация</h4>
                                            <div className="space-y-2">
                                                <p><strong>ID:</strong> {pickupPointData.id}</p>
                                                <p><strong>Email:</strong> {pickupPointData.email}</p>
                                                <p><strong>Телефон:</strong> {pickupPointData.phoneNumber}</p>
                                                <p><strong>Режим работы:</strong> {pickupPointData.workingHours}</p>
                                            </div>
                                        </div>

                                        <div className="info-block bg-gray-50 p-6 rounded-lg">
                                            <h4 className="font-semibold text-lg mb-3">Адрес</h4>
                                            <div className="space-y-2">
                                                <p><strong>Регион:</strong> {pickupPointData.address.region}</p>
                                                <p><strong>Город:</strong> {pickupPointData.address.city}</p>
                                                <p><strong>Улица:</strong> {pickupPointData.address.street}</p>
                                                <p><strong>Дом:</strong> {pickupPointData.address.house}</p>
                                                <p><strong>Индекс:</strong> {pickupPointData.address.postalCode}</p>
                                            </div>
                                        </div>

                                        <div className="info-block full-width bg-gray-50 p-6 rounded-lg md:col-span-2">
                                            <h4 className="font-semibold text-lg mb-3">Дополнительная информация</h4>
                                            <p className="text-sm text-gray-600">{pickupPointData.addInfo}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'email' && (
                                <div className="email-section">
                                    <h3>Изменить Email</h3>
                                    {emailForm.step === 1 ? (
                                        <form className="email-form">
                                            <div className="form-group">
                                                <label>Текущий email</label>
                                                <input type="email" value={pickupPointData.email} disabled/>
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
                                            <div className="form-actions">
                                                <button type="button" onClick={handleEmailUpdate}
                                                        className="submit-button">
                                                    Отправить код подтверждения
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="verification-form">
                                            <p>Код подтверждения отправлен на {pickupPointData.email}</p>
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

                                            <div className="form-actions">
                                                <button type="button" onClick={handlePasswordUpdate}
                                                        className="submit-button">
                                                    Отправить код подтверждения
                                                </button>
                                            </div>
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

                            {activeSection === 'info' && (
                                <div className="company-section">
                                    <h3 className="text-2xl font-bold mb-6">Информация о пункте выдачи</h3>
                                    <div className="form-wrapper max-w-2xl">
                                        <div className="space-y-4form-group">
                                            <div className="form-group">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Режим работы
                                                </label>
                                                <input
                                                    type="text"
                                                    value={infoForm.workingHours}
                                                    onChange={(e) => setInfoForm(prev => ({
                                                        ...prev,
                                                        workingHours: e.target.value
                                                    }))}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        errors.info?.workingHours ? 'border-red-500 error' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors.info?.workingHours && (
                                                    <p className="error-text text-red-500 text-sm mt-1">{errors.info.workingHours}</p>
                                                )}
                                            </div>

                                            <div className="form-group">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Номер телефона
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={infoForm.phoneNumber}
                                                    onChange={(e) => setInfoForm(prev => ({
                                                        ...prev,
                                                        phoneNumber: e.target.value
                                                    }))}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        errors.info?.phoneNumber ? 'border-red-500 error' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors.info?.phoneNumber && (
                                                    <p className="text-red-500 text-sm mt-1 error">{errors.info.phoneNumber}</p>
                                                )}
                                            </div>

                                            <div className="form-group">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Дополнительная информация
                                                </label>
                                                <textarea
                                                    value={infoForm.addInfo}
                                                    onChange={(e) => setInfoForm(prev => ({
                                                        ...prev,
                                                        addInfo: e.target.value
                                                    }))}
                                                    rows={4}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        errors.info?.addInfo ? 'border-red-500 error' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors.info?.addInfo && (
                                                    <p className="text-red-500 text-sm mt-1 error">{errors.info?.addInfo}</p>
                                                )}
                                            </div>

                                            <div className="form-actions flex space-x-4 pt-4">
                                                <button
                                                    onClick={handleInfoUpdate}
                                                    disabled={isLoading}
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed submit-button"
                                                >
                                                    {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                                                </button>
                                                <button
                                                    onClick={() => setActiveSection('overview')}
                                                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 cancel-button"
                                                >
                                                    Отмена
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'delete' && (
                                <div className="delete-section">
                                    <h3 className="text-2xl font-bold mb-6 text-red-600">Удаление профиля продавца</h3>
                                    <div className="max-w-2xl form-wrapper">
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                                            <div className="flex items-start">
                                                <Trash2 className="text-red-500 mr-3 mt-1" size={24}/>
                                                <div className={"form-group"}>
                                                    <h4 className="text-lg font-semibold text-red-800 mb-2 disclaimer">
                                                        Внимание!
                                                    </h4>
                                                    <div className="text-red-700 space-y-2 ">
                                                        <p>При удалении профиля пвз его работа будет прекращена.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="form-group">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Для подтверждения удаления введите слово <strong
                                                    className="text-red-600">"УДАЛИТЬ"</strong> в поле ниже:
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
                                                    disabled={isLoading || deleteConfirmation !== 'УДАЛИТЬ'}
                                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors delete-button"
                                                >
                                                    {isLoading ? 'Удаление...' : 'Удалить профиль'}
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
            </div>
        </div>);
}

export default PickupPointProfile;