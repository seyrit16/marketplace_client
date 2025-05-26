import React from "react";
import {UserProvider} from "../context/UserContext.tsx";
import {CatalogProvider} from "../context/CatalogContext.tsx";
import {Route, Routes} from "react-router-dom";
import HeaderSeller from "../components/seller/header/HeaderSeller.component.tsx";
import SignInSeller from "../components/seller/sign_in/SignInSeller.component.tsx";
import SignUpSeller from "../components/seller/sign_up/SignUpSeller.component.tsx";
import SellerProfile from "../components/seller/seller_profile/SellerProfile.component.tsx";

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
                    </Routes>
                </div>
            </CatalogProvider>
        </UserProvider>
    );
};

export default SellerLayout;