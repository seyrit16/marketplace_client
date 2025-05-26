import React, {useState} from "react";
import './HeaderSeller.style.scss';
import type {JSX} from "react/jsx-dev-runtime";
import {useLocation} from "react-router-dom";
import SignInForm from "../../user/sign_in/SignIn.component.tsx";
import SignUpForm from "../../user/sign_up/SignUpForm.component.tsx";


const HeaderSeller: React.FC = () => {

    const [showSign, setShowSign] = useState(false);
    const [signForm, setSignForm] = useState<JSX.Element | null>(null);

    const location = useLocation();

    const isActive = (path) => location.pathname === path;


    const onCloseSignForm = () => {
        setShowSign(false);
        setSignForm(null);
    }

    const onOpenSignIn = () => {
        setSignForm(<SignInForm onClose={onCloseSignForm} openSignUp={onOpenSignUp}/>);
    }

    const onOpenSignUp = () => {
        setSignForm(<SignUpForm onClose={onCloseSignForm} openSignIn={onOpenSignIn}/>);
    }

    return (
        <div>
            {showSign && (signForm)}
            <header className="header-seller">
                <div className="container grid grid-cols-5 gap-4 items-center py-4 mx-auto">
                    {/* Логотип */}
                    <div className="logo">
                        <a href={"/seller/products"}  className="text-2xl font-bold">MARKET </a>
                        <a href={"/seller/products"}  className="miniLogo text-2xl font-bold">seller</a>
                    </div>

                    <div className="nav-links">
                        <a href="/seller/profile" className={`nav-link ${isActive('/seller/profile') ? 'active' : ''}`}>Профиль</a>
                        <a href="/seller/products" className={`nav-link ${isActive('/seller/products') ? 'active' : ''}`}>Мои товары</a>
                        <a href="/seller/products/create" className={`nav-link ${isActive('/seller/products/create') ? 'active' : ''}`}>Добавить товар</a>
                    </div>
                </div>
            </header>
        </div>
    );
}

export default HeaderSeller;