import React, {useEffect, useRef, useState} from "react";
import "./SignInSeller.style.scss"
import SvgSelector from "../../SvgSelector.component.tsx";
import {useNavigate} from "react-router-dom";
import {sendCode, signInWithCode, signInWithPassword} from "../../../api/AuthApi.ts";


interface SignUpErrors {
    email?: string;
    code?: string;
    password?: string;
    response?: string;
}

const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email) ? "" : "Электронная почта должна быть валидной";
};

const validateCode = (code: string) => {
    return code.length === 6 ? "" : "Все поля кода должны быть заполнены";
};

const validatePassword = (password: string) => {
    return password.length >= 10 ? "" : "Пароль должен содержать минимум 10 символов, включая буквы (латиница или" +
        " кириллица) и цифры";
};

const SignInSeller: React.FC = () => {

    const [authMode, setAuthMode] = useState<'code' | 'password'>('code');
    const [step, setStep] = useState(1);
    const emailRef = useRef<HTMLInputElement | null>(null);
    const codeRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (authMode === "code") {
            if (step === 1) emailRef.current?.focus();
            else if (step === 2) codeRef.current?.focus();
        } else {
            emailRef.current?.focus();
        }
    }, [step, authMode]);

    const emptyFormData = {
        email: "",
        code: "",
        password: "",
    };
    const [formData, setFormData] = useState(emptyFormData);

    const [errors, setErrors] = useState<SignUpErrors>({});
    const [codeInputs, setCodeInputs] = useState<string[]>(Array(6).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleModeSwitch = (mode: "code" | "password") => {
        setAuthMode(mode);
        setStep(1);
        setFormData({email: "", code: "", password: ""});
        setErrors({});
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

        if (authMode === "code") {
            if (step === 1) {
                if (!formData.email) {
                    stepErrors.email = "Электронная почта не должна быть пустой";
                } else {
                    const emailError = validateEmail(formData.email);
                    if (emailError) stepErrors.email = emailError;
                }

                if (!stepErrors.email) {
                    try {
                        await sendCode(formData.email);
                    } catch (e: any) {
                        stepErrors.response = 'Ошибка при отправке кода';
                        return;
                    }

                    setStep(2);
                }

            } else if (step === 2) {
                const codeError = validateCode(formData.code);
                if (codeError) {
                    stepErrors.code = codeError;
                }

                if (!stepErrors.code) {
                    try {
                        await signInWithCode('s', formData);
                        navigate("/seller/products");
                    } catch (e: any) {
                        if (e.response?.status === 401 || e.response?.status === 404) {
                            stepErrors.response = e.response.data.message;
                            setFormData(emptyFormData);
                            setCodeInputs(Array(6).fill(''));
                            setStep(1);
                        } else {
                            stepErrors.email = 'Ошибка при входе в аккаунт, попробуйте попытку позже!';
                            setFormData(emptyFormData);
                            setCodeInputs(Array(6).fill(''));
                            setStep(1);
                        }
                    }
                    navigate("/seller/products");
                }
            }

        } else if (authMode === "password") {
            if (!formData.email) {
                stepErrors.email = "Электронная почта не должна быть пустой";
            } else {
                const emailError = validateEmail(formData.email);
                if (emailError) stepErrors.email = emailError;
            }

            if (!formData.password) {
                stepErrors.password = "Пароль не должен быть пустым";
            } else {
                const passwordError = validatePassword(formData.password);
                if (passwordError) stepErrors.password = passwordError;
            }

            if (!stepErrors.email && !stepErrors.password) {
                try{
                    await signInWithPassword('s', formData);
                    navigate("/seller/products");
                }catch(e:any){
                    if (e.response?.status === 401 || e.response?.status === 404) {
                        stepErrors.response = e.response.data.message;
                        setFormData(emptyFormData);
                        setCodeInputs(Array(6).fill(''));
                        setStep(1);
                    }else {
                        stepErrors.email = 'Ошибка при входе в аккаунт, попробуйте попытку позже!';
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
            password: ''
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
    }

    return (
        <div className="signIn-seller container mx-auto p-4 max-w-md">
            {authMode === "code" && step === 1 && (
                <div className="step" onKeyDown={handleOnKeyDown}>
                    <h2 className="text-2xl mb-4 text-secondary-text h-signIn">Вход</h2>
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
                        {errors.email}
                    </p>
                    <p className={`text-sm h-5 ${errors.response ? 'text-error-color' : 'text-invisible-color'}`}>
                        {errors.response}
                    </p>
                    <div className="flex justify-between mt-4">
                        <button
                            className={"pare-button px-4 py-2 rounded bg-gray-300 text-primary-text"}
                            onClick={() => handleModeSwitch("password")}
                        >
                            Вход по паролю
                        </button>
                        <button
                            onClick={handleNext}
                            className="pare-button px-4 py-2 rounded bg-gray-300 text-primary-text"
                        >
                            Далее
                        </button>
                    </div>
                    <a role={"button"} onClick={() => {
                        navigate("/seller/sign_up")
                    }}>
                        Нет аккаунта?
                    </a>
                </div>
            )}

            {authMode === "code" && step === 2 && (
                <div className="step" onKeyDown={handleOnKeyDown}>
                    <h2 className="text-2xl mb-4 text-secondary-text h-signIn">Вход</h2>
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
                    <p className={`text-sm h-5 ${errors.code ? 'text-error-color' : 'text-invisible-color'}`}>
                        {errors.code || 'В'}
                    </p>
                    <div className="flex justify-between mt-4">
                        <button
                            onClick={handleBack}
                            className="pare-button px-4 py-2 rounded bg-gray-300 text-primary-text"
                        >
                            Назад
                        </button>
                        <button
                            onClick={handleNext}
                            className="pare-button px-4 py-2 rounded bg-secondary-color text-secondary-text"
                        >
                            Войти
                        </button>
                    </div>
                </div>
            )}

            {authMode === "password" && (
                <div className="step" onKeyDown={handleOnKeyDown}>
                    <h2 className="text-2xl mb-4 text-secondary-text h-signIn">Вход</h2>
                    <button className="close-button" onClick={handleClose}>
                        <SvgSelector id="cross" className="h-4 w-4"/>
                    </button>
                    <h2 className="text-2xl mb-4 text-secondary-text">Вход с паролем</h2>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Электронная почта"
                        ref={emailRef}
                        className="w-full p-2 mb-2 border rounded bg-primary-color text-primary-text"
                    />
                    {errors.email && <p className="text-error-color text-sm">{errors.email}</p>}
                    {errors.response && <p className="text-error-color text-sm">{errors.response}</p>}

                    <div className="input-with-button">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Пароль"
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
                    <div className="flex justify-between mt-4">
                        <button
                            className={"pare-button px-4 py-2 rounded bg-gray-300 text-primary-text"}
                            onClick={() => handleModeSwitch("code")}
                        >
                            Вход по коду
                        </button>
                        <button
                            onClick={handleNext}
                            className="pare-button px-4 py-2 rounded bg-gray-300 text-primary-text"
                        >
                            Войти
                        </button>
                    </div>
                    <a role={"button"} onClick={() => {
                        navigate("/seller/sign_up")
                    }}>
                        Нет аккаунта?
                    </a>
                </div>
            )}
        </div>
    );
};

export default SignInSeller;