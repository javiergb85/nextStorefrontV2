export interface OrderListResponse {
  list: OrderSummary[];
  paging: {
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  };
  stats: {
    stats: {
      totalValue: {
        Count: number;
        Max: number;
        Mean: number;
        Min: number;
        Missing: number;
        StdDev: number;
        Sum: number;
        SumSq: number;
      };
      totalItems: {
        Count: number;
        Max: number;
        Mean: number;
        Min: number;
        Missing: number;
        StdDev: number;
        Sum: number;
        SumSq: number;
      };
    };
  };
}

export interface OrderSummary {
  orderId: string;
  creationDate: string;
  clientName: string;
  totalValue: number;
  paymentNames: string;
  status: string;
  statusDescription: string;
  marketPlaceOrderId: string;
  sequence: string;
  salesChannel: string;
  affiliateId: string;
  origin: string;
  workflowInErrorState: boolean;
  workflowInRetry: boolean;
  lastMessageUnread: string;
  ShippingEstimatedDate: string;
  ShippingEstimatedDateMax: string;
  ShippingEstimatedDateMin: string;
  orderIsComplete: boolean;
  listId: string;
  signedAuthorization: boolean;
  authorizationDate: string;
  hostname: string;
  items: OrderItem[];
}

export interface OrderDetail {
  orderId: string;
  sequence: string;
  marketplaceOrderId: string;
  marketplaceServicesEndpoint: string;
  sellerOrderId: string;
  origin: string;
  affiliateId: string;
  salesChannel: string;
  merchantName: string;
  status: string;
  statusDescription: string;
  value: number;
  creationDate: string;
  lastChange: string;
  orderGroup: string;
  totals: {
    id: string;
    name: string;
    value: number;
  }[];
  items: OrderItem[];
  clientProfileData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    documentType: string;
    document: string;
    phone: string;
    corporateName: string;
    tradeName: string;
    corporateDocument: string;
    stateInscription: string;
    corporatePhone: string;
    isCorporate: boolean;
    userProfileId: string;
    customerClass: string;
  };
  shippingData: {
    id: string;
    address: {
      addressType: string;
      receiverName: string;
      addressId: string;
      postalCode: string;
      city: string;
      state: string;
      country: string;
      street: string;
      number: string;
      neighborhood: string;
      complement: string;
      reference: string;
      geoCoordinates: number[];
    };
    logisticsInfo: {
      itemIndex: number;
      selectedSla: string;
      price: number;
      listPrice: number;
      sellingPrice: number;
      deliveryWindow: string;
      deliveryCompany: string;
      shippingEstimate: string;
      shippingEstimateDate: string;
      slas: {
        id: string;
        name: string;
        shippingEstimate: string;
        deliveryWindow: string;
        price: number;
        deliveryChannel: string;
        pickupStoreInfo: {
          isPickupStore: boolean;
          friendlyName: string;
          address: {
            addressType: string;
            receiverName: string;
            addressId: string;
            postalCode: string;
            city: string;
            state: string;
            country: string;
            street: string;
            number: string;
            neighborhood: string;
            complement: string;
            reference: string;
            geoCoordinates: number[];
          };
          additionalInfo: string;
          dockId: string;
        };
        polygonName: string;
        lockTTL: string;
        pickupPointId: string;
        transitTime: string;
      }[];
      shipsTo: string[];
      deliveryIds: {
        courierId: string;
        warehouseId: string;
        dockId: string;
        courierName: string;
        quantity: number;
      }[];
      deliveryChannel: string;
      pickupStoreInfo: {
        isPickupStore: boolean;
        friendlyName: string;
        address: {
          addressType: string;
          receiverName: string;
          addressId: string;
          postalCode: string;
          city: string;
          state: string;
          country: string;
          street: string;
          number: string;
          neighborhood: string;
          complement: string;
          reference: string;
          geoCoordinates: number[];
        };
        additionalInfo: string;
        dockId: string;
      };
      addressId: string;
      polygonName: string;
      pickupPointId: string;
      transitTime: string;
    }[];
    trackingHints: string;
    selectedAddresses: {
      addressType: string;
      receiverName: string;
      addressId: string;
      postalCode: string;
      city: string;
      state: string;
      country: string;
      street: string;
      number: string;
      neighborhood: string;
      complement: string;
      reference: string;
      geoCoordinates: number[];
    }[];
  };
  paymentData: {
    transactions: {
      transactionId: string;
      payments: {
        id: string;
        paymentSystem: string;
        paymentSystemName: string;
        value: number;
        installments: number;
        connectorResponse: string;
        referenceValue: number;
        cardHolder: string;
        cardNumber: string;
        firstDigits: string;
        lastDigits: string;
        cvv2: string;
        expireMonth: string;
        expireYear: string;
        url: string;
        giftCardId: string;
        giftCardName: string;
        giftCardCaption: string;
        redemptionCode: string;
        group: string;
        tid: string;
        dueDate: string;
        connectorResponses: string;
      }[];
    }[];
  };
  packageAttachment: {
    packages: string[];
  };
  sellers: {
    id: string;
    name: string;
    logo: string;
  }[];
  callCenterOperatorData: string;
  followUpEmail: string;
  lastMessage: string;
  hostname: string;
  invoiceData: string;
  changesAttachment: string;
  openTextField: string;
  roundingError: number;
  orderFormId: string;
  commercialConditionData: string;
  isCompleted: boolean;
  customData: string;
  storePreferencesData: {
    countryCode: string;
    currencyCode: string;
    currencyFormatInfo: {
      currencyDecimalDigits: number;
      currencyDecimalSeparator: string;
      currencyGroupSeparator: string;
      currencyGroupSize: number;
      startsWithCurrencySymbol: boolean;
    };
  };
  allowCancellation: boolean;
  allowEdition: boolean;
  isCheckedIn: boolean;
  marketplace: {
    baseURL: string;
    isCertified: string;
    name: string;
  };
}

export interface OrderItem {
  uniqueId: string;
  id: string;
  productId: string;
  ean: string;
  lockId: string;
  itemAttachment: {
    content: string;
    name: string;
  };
  attachments: string[];
  quantity: number;
  seller: string;
  name: string;
  refId: string;
  price: number;
  listPrice: number;
  manualPrice: string;
  priceTags: {
    name: string;
    value: number;
    isPercentual: boolean;
    identifier: string;
    rawValue: number;
  }[];
  imageUrl: string;
  detailUrl: string;
  components: string[];
  bundleItems: string[];
  params: string[];
  offerings: string[];
  sellerSku: string;
  priceValidUntil: string;
  commission: number;
  tax: number;
  preSaleDate: string;
  additionalInfo: {
    brandName: string;
    brandId: string;
    categoriesIds: string;
    categories: {
      id: number;
      name: string;
    }[];
    productClusterId: string;
    commercialConditionId: string;
    dimension: {
      cubicweight: number;
      height: number;
      length: number;
      weight: number;
      width: number;
    };
    offeringInfo: string;
    offeringType: string;
    offeringTypeId: string;
  };
  measurementUnit: string;
  unitMultiplier: number;
  sellingPrice: number;
  isGift: boolean;
  shippingPrice: string;
  rewardValue: number;
  freightCommission: number;
  priceDefinitions: string;
  taxCode: string;
  parentItemIndex: string;
  parentAssemblyBinding: string;
  callCenterOperator: string;
  serialNumbers: string;
  assemblies: string[];
  costPrice: number;
}
