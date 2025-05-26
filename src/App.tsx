import './App.scss'
import * as React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserLayout from "./layout/UserLayout.component.tsx";
import SellerLayout from "./layout/SellerLayout.component.tsx";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/*" element={<UserLayout />} />
                <Route path="/seller/*" element={<SellerLayout />} />
                {/*<Route path="/pickup-point/*" element={<PickupPointLayout />} />*/}
            </Routes>
        </Router>
    );
};

export default App;

