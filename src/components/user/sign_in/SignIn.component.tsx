import SvgSelector from "../../SvgSelector.component.tsx";
import React, {useEffect, useRef, useState} from "react";
import './SignIn.style.scss'


interface SignInFormProps {
    onClose: () => void;
    openSignUp: () => void;
}

interface SignUpErrors {
    email?: string;
    verifyCode?: string;
    password?: string;
}

const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email) ? "" : "Электронная почта должна быть валидной";
};

const validateCode = (code: string) => {
    return code.length === 6 ? "" : "Все поля кода должны быть заполнены";
};

const validatePassword = (password: string) => {
    return password.length >= 8 ? "" : "Пароль должен содержать минимум 8 символов, включая буквы (латиница или кириллица) и цифры";
};

const SignInForm: React.FC<SignInFormProps> = ({onClose, openSignUp}) => {

    const [authMode, setAuthMode] = useState<'code' | 'password'>('code');
    const [step, setStep] = useState(1);
    const emailRef = useRef<HTMLInputElement | null>(null);
    const codeRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (authMode === "code") {
            if (step === 1) emailRef.current?.focus();
            else if (step === 2) codeRef.current?.focus();
        } else {
            emailRef.current?.focus();
        }
    }, [step, authMode]);


    const [formData, setFormData] = useState({
        email: "",
        verifyCode: "",
        password: "",
    });

    const [errors, setErrors] = useState<SignUpErrors>({});
    const [codeInputs, setCodeInputs] = useState<string[]>(Array(6).fill('')); // Для 6 полей кода
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    // Handle input changes for regular fields
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleModeSwitch = (mode: "code" | "password") => {
        setAuthMode(mode);
        setStep(1);
        setFormData({email: "", verifyCode: "", password: ""});
        setErrors({});
    };

    // Handle code input changes
    const handleCodeChange = (index: number, value: string) => {
        if (/^[0-9]?$/.test(value)) { // Только цифры, максимум 1 символ
            const newCodeInputs = [...codeInputs];
            newCodeInputs[index] = value;
            setCodeInputs(newCodeInputs);
            setFormData({...formData, verifyCode: newCodeInputs.join('')});

            // Автофокус на следующее поле
            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    // Handle key down for backspace and navigation
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !codeInputs[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d{1,6}$/.test(pastedData)) {
            const newCodeInputs = Array(6).fill('');
            pastedData.split('').forEach((char, i) => {
                newCodeInputs[i] = char;
            });
            setCodeInputs(newCodeInputs);
            setFormData({...formData, verifyCode: newCodeInputs.join('')});
            inputRefs.current[pastedData.length - 1]?.focus();
        }
        e.preventDefault();
    };

    // Handle step submission
    const handleNext = () => {
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
                    setStep(2);
                }

            } else if (step === 2) {
                const codeError = validateCode(formData.verifyCode);
                if (codeError) {
                    stepErrors.verifyCode = codeError;
                }

                if (!stepErrors.verifyCode) {
                    // Здесь можно делать реальный вход по коду
                    alert("Успешный вход по коду");
                    onClose();
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
                // Здесь можно делать реальный вход по паролю
                alert("Успешный вход по паролю");
                onClose();
            }
        }

        setErrors(stepErrors);
    };

    // Handle back navigation
    const handleBack = () => {
        setStep(step - 1);
    };

    // Handle close button
    const handleClose = () => {
        setFormData({
            email: '',
            verifyCode: '',
            password: ''
        });
        setCodeInputs(Array(6).fill(''));
        setStep(1);
        setErrors({});
        onClose();
    };

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // чтобы избежать случайного сабмита формы
            handleNext();
        }
    }

    return (
        <div className="signIn-form container mx-auto p-4 max-w-md">
            {authMode === "code" && step === 1 && (
                <div className="step" onKeyDown={handleOnKeyDown}>
                    <h2 className="text-2xl mb-4 text-secondary-text h-signIn">Вход</h2>
                    <button className="close-button" onClick={handleClose}>
                        <SvgSelector id="cross" className="h-4 w-4" />
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
                    <a onClick={openSignUp}>Нет аккаунта?</a>
                </div>
            )}

            {authMode === "code" && step === 2 && (
                <div className="step" onKeyDown={handleOnKeyDown}>
                    <h2 className="text-2xl mb-4 text-secondary-text h-signIn">Вход</h2>
                    <button className="close-button" onClick={handleClose}>
                        <SvgSelector id="cross" className="h-4 w-4" />
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
                        <SvgSelector id="cross" className="h-4 w-4" />
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
                            <SvgSelector id={showPassword ? 'eye-off' : 'eye'} className="w-6 h-6" />
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
                    <a onClick={openSignUp}>Нет аккаунта?</a>
                </div>
            )}
        </div>
    );
};

export default SignInForm;