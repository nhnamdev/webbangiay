


const WAREHOUSE_COORDS = { lat: 10.875, lng: 106.772 };


const PROVINCES_DB = [

    { name: "Hà Nội", lat: 21.0285, lng: 105.8542 },
    { name: "TP. Hồ Chí Minh", lat: 10.8231, lng: 106.6297 },
    { name: "Hải Phòng", lat: 20.8449, lng: 106.6881 },
    { name: "Đà Nẵng", lat: 16.0544, lng: 108.2022 },
    { name: "Cần Thơ", lat: 10.0452, lng: 105.7469 },


    { name: "An Giang", lat: 10.5216, lng: 105.1259 },
    { name: "Bà Rịa - Vũng Tàu", lat: 10.5667, lng: 107.2333 },
    { name: "Bạc Liêu", lat: 9.2940, lng: 105.7278 },
    { name: "Bắc Giang", lat: 21.2810, lng: 106.1970 },
    { name: "Bắc Kạn", lat: 22.1470, lng: 105.8340 },
    { name: "Bắc Ninh", lat: 21.1861, lng: 106.0763 },
    { name: "Bến Tre", lat: 10.1667, lng: 106.5000 },
    { name: "Bình Dương", lat: 11.1600, lng: 106.6660 },
    { name: "Bình Định", lat: 13.7820, lng: 109.2190 },
    { name: "Bình Phước", lat: 11.7512, lng: 106.7235 },
    { name: "Bình Thuận", lat: 11.1000, lng: 108.2000 },
    { name: "Cà Mau", lat: 9.1769, lng: 105.1524 },
    { name: "Cao Bằng", lat: 22.6666, lng: 106.2580 },
    { name: "Đắk Lắk", lat: 12.6667, lng: 108.0500 },
    { name: "Đắk Nông", lat: 12.0040, lng: 107.6900 },
    { name: "Điện Biên", lat: 21.3833, lng: 103.0167 }, // <-- Đã bổ sung
    { name: "Đồng Nai", lat: 11.2333, lng: 107.1833 },
    { name: "Đồng Tháp", lat: 10.4938, lng: 105.6881 },
    { name: "Gia Lai", lat: 13.9833, lng: 108.0000 },
    { name: "Hà Giang", lat: 22.8233, lng: 104.9836 },
    { name: "Hà Nam", lat: 20.5833, lng: 105.9167 },
    { name: "Hà Tĩnh", lat: 18.3559, lng: 105.8877 },
    { name: "Hải Dương", lat: 20.9373, lng: 106.3146 },
    { name: "Hậu Giang", lat: 9.7845, lng: 105.4700 },
    { name: "Hòa Bình", lat: 20.8172, lng: 105.3376 },
    { name: "Hưng Yên", lat: 20.6464, lng: 106.0511 },
    { name: "Khánh Hòa", lat: 12.2500, lng: 109.1833 },
    { name: "Kiên Giang", lat: 10.0100, lng: 105.0800 },
    { name: "Kon Tum", lat: 14.3497, lng: 108.0000 },
    { name: "Lai Châu", lat: 22.3964, lng: 103.4582 },
    { name: "Lâm Đồng", lat: 11.9500, lng: 108.4333 },
    { name: "Lạng Sơn", lat: 21.8537, lng: 106.7610 },
    { name: "Lào Cai", lat: 22.4856, lng: 103.9707 },
    { name: "Long An", lat: 10.6167, lng: 106.3333 },
    { name: "Nam Định", lat: 20.4388, lng: 106.1621 },
    { name: "Nghệ An", lat: 19.3333, lng: 104.8333 },
    { name: "Ninh Bình", lat: 20.2530, lng: 105.9750 },
    { name: "Ninh Thuận", lat: 11.5653, lng: 108.9886 },
    { name: "Phú Thọ", lat: 21.2684, lng: 105.2046 },
    { name: "Phú Yên", lat: 13.0955, lng: 109.3209 },
    { name: "Quảng Bình", lat: 17.4689, lng: 106.6223 },
    { name: "Quảng Nam", lat: 15.5394, lng: 108.0191 },
    { name: "Quảng Ngãi", lat: 15.1214, lng: 108.8044 },
    { name: "Quảng Ninh", lat: 21.0064, lng: 107.2925 },
    { name: "Quảng Trị", lat: 16.8162, lng: 107.1000 },
    { name: "Sóc Trăng", lat: 9.6025, lng: 105.9739 },
    { name: "Sơn La", lat: 21.3270, lng: 103.9140 },
    { name: "Tây Ninh", lat: 11.3667, lng: 106.1167 },
    { name: "Thái Bình", lat: 20.4463, lng: 106.3366 },
    { name: "Thái Nguyên", lat: 21.5928, lng: 105.8447 },
    { name: "Thanh Hóa", lat: 19.8067, lng: 105.7850 },
    { name: "Thừa Thiên Huế", lat: 16.4667, lng: 107.6000 },
    { name: "Tiền Giang", lat: 10.4167, lng: 106.1667 },
    { name: "Trà Vinh", lat: 9.9347, lng: 106.3450 },
    { name: "Tuyên Quang", lat: 21.8236, lng: 105.2140 },
    { name: "Vĩnh Long", lat: 10.2530, lng: 105.9722 },
    { name: "Vĩnh Phúc", lat: 21.3609, lng: 105.5474 },
    { name: "Yên Bái", lat: 21.7229, lng: 104.9113 }
];


const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const deg2rad = (deg) => deg * (Math.PI / 180);


const calculateFeeLogic = (distance, orderValue) => {
    // Đơn trên 3tr: miễn phí ship toàn quốc
    if (orderValue > 3000000) return 0;

    // Đơn từ 3tr trở xuống
    if (distance <= 100) return 0;

    // Trên 100km
    return 30000;
};

export const getProvinces = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const sorted = [...PROVINCES_DB].sort((a, b) => a.name.localeCompare(b.name));
            resolve(sorted);
        }, 300);
    });
};

// Cập nhật hàm này để nhận thêm orderValue
export const calculateShipping = async (provinceName, orderValue = 0) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const dest = PROVINCES_DB.find(p => p.name === provinceName);

            if (!dest) {
                resolve({
                    distance: 1000,
                    options: [
                        { id: 'standard', name: 'Tiêu chuẩn', fee: 30000, estimatedDays: "4-5 ngày" }
                    ]
                });
                return;
            }

            const distRaw = getDistanceFromLatLonInKm(
                WAREHOUSE_COORDS.lat, WAREHOUSE_COORDS.lng,
                dest.lat, dest.lng
            );
            const dist = Math.round(distRaw);

            // 1. Option Tiêu chuẩn
            const standardFee = calculateFeeLogic(dist, orderValue);
            let standardDays = "1 ngày";
            if (dist > 100) standardDays = "1-2 ngày";
            if (dist > 500) standardDays = "2-3 ngày";
            if (dist > 1000) standardDays = "3-5 ngày";

            const options = [
                {
                    id: 'standard',
                    name: 'Tiêu chuẩn',
                    fee: standardFee,
                    estimatedDays: standardDays
                }
            ];

            // 2. Option Hỏa tốc (chỉ nếu <= 100km)
            if (dist <= 100) {
                options.push({
                    id: 'express',
                    name: 'Hỏa tốc (Nhận trong ngày)',
                    fee: 100000, // 100k
                    estimatedDays: 'Trong ngày'
                });
            }

            resolve({
                distance: dist,
                options: options
            });
        }, 500);
    });
};