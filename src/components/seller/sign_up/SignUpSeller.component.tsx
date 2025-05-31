import React, {useState, useRef, useEffect} from 'react';
import SvgSelector from '../../SvgSelector.component.tsx';
import './SignUpSeller.style.scss';
import {useNavigate} from "react-router-dom";
import {sendCode, signUpSeller} from "../../../api/AuthApi.ts";

interface PersonDetail {
    surname: string;
    name: string;
    patronimyc: string;
    phoneNumber: string;
}

interface PaymentDetail {
    bankAccountNumber: string;
    bankName: string;
    bic: string;
    accountHolderName: string;
    inn: string;
}

interface SellerCreateRequest {
    person: PersonDetail;
    fullCompanyName: string;
    shortCompanyName: string;
    description: string;
    paymentDetail: PaymentDetail;
}

interface SellerSignUpData {
    email: string;
    password: string;
    code: string;
    sellerCreateRequest: SellerCreateRequest;
}

interface SellerSignUpErrors {
    email?: string;
    password?: string;
    code?: string;
    person?: {
        surname?: string;
        name?: string;
        patronimyc?: string;
        phoneNumber?: string;
    };
    fullCompanyName?: string;
    shortCompanyName?: string;
    description?: string;
    paymentDetail?: {
        bankAccountNumber?: string;
        bankName?: string;
        bic?: string;
        accountHolderName?: string;
        inn?: string;
    };
}

const SellerSignUpForm: React.FC = () => {
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

    const emptyFormData = {
        email: '',
        password: '',
        code: '',
        sellerCreateRequest: {
            person: {
                surname: '',
                name: '',
                patronimyc: '',
                phoneNumber: '',
            },
            fullCompanyName: '',
            shortCompanyName: '',
            description: '',
            paymentDetail: {
                bankAccountNumber: '',
                bankName: '',
                bic: '',
                accountHolderName: '',
                inn: '',
            },
        },
    }
    const [formData, setFormData] = useState<SellerSignUpData>(emptyFormData);

    const [errors, setErrors] = useState<SellerSignUpErrors>({});
    const [codeInputs, setCodeInputs] = useState<string[]>(Array(6).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [showPassword, setShowPassword] = useState(false);

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

    const validateINN = (inn: string) => {
        return inn.length === 10 && /^\d+$/.test(inn) ? '' : 'ИНН должен содержать 10 цифр';
    };

    const validateBIC = (bic: string) => {
        return bic.length === 9 && /^\d+$/.test(bic) ? '' : 'БИК должен содержать 9 цифр';
    };

    const validateBankAccount = (account: string) => {
        return account.length === 20 && /^\d+$/.test(account) ? '' : 'Номер счета должен содержать 20 цифр';
    };

    const validateRequired = (value: string, fieldName: string) => {
        return value.trim() ? '' : `${fieldName} не должно быть пустым`;
    };

    const validateCode = (code: string) => {
        return code.length === 6 && code.split('').every(char => char !== '')
            ? ''
            : 'Все поля кода должны быть заполнены';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                sellerCreateRequest: {
                    ...prev.sellerCreateRequest,
                    [parent]: {
                        ...prev.sellerCreateRequest[parent as keyof SellerCreateRequest],
                        [child]: value,
                    },
                },
            }));
        } else if (name === 'email' || name === 'password') {
            setFormData(prev => ({...prev, [name]: value}));
        } else {
            setFormData(prev => ({
                ...prev,
                sellerCreateRequest: {
                    ...prev.sellerCreateRequest,
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
            setFormData(prev => ({...prev, code: newCodeInputs.join('')}));

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
            setFormData(prev => ({...prev, code: newCodeInputs.join('')}));
            inputRefs.current[pastedData.length - 1]?.focus();
        }
        e.preventDefault();
    };

    const validateStep = (currentStep: number): SellerSignUpErrors => {
        const stepErrors: SellerSignUpErrors = {};

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
                stepErrors.person = {};
                stepErrors.person.surname = validateRequired(formData.sellerCreateRequest.person.surname, 'Фамилия');
                stepErrors.person.name = validateRequired(formData.sellerCreateRequest.person.name, 'Имя');
                if (formData.sellerCreateRequest.person.phoneNumber) {
                    stepErrors.person.phoneNumber = validatePhone(formData.sellerCreateRequest.person.phoneNumber);
                } else {
                    stepErrors.person.phoneNumber = 'Телефон не должен быть пустым';
                }
                break;

            case 5:
                stepErrors.fullCompanyName = validateRequired(formData.sellerCreateRequest.fullCompanyName, 'Полное название компании');
                stepErrors.shortCompanyName = validateRequired(formData.sellerCreateRequest.shortCompanyName, 'Краткое название компании');
                break;

            case 6: {
                stepErrors.paymentDetail = {};
                const pd = formData.sellerCreateRequest.paymentDetail;
                stepErrors.paymentDetail.bankName = validateRequired(pd.bankName, 'Название банка');
                stepErrors.paymentDetail.bankAccountNumber = validateBankAccount(pd.bankAccountNumber);
                stepErrors.paymentDetail.bic = validateBIC(pd.bic);
                stepErrors.paymentDetail.accountHolderName = validateRequired(pd.accountHolderName, 'Владелец счета');
                stepErrors.paymentDetail.inn = validateINN(pd.inn);
                break;
            }
        }

        return stepErrors;
    };

    const hasStepErrors = (stepErrors: SellerSignUpErrors): boolean => {
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
            if (step < 6) {
                if (step == 1) {
                    try {
                        await sendCode(formData.email);
                    } catch (e: any) {
                        stepErrors.email = 'Ошибка при отправке кода';
                        return;
                    }
                }
                setStep(step + 1);
            } else {
                try {
                    await signUpSeller(formData);
                    navigate("/seller/sign_in");
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
            sellerCreateRequest: {
                person: {
                    surname: '',
                    name: '',
                    patronimyc: '',
                    phoneNumber: '',
                },
                fullCompanyName: '',
                shortCompanyName: '',
                description: '',
                paymentDetail: {
                    bankAccountNumber: '',
                    bankName: '',
                    bic: '',
                    accountHolderName: '',
                    inn: '',
                },
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
        <div className="signup-form container mx-auto p-4 max-w-md">
            {/* Step 1: Email */}
            {step === 1 && (
                <div className="step seller-form">
                    <h2 className="text-2xl mb-4 text-secondary-text reg">Регистрация продавца</h2>
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
                    <button onClick={handleNext}
                            className="mt-4 px-4 py-2 rounded bg-secondary-color text-secondary-text">
                        Далее
                    </button>
                    <a role={"button"} onClick={() => {
                        navigate("/seller/sign_in")
                    }}>Уже есть аккаунт?</a>
                </div>
            )}

            {/* Step 2: Verification Code */}
            {step === 2 && (
                <div className="step seller-form">
                    <h2 className="text-2xl mb-4 text-secondary-text reg">Регистрация продавца</h2>
                    <button className="close-button" onClick={handleClose}>
                        <SvgSelector id="cross" className="h-4 w-4"/>
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
                        <button onClick={handleBack}
                                className="pare-button px-4 py-2 rounded bg-gray-300 text-primary-text">
                            Назад
                        </button>
                        <button onClick={handleNext}
                                className="pare-button px-4 py-2 rounded bg-secondary-color text-secondary-text">
                            Далее
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Password */}
            {step === 3 && (
                <div className="step seller-form">
                    <h2 className="text-2xl mb-4 text-secondary-text reg">Регистрация продавца</h2>
                    <button className="close-button" onClick={handleClose}>
                        <SvgSelector id="cross" className="h-4 w-4"/>
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
                                <SvgSelector id={showPassword ? 'eye-off' : 'eye'} className="w-6 h-6"/>
                            </button>
                        </div>
                        {errors.password && <p className="text-error-color">{errors.password}</p>}
                        <div className="field-hint">Минимум 8 символов, включая буквы и цифры</div>
                    </div>
                    <div className="flex justify-between mt-4">
                        <button onClick={handleBack}
                                className="pare-button px-4 py-2 rounded bg-gray-300 text-primary-text">
                            Назад
                        </button>
                        <button onClick={handleNext}
                                className="pare-button px-4 py-2 rounded bg-secondary-color text-secondary-text">
                            Далее
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Personal Information */}
            {step === 4 && (
                <div className="step seller-form">
                    <h2 className="text-2xl mb-4 text-secondary-text reg">Регистрация продавца</h2>
                    <button className="close-button" onClick={handleClose}>
                        <SvgSelector id="cross" className="h-4 w-4"/>
                    </button>
                    <h2 className="text-2xl mb-4 text-secondary-text">Личная информация</h2>

                    <div className="field-group">
                        <input
                            type="text"
                            name="person.surname"
                            value={formData.sellerCreateRequest.person.surname}
                            onChange={handleChange}
                            placeholder="Фамилия *"
                            className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                        />
                        {errors.person?.surname && <p className="text-error-color">{errors.person.surname}</p>}
                    </div>

                    <div className="field-group">
                        <input
                            type="text"
                            name="person.name"
                            value={formData.sellerCreateRequest.person.name}
                            onChange={handleChange}
                            placeholder="Имя *"
                            className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                        />
                        {errors.person?.name && <p className="text-error-color">{errors.person.name}</p>}
                    </div>

                    <div className="field-group">
                        <input
                            type="text"
                            name="person.patronimyc"
                            value={formData.sellerCreateRequest.person.patronimyc}
                            onChange={handleChange}
                            placeholder="Отчество"
                            className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                        />
                    </div>

                    <div className="field-group">
                        <input
                            type="tel"
                            name="person.phoneNumber"
                            value={formData.sellerCreateRequest.person.phoneNumber}
                            onChange={handleChange}
                            placeholder="Телефон *"
                            className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                        />
                        <div className="field-hint">Формат: +7XXXXXXXXXX</div>
                        {errors.person?.phoneNumber && <p className="text-error-color">{errors.person.phoneNumber}</p>}
                    </div>

                    <div className="flex justify-between mt-4">
                        <button onClick={handleBack}
                                className="pare-button px-4 py-2 rounded bg-gray-300 text-primary-text">
                            Назад
                        </button>
                        <button onClick={handleNext}
                                className="pare-button px-4 py-2 rounded bg-secondary-color text-secondary-text">
                            Далее
                        </button>
                    </div>
                </div>
            )}

            {/* Step 5: Company Information */}
            {step === 5 && (
                <div className="step seller-form">
                    <h2 className="text-2xl mb-4 text-secondary-text reg">Регистрация продавца</h2>
                    <button className="close-button" onClick={handleClose}>
                        <SvgSelector id="cross" className="h-4 w-4"/>
                    </button>
                    <h2 className="text-2xl mb-4 text-secondary-text">Информация о компании</h2>

                    <div className="field-group">
                        <input
                            type="text"
                            name="fullCompanyName"
                            value={formData.sellerCreateRequest.fullCompanyName}
                            onChange={handleChange}
                            placeholder="Полное название компании *"
                            className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                        />
                        {errors.fullCompanyName && <p className="text-error-color">{errors.fullCompanyName}</p>}
                    </div>

                    <div className="field-group">
                        <input
                            type="text"
                            name="shortCompanyName"
                            value={formData.sellerCreateRequest.shortCompanyName}
                            onChange={handleChange}
                            placeholder="Краткое название компании *"
                            className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                        />
                        {errors.shortCompanyName && <p className="text-error-color">{errors.shortCompanyName}</p>}
                    </div>

                    <div className="field-group">
                        <textarea
                            name="description"
                            value={formData.sellerCreateRequest.description}
                            onChange={handleChange}
                            placeholder="Описание"
                            rows={4}
                            className="desc-textarea"
                        />
                        <div className="field-hint">Опишите основное направление деятельности вашей компании</div>
                        {errors.description && <p className="text-error-color">{errors.description}</p>}
                    </div>

                    <div className="flex justify-between mt-4">
                        <button onClick={handleBack}
                                className="pare-button px-4 py-2 rounded bg-gray-300 text-primary-text">
                            Назад
                        </button>
                        <button onClick={handleNext}
                                className="pare-button px-4 py-2 rounded bg-secondary-color text-secondary-text">
                            Далее
                        </button>
                    </div>
                </div>
            )}

            {/* Step 6: Payment Details */}
            {step === 6 && (
                <div className="step" onKeyDown={handleOnKeyDown}>
                    <h2 className="text-2xl mb-4 text-secondary-text reg">Регистрация продавца</h2>
                    <button className="close-button" onClick={handleClose}>
                        <SvgSelector id="cross" className="h-4 w-4"/>
                    </button>
                    <h2 className="text-2xl mb-4 text-secondary-text">Платежные реквизиты</h2>

                    <input
                        type="text"
                        name="paymentDetail.bankName"
                        value={formData.sellerCreateRequest.paymentDetail.bankName}
                        onChange={handleChange}
                        placeholder="Название банка *"
                        className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                    />
                    {errors.paymentDetail?.bankName &&
                        <p className="text-error-color text-sm mb-2">{errors.paymentDetail.bankName}</p>}

                    <input
                        type="text"
                        name="paymentDetail.bankAccountNumber"
                        value={formData.sellerCreateRequest.paymentDetail.bankAccountNumber}
                        onChange={handleChange}
                        placeholder="Номер счета (20 цифр) *"
                        maxLength={20}
                        className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                    />
                    {errors.paymentDetail?.bankAccountNumber &&
                        <p className="text-error-color text-sm mb-2">{errors.paymentDetail.bankAccountNumber}</p>}

                    <input
                        type="text"
                        name="paymentDetail.bic"
                        value={formData.sellerCreateRequest.paymentDetail.bic}
                        onChange={handleChange}
                        placeholder="БИК (9 цифр) *"
                        maxLength={9}
                        className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                    />
                    {errors.paymentDetail?.bic &&
                        <p className="text-error-color text-sm mb-2">{errors.paymentDetail.bic}</p>}

                    <input
                        type="text"
                        name="paymentDetail.accountHolderName"
                        value={formData.sellerCreateRequest.paymentDetail.accountHolderName}
                        onChange={handleChange}
                        placeholder="Владелец счета *"
                        className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                    />
                    {errors.paymentDetail?.accountHolderName &&
                        <p className="text-error-color text-sm mb-2">{errors.paymentDetail.accountHolderName}</p>}

                    <input
                        type="text"
                        name="paymentDetail.inn"
                        value={formData.sellerCreateRequest.paymentDetail.inn}
                        onChange={handleChange}
                        placeholder="ИНН (10 цифр) *"
                        maxLength={10}
                        className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                    />
                    {errors.paymentDetail?.inn &&
                        <p className="text-error-color text-sm mb-2">{errors.paymentDetail.inn}</p>}

                    <div className="flex justify-between mt-4">
                        <button onClick={handleBack}
                                className="pare-button px-4 py-2 rounded bg-gray-300 text-primary-text">
                            Назад
                        </button>
                        <button onClick={handleNext}
                                className="pare-button px-4 py-2 rounded bg-secondary-color text-secondary-text">
                            Зарегистрироваться
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerSignUpForm;