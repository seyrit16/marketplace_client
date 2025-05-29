import './App.scss'
import * as React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserLayout from "./layout/UserLayout.component.tsx";
import SellerLayout from "./layout/SellerLayout.component.tsx";
import PickupPointLayout from './layout/PickupPointLayout.component.tsx';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/*" element={<UserLayout />} />
                <Route path="/seller/*" element={<SellerLayout />} />
                <Route path="/pp/*" element={<PickupPointLayout />} />
            </Routes>
        </Router>
    );
};

export default App;

