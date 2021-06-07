module.exports = (ad,shop) => {
    return shop && !ad.isDeleted && ad.parcel && ad.preOrder && ad.for === "Sale" && shop.active && shop.preOrderPermission && shop.preOrder;
}