import React, {useState} from "react";
import './HeaderPickupPoint.style.scss';
import type {JSX} from "react/jsx-dev-runtime";
import {useLocation} from "react-router-dom";
import SignInForm from "../../user/sign_in/SignIn.component.tsx";
import SignUpForm from "../../user/sign_up/SignUpForm.component.tsx";


const HeaderPickupPoint: React.FC = () => {

    const [showSign, setShowSign] = useState(false);
    const [signForm, setSignForm] = useState<JSX.Element | null>(null);

    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;


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
            <header className="header-pickup-point">
                <div className="container grid grid-cols-5 gap-4 items-center py-4 mx-auto">
                    {/* Логотип */}
                    <div className="logo">
                        <a href={"/pp/orders"}  className="text-2xl font-bold">MARKET </a>
                        <a href={"/pp/orders"}  className="miniLogo text-2xl font-bold">пвз</a>
                    </div>

                    <div className="nav-links">
                        <a href="/pp/profile" className={`nav-link ${isActive('/pp/profile') ? 'active' : ''}`}>Профиль</a>
                        <a href="/pp/orders" className={`nav-link ${isActive('/pp/orders') ? 'active' : ''}`}>Заказы</a>
                    </div>
                </div>
            </header>
        </div>
    );
}

export default HeaderPickupPoint;