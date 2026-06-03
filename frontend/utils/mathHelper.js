export const calculateDiscount = (price, discountPercent) => {
    if (!price || !discountPercent) return price;
    return price - (price * discountPercent / 100);
};

export const formatPercent = (value) => {
    return `${value}%`;
};
