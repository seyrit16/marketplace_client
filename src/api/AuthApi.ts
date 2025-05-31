import axios from "axios";
import type {SignUpData} from "../models/User.model.ts";
import type {SellerRegistrationData} from "../models/Seller.model.ts";
import type {PickupPointSignUpData} from "../models/PickupPoint.model.ts";

const API_URL = import.meta.env.VITE_USER_SERVICE_API_URL;

export const sendCode = (email: string) => {
    const url = `${API_URL}/auth/send_code`
    const config = {
        params: {email}
    }
    return axios.post(url, {}, config);
};

export const checkAuthentication = ()=>{
    const url = `${API_URL}/auth/auth/check`;
    return axios.get(url,{ withCredentials: true });
}

export const logout = () => {
    const url = `${API_URL}/auth/logout`;
    return axios.post(url,null,{ withCredentials: true });
}

export const signUpUser = (data: SignUpData) => {
    const url = `${API_URL}/auth/sign_up/user`
    const config = {
        withCredentials: true
    }
    return axios.post(url, data, config);
}

export const signUpSeller = (data: SellerRegistrationData) => {
    const url = `${API_URL}/auth/sign_up/seller`
    const config = {
        withCredentials: true
    }
    return axios.post(url, data,config);
}

export const signUpPickupPoint = (data: PickupPointSignUpData) => {
    const url = `${API_URL}/auth/sign_up/pickup_point`
    const config = {
        withCredentials: true
    }
    return axios.post(url, data,config);
}

interface SignInWithCode {
    email: string;
    code: string;
}

type Role = 'u' | 's' | 'p';

export const signInWithCode = (role: Role, data: SignInWithCode) => {
    let url = `${API_URL}/auth/sign_in/with_code`
    switch (role) {
        case 'u':
            url += '/user';
            break;
        case 's':
            url += '/seller';
            break;
        case 'p':
            url += '/pickup_point';
            break;
    }
    const config={
        withCredentials: true
    }
    return axios.post(url, data,config);
}

interface SignInWithPassword {
    email: string;
    password: string;
}

export const signInWithPassword = (role: Role, data: SignInWithPassword) => {
    let url = `${API_URL}/auth/sign_in/with_password`
    switch (role) {
        case 'u':
            url += '/user';
            break;
        case 's':
            url += '/seller';
            break;
        case 'p':
            url += '/pickup_point';
            break;
    }
    const config={
        withCredentials: true
    }
    return axios.post(url, data,config);
}

