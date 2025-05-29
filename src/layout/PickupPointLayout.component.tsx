import React from "react";
import {UserProvider} from "../context/UserContext.tsx";
import {CatalogProvider} from "../context/CatalogContext.tsx";
import {Route, Routes} from "react-router-dom";
import PickupPointSignUp from "../components/pickup_point/sign_up/PickupPointSignUp.component.tsx";
import HeaderPickupPoint from "../components/pickup_point/header/HeaderPickupPoint.component.tsx";
import PickupPointSignIn from "../components/pickup_point/sign_in/PickupPointSignIn.component.tsx";
import PickupPointProfile from "../components/pickup_point/pickup_profile/PickupPointProfile.component.tsx";
import OrderList from "../components/pickup_point/order_list/OrderList.component.tsx";

const PickupPointLayout: React.FC = () => {
    return (
        <UserProvider>
            <CatalogProvider>
                <div className="app">
                    <HeaderPickupPoint />
                    <Routes>
                        <Route path={"/sign_up"} element={<PickupPointSignUp/>} />
                        <Route path={"/sign_in"} element={<PickupPointSignIn/>} />
                        <Route path={"/profile"} element={<PickupPointProfile/>} />
                        <Route path={"/orders"} element={<OrderList/>}/>
                    </Routes>
                </div>
            </CatalogProvider>
        </UserProvider>
    );
};

export default PickupPointLayout;