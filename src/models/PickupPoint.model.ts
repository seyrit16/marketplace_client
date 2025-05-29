export interface Address {
    id: string;
    region: string;
    city: string;
    street: string;
    house: string;
    postalCode: string;
}

export interface PickupPointCreateRequest {
    id: string;
    address: Address;
    workingHours: string;
    phoneNumber: string;
    addInfo: string;
}

export interface PickupPointSignUpData {
    email: string;
    password: string;
    code: string;
    pickupPointCreateRequest: PickupPointCreateRequest;
}

export interface PickupPointUpdateRequest {
    workingHours?: string;
    phoneNumber?: string;
    addInfo?: string;
}
