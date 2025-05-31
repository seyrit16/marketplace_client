import React, { useState, useRef, useEffect } from 'react';
import SvgSelector from '../../SvgSelector.component.tsx';
import './PickupPointSignUp.style.scss';
import type {PickupPointSignUpData,PickupPointCreateRequest} from '../../../models/PickupPoint.model.ts'
import { useNavigate } from "react-router-dom";
import {sendCode, signUpPickupPoint, signUpSeller} from "../../../api/AuthApi.ts";

interface PickupPointSignUpErrors {
    email?: string;
    password?: string;
    code?: string;
    address?: {
        region?: string;
        city?: string;
        street?: string;
        houseNumber?: string;
        postalCode?: string;
    };
    workingHours?: string;
    phoneNumber?: string;
    addInfo?: string;
}

const PickupPointSignUp: React.FC = () => {
    const [step, setStep] = useState(1);
    const emailRef = useRef<HTMLInputElement | null>(null);
    const codeRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (step === 1 && emailRef.current) {
            emailRef.current.focus();
        } else if (step === 2 && codeRef.current) {
            codeRef.current.focus();
        } else if (step === 3 && passwordRef.current) {
            passwordRef.current.focus();
        }
    }, [step]);

    const emptyFormData: PickupPointSignUpData = {
        email: '',
        password: '',
        code: '',
        pickupPointCreateRequest: {
            id: '',
            address: {
                region: '',
                city: '',
                street: '',
                houseNumber: '',
                postalCode: '',
            },
            workingHours: '',
            phoneNumber: '',
            addInfo: '',
        },
    }
    const [formData, setFormData] = useState<PickupPointSignUpData>(emptyFormData);

    const [errors, setErrors] = useState<PickupPointSignUpErrors>({});
    const [codeInputs, setCodeInputs] = useState<string[]>(Array(6).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    // Генерация UUID для пункта выдачи
    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) ? '' : 'Электронная почта должна быть валидной';
    };

    const validatePassword = (password: string) => {
        const passwordRegex = /^(?=.*[A-Za-zА-Яа-яЁё])(?=.*\d)[A-Za-zА-Яа-яЁё\d]{10,}$/;
        return passwordRegex.test(password)
            ? ''
            : 'Пароль должен содержать минимум 10 символов, включая буквы и цифры';
    };

    const validatePhone = (phone: string) => {
        const phoneRegex = /^\+7\d{10}$/;
        return phoneRegex.test(phone) ? '' : 'Телефон должен быть в формате +7XXXXXXXXXX';
    };

    const validatePostalCode = (code: string) => {
        const postalRegex = /^\d{6}$/;
        return postalRegex.test(code) ? '' : 'Почтовый индекс должен содержать 6 цифр';
    };

    const validateRequired = (value: string, fieldName: string) => {
        return value.trim() ? '' : `${fieldName} не должно быть пустым`;
    };

    const validateCode = (code: string) => {
        return code.length === 6 && code.split('').every(char => char !== '')
            ? ''
            : 'Все поля кода должны быть заполнены';
    };

    const validateWorkingHours = (hours: string) => {
        // Простая проверка на наличие содержимого
        return hours.trim().length >= 5 ? '' : 'Укажите режим работы';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                pickupPointCreateRequest: {
                    ...prev.pickupPointCreateRequest,
                    [parent]: {
                        ...prev.pickupPointCreateRequest[parent as keyof PickupPointCreateRequest],
                        [child]: value,
                    },
                },
            }));
        } else if (name === 'email' || name === 'password') {
            setFormData(prev => ({ ...prev, [name]: value }));
        } else {
            setFormData(prev => ({
                ...prev,
                pickupPointCreateRequest: {
                    ...prev.pickupPointCreateRequest,
                    [name]: value,
                },
            }));
        }
    };

    const handleCodeChange = (index: number, value: string) => {
        if (/^[0-9]?$/.test(value)) {
            const newCodeInputs = [...codeInputs];
            newCodeInputs[index] = value;
            setCodeInputs(newCodeInputs);
            setFormData(prev => ({ ...prev, code: newCodeInputs.join('') }));

            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !codeInputs[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d{1,6}$/.test(pastedData)) {
            const newCodeInputs = Array(6).fill('');
            pastedData.split('').forEach((char, i) => {
                newCodeInputs[i] = char;
            });
            setCodeInputs(newCodeInputs);
            setFormData(prev => ({ ...prev, code: newCodeInputs.join('') }));
            inputRefs.current[pastedData.length - 1]?.focus();
        }
        e.preventDefault();
    };

    const validateStep = (currentStep: number): PickupPointSignUpErrors => {
        const stepErrors: PickupPointSignUpErrors = {};

        switch (currentStep) {
            case 1:
                if (!formData.email) stepErrors.email = 'Электронная почта не должна быть пустой';
                else stepErrors.email = validateEmail(formData.email);
                break;

            case 2:
                stepErrors.code = validateCode(formData.code);
                break;

            case 3:
                if (!formData.password) stepErrors.password = 'Пароль не должен быть пустым';
                else stepErrors.password = validatePassword(formData.password);
                break;

            case 4:
                stepErrors.address = {};
                const addr = formData.pickupPointCreateRequest.address;
                stepErrors.address.region = validateRequired(addr.region, 'Регион');
                stepErrors.address.city = validateRequired(addr.city, 'Город');
                stepErrors.address.street = validateRequired(addr.street, 'Улица');
                stepErrors.address.houseNumber = validateRequired(addr.houseNumber, 'Дом');
                if (addr.postalCode) {
                    stepErrors.address.postalCode = validatePostalCode(addr.postalCode);
                } else {
                    stepErrors.address.postalCode = 'Почтовый индекс не должен быть пустым';
                }
                break;

            case 5:
                stepErrors.workingHours = validateWorkingHours(formData.pickupPointCreateRequest.workingHours);
                if (formData.pickupPointCreateRequest.phoneNumber) {
                    stepErrors.phoneNumber = validatePhone(formData.pickupPointCreateRequest.phoneNumber);
                } else {
                    stepErrors.phoneNumber = 'Телефон не должен быть пустым';
                }
                break;
        }

        return stepErrors;
    };

    const hasStepErrors = (stepErrors: PickupPointSignUpErrors): boolean => {
        return Object.values(stepErrors).some(error => {
            if (typeof error === 'string') return error;
            if (typeof error === 'object' && error !== null) {
                return Object.values(error).some(nestedError => nestedError);
            }
            return false;
        });
    };

    const handleNext = async () => {
        const stepErrors = validateStep(step);
        setErrors(stepErrors);

        if (!hasStepErrors(stepErrors)) {
            if (step < 5) {
                if (step == 1) {
                    try {
                        await sendCode(formData.email);
                    } catch (e: any) {
                        stepErrors.email = 'Ошибка при отправке кода';
                        return;
                    }
                }
                setStep(step + 1);
                // Генерируем ID при переходе к последнему шагу
                if (step === 4) {
                    setFormData(prev => ({
                        ...prev,
                        pickupPointCreateRequest: {
                            ...prev.pickupPointCreateRequest,
                            id: generateUUID()
                        }
                    }));
                }
            } else {
                try {
                    await signUpPickupPoint(formData);
                    navigate("/pp/sign_in");
                } catch (e: any) {
                    if (e.response?.status === 401) {
                        stepErrors.email = e.response.data.message;
                        setFormData(emptyFormData);
                        setCodeInputs(Array(6).fill(''));
                        setStep(1);
                    } else if (e.response?.status === 409) {
                        stepErrors.email = e.response.data.message;
                        setFormData(emptyFormData);
                        setCodeInputs(Array(6).fill(''));
                        setStep(1);
                    } else {
                        stepErrors.email = 'Ошибка при создании аккаунта, попробуйте попытку позже!';
                        setFormData(emptyFormData);
                        setCodeInputs(Array(6).fill(''));
                        setStep(1);
                    }
                }
            }
        }
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleClose = () => {
        setFormData({
            email: '',
            password: '',
            code: '',
            pickupPointCreateRequest: {
                id: '',
                address: {
                    region: '',
                    city: '',
                    street: '',
                    houseNumber: '',
                    postalCode: '',
                },
                workingHours: '',
                phoneNumber: '',
                addInfo: '',
            },
        });
        setCodeInputs(Array(6).fill(''));
        setStep(1);
        setErrors({});
    };

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleNext();
        }
    };

    return (
        <div className="signup-pickup-point-form container mx-auto p-4 max-w-md">
            {/* Step 1: Email */}
            {step === 1 && (
                <div className="step pickup-form">
                    <h2 className="text-2xl mb-4 text-secondary-text reg">Регистрация пункта выдачи</h2>
                    <h2 className="text-2xl mb-4 text-secondary-text">Введите электронную почту</h2>
                    <div className="field-group">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Электронная почта *"
                            ref={emailRef}
                            className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                        />
                        {errors.email && <p className="text-error-color">{errors.email}</p>}
                    </div>
                    <button onClick={handleNext} className="mt-4 px-4 py-2 rounded bg-secondary-color text-secondary-text">
                        Далее
                    </button>
                    <a role={"button"} onClick={() => { navigate("/pp/sign_in") }}>Уже есть аккаунт?</a>
                </div>
            )}

            {/* Step 2: Verification Code */}
            {step === 2 && (
                <div className="step pickup-form">
                    <h2 className="text-2xl mb-4 text-secondary-text reg">Регистрация пункта выдачи</h2>
                    <button className="close-button" onClick={handleClose}>
                        <SvgSelector id="cross" className="h-4 w-4" />
                    </button>
                    <h2 className="text-2xl mb-4 text-secondary-text">Введите код подтверждения</h2>
                    <div className="field-group">
                        <div className="code-inputs">
                            {codeInputs.map((value, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    value={value}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    ref={(el) => {
                                        inputRefs.current[index] = el;
                                        if (index === 0) codeRef.current = el;
                                    }}
                                    className="code-input"
                                />
                            ))}
                        </div>
                        {errors.code && <p className="text-error-color">{errors.code}</p>}
                    </div>
                    <div className="flex justify-between mt-4">
                        <button onClick={handleBack} className="pare-button px-4 py-2 rounded bg-gray-300 text-primary-text">
                            Назад
                        </button>
                        <button onClick={handleNext} className="pare-button px-4 py-2 rounded bg-secondary-color text-secondary-text">
                            Далее
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Password */}
            {step === 3 && (
                <div className="step pickup-form">
                    <h2 className="text-2xl mb-4 text-secondary-text reg">Регистрация пункта выдачи</h2>
                    <button className="close-button" onClick={handleClose}>
                        <SvgSelector id="cross" className="h-4 w-4" />
                    </button>
                    <h2 className="text-2xl mb-4 text-secondary-text">Создайте пароль</h2>
                    <div className="field-group">
                        <div className="input-with-button">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Пароль *"
                                ref={passwordRef}
                                className="w-full p-2 bg-transparent outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="eye-btn"
                            >
                                <SvgSelector id={showPassword ? 'eye-off' : 'eye'} className="w-6 h-6" />
                            </button>
                        </div>
                        {errors.password && <p className="text-error-color">{errors.password}</p>}
                        <div className="field-hint">Минимум 10 символов, включая буквы и цифры</div>
                    </div>
                    <div className="flex justify-between mt-4">
                        <button onClick={handleBack} className="pare-button px-4 py-2 rounded bg-gray-300 text-primary-text">
                            Назад
                        </button>
                        <button onClick={handleNext} className="pare-button px-4 py-2 rounded bg-secondary-color text-secondary-text">
                            Далее
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Address Information */}
            {step === 4 && (
                <div className="step pickup-form">
                    <h2 className="text-2xl mb-4 text-secondary-text reg">Регистрация пункта выдачи</h2>
                    <button className="close-button" onClick={handleClose}>
                        <SvgSelector id="cross" className="h-4 w-4" />
                    </button>
                    <h2 className="text-2xl mb-4 text-secondary-text">Адрес пункта выдачи</h2>

                    <div className="field-group">
                        <input
                            type="text"
                            name="address.region"
                            value={formData.pickupPointCreateRequest.address.region}
                            onChange={handleChange}
                            placeholder="Регион *"
                            className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                        />
                        {errors.address?.region && <p className="text-error-color">{errors.address.region}</p>}
                    </div>

                    <div className="field-group">
                        <input
                            type="text"
                            name="address.city"
                            value={formData.pickupPointCreateRequest.address.city}
                            onChange={handleChange}
                            placeholder="Город *"
                            className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                        />
                        {errors.address?.city && <p className="text-error-color">{errors.address.city}</p>}
                    </div>

                    <div className="field-group">
                        <input
                            type="text"
                            name="address.street"
                            value={formData.pickupPointCreateRequest.address.street}
                            onChange={handleChange}
                            placeholder="Улица *"
                            className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                        />
                        {errors.address?.street && <p className="text-error-color">{errors.address.street}</p>}
                    </div>

                    <div className="field-group">
                        <input
                            type="text"
                            name="address.houseNumber"
                            value={formData.pickupPointCreateRequest.address.houseNumber}
                            onChange={handleChange}
                            placeholder="Дом *"
                            className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                        />
                        {errors.address?.houseNumber && <p className="text-error-color">{errors.address.houseNumber}</p>}
                    </div>

                    <div className="field-group">
                        <input
                            type="text"
                            name="address.postalCode"
                            value={formData.pickupPointCreateRequest.address.postalCode}
                            onChange={handleChange}
                            placeholder="Почтовый индекс *"
                            maxLength={6}
                            className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                        />
                        <div className="field-hint">Формат: 123456 (6 цифр)</div>
                        {errors.address?.postalCode && <p className="text-error-color">{errors.address.postalCode}</p>}
                    </div>

                    <div className="flex justify-between mt-4">
                        <button onClick={handleBack} className="pare-button px-4 py-2 rounded bg-gray-300 text-primary-text">
                            Назад
                        </button>
                        <button onClick={handleNext} className="pare-button px-4 py-2 rounded bg-secondary-color text-secondary-text">
                            Далее
                        </button>
                    </div>
                </div>
            )}

            {/* Step 5: Working Hours and Contact Info */}
            {step === 5 && (
                <div className="step pickup-form" onKeyDown={handleOnKeyDown}>
                    <h2 className="text-2xl mb-4 text-secondary-text reg">Регистрация пункта выдачи</h2>
                    <button className="close-button" onClick={handleClose}>
                        <SvgSelector id="cross" className="h-4 w-4" />
                    </button>
                    <h2 className="text-2xl mb-4 text-secondary-text">Контактная информация</h2>

                    <div className="field-group">
                        <input
                            type="text"
                            name="workingHours"
                            value={formData.pickupPointCreateRequest.workingHours}
                            onChange={handleChange}
                            placeholder="Режим работы *"
                            className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                        />
                        <div className="field-hint">Например: Пн-Пт: 9:00-18:00, Сб: 10:00-16:00</div>
                        {errors.workingHours && <p className="text-error-color">{errors.workingHours}</p>}
                    </div>

                    <div className="field-group">
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.pickupPointCreateRequest.phoneNumber}
                            onChange={handleChange}
                            placeholder="Телефон *"
                            className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                        />
                        <div className="field-hint">Формат: +7XXXXXXXXXX</div>
                        {errors.phoneNumber && <p className="text-error-color">{errors.phoneNumber}</p>}
                    </div>

                    <div className="field-group">
                        <textarea
                            name="addInfo"
                            value={formData.pickupPointCreateRequest.addInfo}
                            onChange={handleChange}
                            placeholder="Дополнительная информация"
                            rows={4}
                            className="desc-textarea"
                        />
                        <div className="field-hint">Укажите дополнительную информацию о пункте выдачи (опционально)</div>
                    </div>

                    <div className="flex justify-between mt-4">
                        <button onClick={handleBack} className="pare-button px-4 py-2 rounded bg-gray-300 text-primary-text">
                            Назад
                        </button>
                        <button onClick={handleNext} className="pare-button px-4 py-2 rounded bg-secondary-color text-secondary-text">
                            Зарегистрироваться
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PickupPointSignUp;