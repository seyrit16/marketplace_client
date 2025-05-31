import axios from "axios";
import type {AddPaymentCardRequest, UpdateUserProfileData} from "../models/User.model.ts";


const USER_API_URL = import.meta.env.VITE_USER_SERVICE_API_URL;

export const getUserData = () => {
    const url =  `${USER_API_URL}/api/user`;
    const config = {
        withCredentials: true
    }
    return axios.get(url, config);
}

export const getAllCards = () =>{
    const url = `${USER_API_URL}/api/card/get/all`;
    const config = {
        withCredentials: true
    }
    return axios.get(url, config);
}


export const updateUserProfile = (data: UpdateUserProfileData) => {
    const url = `${USER_API_URL}/api/user/update/user_profile`;
    const config = {
        withCredentials: true
    }
    return axios.put(url, data, config);
}