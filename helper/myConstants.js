let constants = {
    SHIPPING_CHARGE: 20,
    //permissions
    PERMISSION_ATTACH_DEMO_AD: 0,
    PERMISSION_USER_INFO: 1,
    PERMISSION_SHOP_AND_AD_INFO: 2,
    PERMISSION_VERIFY_ACCOUNT: 3,
    PERMISSION_CREATE_DEMO_AD: 4,
    PERMISSION_CHANGE_ACCOUNT_NUMBER: 5,
    PERMISSION_UPDATE_HOMEPAGE_DATA: 6,
    PERMISSION_TYPES: [
        "attachDemoAd",
        "userInfo",
        "shopAndAdInfo",
        "verifyAccount",
        "createDemoAd",
        "changeAccountNumber",
        "updateHomepageData"
    ],
    // Order or delivery state
    ORDER_PLACED: 0,
    REQUEST_ASSIGNED: 1,
    WAITING_FOR_RESPONSE: 2,
    WAITING_FOR_DECISION: 3,
    ACCEPTED: 4,
    SHOPPING_STARTED: 5,
    SHOPPING_ENDED: 6,
    OUT_FOR_DELIVERY: 7,
    DELIVERY_COMPLETION_REQUEST: 8,
    DELIVERY_COMPLETED: 9,
    NO_DELIVERY_PERSON_FOUND: 10,
    DELIVERY_CANCELED: 11,
    ORDER_CANCELED: 12,
    // preOrder extra states
    SELLER_REJECTED: 13,
    ORDER_CANCLED_BY_SELLER: 14,
    SELLER_ACCEPTED: 15,
    SELLER_INITIATED: 16,
    USER_INITIATED: 17,
    // Limit value
    MAX_INT_VALUE: 999999999999999,
    MAX_FRACTION_VALUE: 999999999999999.99
};

constants.USER_PERMISSIONS = {
    "General User": [],
    "Field Agent": [
        constants.PERMISSION_ATTACH_DEMO_AD
    ],
    "Customer Support Agent": [
        constants.PERMISSION_ATTACH_DEMO_AD,
        constants.PERMISSION_USER_INFO,
        constants.PERMISSION_SHOP_AND_AD_INFO
    ],
    "Manager": [
        constants.PERMISSION_ATTACH_DEMO_AD,
        constants.PERMISSION_USER_INFO,
        constants.PERMISSION_SHOP_AND_AD_INFO,
        constants.PERMISSION_VERIFY_ACCOUNT
    ],
    "Developer": [
        constants.PERMISSION_CREATE_DEMO_AD
    ],
    "Senior Manager": [
        constants.PERMISSION_ATTACH_DEMO_AD,
        constants.PERMISSION_USER_INFO,
        constants.PERMISSION_SHOP_AND_AD_INFO,
        constants.PERMISSION_VERIFY_ACCOUNT,
        constants.PERMISSION_CREATE_DEMO_AD
    ],
    "Regional Admin": [
        constants.PERMISSION_ATTACH_DEMO_AD,
        constants.PERMISSION_USER_INFO,
        constants.PERMISSION_SHOP_AND_AD_INFO,
        constants.PERMISSION_VERIFY_ACCOUNT,
        constants.PERMISSION_CREATE_DEMO_AD,
        constants.PERMISSION_CHANGE_ACCOUNT_NUMBER,
        constants.PERMISSION_UPDATE_HOMEPAGE_DATA
    ],
    "Admin": [
        constants.PERMISSION_ATTACH_DEMO_AD,
        constants.PERMISSION_USER_INFO,
        constants.PERMISSION_SHOP_AND_AD_INFO,
        constants.PERMISSION_VERIFY_ACCOUNT,
        constants.PERMISSION_CREATE_DEMO_AD,
        constants.PERMISSION_CHANGE_ACCOUNT_NUMBER,
        constants.PERMISSION_UPDATE_HOMEPAGE_DATA
    ]
}

module.exports = constants;