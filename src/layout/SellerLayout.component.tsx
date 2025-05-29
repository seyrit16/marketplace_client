import React from "react";
import {UserProvider} from "../context/UserContext.tsx";
import {CatalogProvider} from "../context/CatalogContext.tsx";
import {Route, Routes} from "react-router-dom";
import HeaderSeller from "../components/seller/header/HeaderSeller.component.tsx";
import SignInSeller from "../components/seller/sign_in/SignInSeller.component.tsx";
import SignUpSeller from "../components/seller/sign_up/SignUpSeller.component.tsx";
import SellerProfile from "../components/seller/seller_profile/SellerProfile.component.tsx";
import ProductsAreaSeller from "../components/seller/products_area/ProductsAreaSeller.component.tsx";
import ProductDetailSeller from "../components/seller/product_detail/ProductDetailSeller.component.tsx";
import ProductCreate from "../components/seller/product_create/ProductCreate.component.tsx";

const SellerLayout: React.FC = () => {
    return (
        <UserProvider>
            <CatalogProvider>
                <div className="app">
                    <HeaderSeller />
                    <Routes>
                        <Route path="/sign_in" element={<SignInSeller />} />
                        <Route path="/sign_up" element={<SignUpSeller />} />
                        <Route path="/profile" element={<SellerProfile />} />
                        <Route path="/products" element={<ProductsAreaSeller />} />
                        <Route path="/product/:productId" element={<ProductDetailSeller/>}/>
                        <Route path="/product/create" element={<ProductCreate/>}/>
                    </Routes>
                </div>
            </CatalogProvider>
        </UserProvider>
    );
};

export default SellerLayout;