// Header.component.tsx
import React, {useEffect, useState} from 'react';
import './Header.style.scss';
import SvgSelector from "../../SvgSelector.component.tsx";
import SignInForm from "../sign_in/SignIn.component.tsx";
import SignUpForm from "../sign_up/SignUpForm.component.tsx";
import {type JSX} from "react/jsx-dev-runtime";
import CatalogDropdown from "../catalog/CatalogDropdown.component.tsx";
import {type Category, useCatalog} from "../../../context/CatalogContext.tsx";
import {useUser} from "../../../context/UserContext.tsx";
import {useNavigate} from "react-router-dom";
import {checkAuthentication, signInWithCode} from "../../../api/AuthApi.ts";


const Header: React.FC = () => {
        const {state} = useUser();
        const [showSign, setShowSign] = useState(false);
        const [signForm, setSignForm] = useState<JSX.Element | null>(null);
        const [showCatalog, setShowCatalog] = useState(false);
        const {catalog, setCatalog: setGlobalCatalog} = useCatalog();
        const navigate = useNavigate();

        const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

        useEffect(() => {
            const handleResize = () => {
                setIsMobile(window.innerWidth < 768);
            };
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }, []);

        const truncateText = (text: string, maxLength: number) => {
            if (text.length > maxLength) {
                return text.slice(0, maxLength) + '...';
            }
            return text;
        };

        const handleProfileOnClick = async () => {

            try {
                await checkAuthentication();
                navigate('/profile')
            } catch (e: any) {
                if (e.response?.status !== 200) {
                    setSignForm(<SignInForm onClose={onCloseSignForm} openSignUp={onOpenSignUp}/>);
                    setShowSign(true);
                }
            }

        }

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

        const toggleCatalog = () => {
            setShowCatalog(!showCatalog);
        }

        const onClickCart = () => {
            navigate("/cart");
        }

        const handleSetCategory = (selectedCategory: Category) => {
            setGlobalCatalog(prev => ({
                ...prev,
                selectedCategory: selectedCategory
            }));
        }

        const logoOnClick = () => {
            setGlobalCatalog(prev => ({
                ...prev,
                selectedCategory: null
            }));
        }

        return (
            <div>
                {showSign && (signForm)}
                <header className="header">
                    <div className="container grid grid-cols-5 gap-4 items-center py-4 mx-auto">
                        {/* Логотип */}
                        <div className="logo">
                            <a href={"/"} onClick={logoOnClick} className="text-2xl font-bold">MARKET</a>
                        </div>

                        {/* Кнопка каталога */}
                        <button className="catalog-btn" onPointerDown={(e) => {
                            e.preventDefault();
                            toggleCatalog()
                        }}>
                            <SvgSelector id="catalog" className="h-6 w-6"/>
                            {catalog.selectedCategory ? truncateText(catalog.selectedCategory.name, 17) : 'Каталог'}
                        </button>

                        {/* Поисковая строка */}
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Поиск товаров..."
                                className="search-input"
                            />
                            <button className="search-btn">
                                <SvgSelector id="search" className="h-6 w-6"/>
                            </button>
                        </div>
                        {isMobile ? (
                            <div className="profile-cart-group">

                                {/* Кнопка профиля */}
                                <button className="profile-btn" onClick={handleProfileOnClick}>
                                    <SvgSelector id="profile" className="h-6 w-6"/>
                                </button>

                                {/* Кнопка корзины */}
                                <button className="cart-btn" onClick={onClickCart}>
                                    <SvgSelector id="cart" className="h-6 w-6"/>
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Кнопка профиля */}
                                <button className="profile-btn" onClick={handleProfileOnClick}>
                                    <SvgSelector id="profile" className="h-6 w-6"/>
                                </button>

                                {/* Кнопка корзины */}
                                <button className="cart-btn" onClick={onClickCart}>
                                    <SvgSelector id="cart" className="h-6 w-6"/>
                                </button>
                            </>
                        )}


                    </div>
                </header>

                <CatalogDropdown
                    isOpen={showCatalog}
                    onClose={() => setShowCatalog(false)}
                    setCatalog={handleSetCategory}
                />
            </div>
        );
    }
;

export default Header;