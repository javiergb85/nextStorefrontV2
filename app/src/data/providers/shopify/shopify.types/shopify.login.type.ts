export interface ShopifyLogin {
    data: Data;
}

export interface Data {
    customerAccessTokenCreate: CustomerAccessTokenCreate;
}

export interface CustomerAccessTokenCreate {
    customerAccessToken: CustomerAccessToken;
    customerUserErrors:  any[];
}

export interface CustomerAccessToken {
    accessToken: string;
    expiresAt:   Date;
}
