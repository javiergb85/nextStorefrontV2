export interface VtexOrderForm {
    orderFormId:             string;
    salesChannel:            string;
    loggedIn:                boolean;
    isCheckedIn:             boolean;
    storeId:                 null;
    checkedInPickupPointId:  null;
    allowManualPrice:        boolean;
    canEditData:             boolean;
    userProfileId:           null;
    userType:                null;
    ignoreProfileData:       boolean;
    value:                   number;
    messages:                any[];
    items:                   any[];
    selectableGifts:         any[];
    totalizers:              any[];
    shippingData:            null;
    clientProfileData:       null;
    paymentData:             PaymentData;
    marketingData:           null;
    sellers:                 any[];
    clientPreferencesData:   ClientPreferencesData;
    commercialConditionData: null;
    storePreferencesData:    StorePreferencesData;
    giftRegistryData:        null;
    openTextField:           null;
    invoiceData:             null;
    customData:              null;
    itemMetadata:            null;
    hooksData:               null;
    ratesAndBenefitsData:    RatesAndBenefitsData;
    subscriptionData:        null;
    merchantContextData:     null;
    purchaseAgentsData:      null;
    itemsOrdination:         null;
}

export interface ClientPreferencesData {
    locale:          string;
    optinNewsLetter: null;
}

export interface PaymentData {
    updateStatus:          string;
    installmentOptions:    any[];
    paymentSystems:        any[];
    payments:              any[];
    giftCards:             any[];
    giftCardMessages:      any[];
    availableAccounts:     any[];
    availableTokens:       any[];
    availableAssociations: AvailableAssociations;
}

export interface AvailableAssociations {
}

export interface RatesAndBenefitsData {
    rateAndBenefitsIdentifiers: any[];
    teaser:                     any[];
}

export interface StorePreferencesData {
    countryCode:        string;
    saveUserData:       boolean;
    timeZone:           string;
    currencyCode:       string;
    currencyLocale:     number;
    currencySymbol:     string;
    currencyFormatInfo: CurrencyFormatInfo;
}

export interface CurrencyFormatInfo {
    currencyDecimalDigits:    number;
    currencyDecimalSeparator: string;
    currencyGroupSeparator:   string;
    currencyGroupSize:        number;
    startsWithCurrencySymbol: boolean;
}
