import { CatalogProvider } from "../context/CatalogContext.tsx";
import {UserProvider} from "../context/UserContext.tsx";
import Header from "../components/user/header/Header.component.tsx";
import { Routes, Route } from 'react-router-dom';
import SearchProductArea from "../components/user/search_area/SearchProductArea.component.tsx";
import ProductDetailComponent from "../components/user/product_detail/ProductDetail.component.tsx";
import UserProfile from "../components/user/user_profile/UserProfile.component.tsx";
import Cart from "../components/user/cart/Cart.component.tsx";
import React from "react";

const UserLayout: React.FC = () => {
    return (
        <UserProvider>
            <CatalogProvider>
                <div className="app">
                    <Header />
                    <Routes>
                        <Route path="/" element={<SearchProductArea />} />
                        <Route path="/product/:id" element={<ProductDetailComponent />} />
                        <Route path="/category/:categoryId" element={<SearchProductArea />} />
                        <Route path="/profile" element = {<UserProfile/>}/>
                        <Route path="/cart" element={<Cart/>}/>
                    </Routes>
                </div>
            </CatalogProvider>
        </UserProvider>
    );
};

export default UserLayout;