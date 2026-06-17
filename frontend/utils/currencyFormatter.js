export const formatVND = (amount) => {
    if (typeof amount !== 'number') return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};
