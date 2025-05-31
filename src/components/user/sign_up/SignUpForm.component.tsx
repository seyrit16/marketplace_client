import React, {useState, useRef, useEffect} from 'react';
import SvgSelector from '../../SvgSelector.component.tsx';
import './SignUpForm.style.scss';
import type {SignUpData} from "../../../models/User.model.ts";
import {sendCode, signUpUser} from "../../../api/AuthApi.ts";

interface SignUpFormProps {
    onClose: () => void;
    openSignIn: () => void;
}

interface SignUpErrors {
    email?: string;
    verifyCode?: string;
    password?: string;
    userProfile?: {
        surname?: string;
        name?: string;
        patronymic?: string;
    };
}

const SignUpForm: React.FC<SignUpFormProps> = ({onClose, openSignIn}) => {
    const [step, setStep] = useState(1);
    const emailRef = useRef<HTMLInputElement | null>(null);
    const codeRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (step === 1 && emailRef.current) {
            emailRef.current.focus();
        } else if (step === 2 && codeRef.current) {
            codeRef.current.focus();
        } else if (step === 3 && passwordRef.current) {
            passwordRef.current.focus();
        }
    }, [step]);

    const [errors, setErrors] = useState<SignUpErrors>({});
    const [codeInputs, setCodeInputs] = useState<string[]>(Array(6).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    const emptyFormData: SignUpData = {
        email: '',
        code: '',
        password: '',
        userProfile: {
            surname: '',
            name: '',
            patronymic: '',
        },
    };
    const [formData, setFormData] = useState<SignUpData>({
        email: '',
        code: '',
        password: '',
        userProfile: {
            surname: '',
            name: '',
            patronymic: '',
        },
    });

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) ? '' : 'Электронная почта должна быть валидной';
    };


    const validatePassword = (password: string) => {
        const passwordRegex = /^(?=.*[A-Za-zА-Яа-яЁё])(?=.*\d)[A-Za-zА-Яа-яЁё\d]{8,}$/;
        return passwordRegex.test(password)
            ? ''
            : 'Пароль должен содержать минимум 8 символов, включая буквы (латиница или кириллица) и цифры';
    };

    const validateName = (name: string) => {
        return name.trim() ? '' : 'Имя не должно быть пустым';
    };

    const validateSurname = (surname: string) => {
        return surname.trim() ? '' : 'Фамилия не должна быть пустой';
    };

    const validateCode = (code: string) => {
        console.log(code);
        return code.length === 6 && code.split('').every(char => char !== '')
            ? ''
            : 'Все поля кода должны быть заполнены';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        if (name in formData.userProfile) {
            setFormData({
                ...formData,
                userProfile: {...formData.userProfile, [name]: value},
            });
        } else {
            setFormData({...formData, [name]: value});
        }
    };

    const handleCodeChange = (index: number, value: string) => {
        if (/^[0-9]?$/.test(value)) {
            const newCodeInputs = [...codeInputs];
            newCodeInputs[index] = value;
            setCodeInputs(newCodeInputs);
            setFormData({...formData, code: newCodeInputs.join('')});

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
            setFormData({...formData, code: newCodeInputs.join('')});
            inputRefs.current[pastedData.length - 1]?.focus();
        }
        e.preventDefault();
    };

    const handleNext = async () => {
        const stepErrors: SignUpErrors = {};

        if (step === 1) {
            if (!formData.email) stepErrors.email = 'Электронная почта не должна быть пустой';
            else stepErrors.email = validateEmail(formData.email);
            if (!stepErrors.email) {
                try{
                    await sendCode(formData.email);
                }catch(e:any){
                    stepErrors.email = 'Ошибка при отправке кода';
                    return;
                }
                finally {
                    setStep(2);
                }

            }
        } else if (step === 2) {
            formData.verifyCode = codeInputs.join('');
            stepErrors.verifyCode = validateCode(formData.verifyCode);
            if (!stepErrors.verifyCode) {
                setStep(3);
            }
        } else if (step === 3) {
            if (!formData.password) stepErrors.password = 'Пароль не должен быть пустым';
            else stepErrors.password = validatePassword(formData.password);
            if (!formData.userProfile.name) stepErrors.userProfile = {
                ...stepErrors.userProfile,
                name: validateName(formData.userProfile.name)
            };
            else stepErrors.userProfile = {...stepErrors.userProfile, name: validateName(formData.userProfile.name)};
            if (!formData.userProfile.surname) stepErrors.userProfile = {
                ...stepErrors.userProfile,
                surname: validateSurname(formData.userProfile.surname)
            };
            else stepErrors.userProfile = {
                ...stepErrors.userProfile,
                surname: validateSurname(formData.userProfile.surname)
            };
            if (!stepErrors.password && !stepErrors.userProfile?.name && !stepErrors.userProfile?.surname) {
                try{
                    await signUpUser(formData);
                    openSignIn();
                }catch(e:any){
                    if(e.response?.status === 401) {
                        stepErrors.email = e.response.data.message;
                        setFormData(emptyFormData);
                        setCodeInputs(Array(6).fill(''));
                        setStep(1);
                    }
                    else if(e.response?.status === 409) {
                        stepErrors.email = e.response.data.message;
                        setFormData(emptyFormData);
                        setCodeInputs(Array(6).fill(''));
                        setStep(1);
                    }
                    else {
                        stepErrors.email = 'Ошибка при создании аккаунта, попробуйте попытку позже!';
                        setFormData(emptyFormData);
                        setCodeInputs(Array(6).fill(''));
                        setStep(1);
                    }
                }
            }
        }

        setErrors(stepErrors);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleClose = () => {
        setFormData({
            email: '',
            code: '',
            password: '',
            userProfile: {
                surname: '',
                name: '',
                patronymic: '',
            },
        });
        setCodeInputs(Array(6).fill(''));
        setStep(1);
        setErrors({});
        onClose();
    };

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleNext();
        }
    }

    return (
        <div className="signup-form container mx-auto p-4 max-w-md">
            {step === 1 && (
                <div className="step" onKeyDown={handleOnKeyDown}>
                    <h2 className="text-2xl mb-4 text-secondary-text reg">Регистрация</h2>
                    <button className="close-button" onClick={handleClose}>
                        <SvgSelector id="cross" className="h-4 w-4"/>
                    </button>
                    <h2 className="text-2xl mb-4 text-secondary-text">Введите электронную почту</h2>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Электронная почта"
                        ref={emailRef}
                        className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                    />
                    <p className={`text-sm h-5 ${errors.email ? 'text-error-color' : 'text-invisible-color'}`}>
                        {errors.email || 'Э'}
                    </p>
                    <button onClick={handleNext}
                            className="mt-4 px-4 py-2 rounded bg-secondary-color text-secondary-text">
                        Отправить код
                    </button>
                    <a onClick={openSignIn}>Уже есть аккаунт?</a>
                </div>
            )}

            {step === 2 && (
                <div className="step" onKeyDown={handleOnKeyDown}>
                    <h2 className="text-2xl mb-4 text-secondary-text reg">Регистрация</h2>
                    <button className="close-button" onClick={handleClose}>
                        <SvgSelector id="cross" className="h-4 w-4"/>
                    </button>
                    <h2 className="text-2xl mb-4 text-secondary-text">Введите код подтверждения</h2>
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
                    <p className={`text-sm h-5 ${errors.verifyCode ? 'text-error-color' : 'text-invisible-color'}`}>
                        {errors.verifyCode || 'В'}
                    </p>
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

            {step === 3 && (
                <div className="step" onKeyDown={handleOnKeyDown}>
                    <h2 className="text-2xl mb-4 text-secondary-text reg">Регистрация</h2>
                    <button className="close-button" onClick={handleClose}>
                        <SvgSelector id="cross" className="h-4 w-4"/>
                    </button>
                    <h2 className="text-2xl mb-4 text-secondary-text">Завершение</h2>
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
                    {errors.password && <p className="text-error-color text-sm">{errors.password}</p>}
                    <input
                        type="text"
                        name="name"
                        value={formData.userProfile.name}
                        onChange={handleChange}
                        placeholder="Имя *"
                        className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                    />
                    {errors.userProfile?.name && <p className="text-error-color">{errors.userProfile?.name}</p>}
                    <input
                        type="text"
                        name="surname"
                        value={formData.userProfile.surname}
                        onChange={handleChange}
                        placeholder="Фамилия *"
                        className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                    />
                    {errors.userProfile?.surname && <p className="text-error-color">{errors.userProfile?.surname}</p>}
                    <input
                        type="text"
                        name="patronymic"
                        value={formData.userProfile.patronymic}
                        onChange={handleChange}
                        placeholder="Отчество"
                        className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                    />
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

export default SignUpForm;