import { get, post } from './http';

const tryParseJSON = (raw) => {
    if (raw == null) return raw;
    if (typeof raw !== 'string') return raw;
    try { return JSON.parse(raw); } catch { return raw; }
};

const normalizeProduct = (p) => {
    if (!p) return p;
    return {
        ...p,
        badges: tryParseJSON(p.badges),
        images: tryParseJSON(p.images),
        sizes: tryParseJSON(p.sizes),
        colors: tryParseJSON(p.colors),
    };
};

const normalizeProducts = (list) => (Array.isArray(list) ? list.map(normalizeProduct) : []);

// ===== Brands =====
export const getBrands = async () => {
    try {
        return await get('/brands');
    } catch (error) {
        console.error('Error fetching brands:', error.message);
        return [];
    }
};

// ===== Products =====
export const getAllProducts = async () => {
    try {
        return normalizeProducts(await get('/products'));
    } catch (error) {
        console.error('Error fetching all products:', error.message);
        return [];
    }
};

export const getProductById = async (id) => {
    try {
        return normalizeProduct(await get(`/products/${id}`));
    } catch (error) {
        console.error('Error fetching product by ID:', error.message);
        return null;
    }
};

export const getNewArrivals = async () => {
    try {
        return normalizeProducts(await get('/products', { params: { isNew: true } }));
    } catch (error) {
        console.error('Error fetching new arrivals:', error.message);
        return [];
    }
};

export const getSaleProducts = async () => {
    try {
        return normalizeProducts(await get('/products', { params: { isSale: true } }));
    } catch (error) {
        console.error('Error fetching sale products:', error.message);
        return [];
    }
};

export const getTrendingProducts = async () => {
    try {
        return normalizeProducts(await get('/products', { params: { isTrending: true } }));
    } catch (error) {
        console.error('Error fetching trending products:', error.message);
        return [];
    }
};

export const getAsicsProducts = async () => {
    try {
        return normalizeProducts(await get('/products', { params: { brand: 'ASICS' } }));
    } catch (error) {
        console.error('Error fetching ASICS products:', error.message);
        return [];
    }
};

// ===== Collections (filter local trên list product) =====
export const getProductsByCollection = async (slug) => {
    try {
        const all = await getAllProducts();
        const lowerSlug = slug ? slug.toLowerCase() : 'all';

        if (lowerSlug === 'all') return all;

        if (lowerSlug === 'giay-nu') return all.filter(p => p.gender === 'women' && p.category === 'shoes');
        if (lowerSlug === 'giay-nam') return all.filter(p => p.gender === 'men' && p.category === 'shoes');
        if (lowerSlug === 'quan-ao' || lowerSlug === 'phu-trang') return all.filter(p => p.category === 'apparel');
        if (lowerSlug === 'phu-kien1' || lowerSlug === 'phu-kien') {
            return all.filter(p => p.category !== 'shoes' && p.category !== 'apparel');
        }

        const matchGender = (lowerSlug.includes('nu') ? 'women' : (lowerSlug.includes('nam') ? 'men' : null));

        if (lowerSlug.includes('giay-the-thao')) {
            return all.filter(p => {
                if (matchGender && p.gender !== matchGender) return false;
                if (p.category !== 'shoes') return false;
                const nameHigh = (p.name || '').toLowerCase();
                const sub = p.subCategory ? p.subCategory.toLowerCase() : '';
                const isExplicitSneaker = sub === 'sneaker' || nameHigh.includes('sneaker') || nameHigh.includes('thể thao') || nameHigh.includes('running') || nameHigh.includes('walking');
                const isOtherType = nameHigh.includes('sandal') || nameHigh.includes('xăng đan') || nameHigh.includes('dép') || nameHigh.includes('slide') || nameHigh.includes('da ') || nameHigh.includes('tây') || nameHigh.includes('boot') || nameHigh.includes('loafer');
                return isExplicitSneaker || (!sub && !isOtherType);
            });
        }
        if (lowerSlug.includes('giay-xang-dan')) {
            return all.filter(p => {
                if (matchGender && p.gender !== matchGender) return false;
                if (p.category !== 'shoes') return false;
                const nameHigh = (p.name || '').toLowerCase();
                const sub = p.subCategory ? p.subCategory.toLowerCase() : '';
                return sub === 'sandal' || nameHigh.includes('sandal') || nameHigh.includes('xăng đan');
            });
        }
        if (lowerSlug.includes('dep')) {
            return all.filter(p => {
                if (matchGender && p.gender !== matchGender) return false;
                if (p.category !== 'shoes') return false;
                const nameHigh = (p.name || '').toLowerCase();
                const sub = p.subCategory ? p.subCategory.toLowerCase() : '';
                return sub === 'slipper' || sub === 'slide' || nameHigh.includes('dép') || nameHigh.includes('slide');
            });
        }
        if (lowerSlug.includes('giay-da')) {
            return all.filter(p => {
                if (matchGender && p.gender !== matchGender) return false;
                if (p.category !== 'shoes') return false;
                const nameHigh = (p.name || '').toLowerCase();
                const sub = p.subCategory ? p.subCategory.toLowerCase() : '';
                return sub === 'formal' || nameHigh.includes('giày da') || nameHigh.includes('business') || nameHigh.includes('loafer') || nameHigh.includes('boot') || nameHigh.includes('tây');
            });
        }
        if (lowerSlug === 'ao') {
            return all.filter(p => {
                if (p.category !== 'apparel') return false;
                const nameHigh = (p.name || '').toLowerCase();
                const sub = p.subCategory ? p.subCategory.toLowerCase() : '';
                return sub === 'shirt' || sub === 'top' || nameHigh.includes('áo') || nameHigh.includes('hoodie') || nameHigh.includes('jacket') || nameHigh.includes('tee');
            });
        }
        if (lowerSlug === 'quan') {
            return all.filter(p => {
                if (p.category !== 'apparel') return false;
                const nameHigh = (p.name || '').toLowerCase();
                const sub = p.subCategory ? p.subCategory.toLowerCase() : '';
                return sub === 'pant' || sub === 'bottom' || nameHigh.includes('quần') || nameHigh.includes('short') || nameHigh.includes('legging');
            });
        }
        if (lowerSlug === 'day-giay') {
            return all.filter(p => (p.name || '').toLowerCase().includes('dây') || (p.subCategory && p.subCategory.toLowerCase() === 'shoelace'));
        }

        switch (lowerSlug) {
            case 'tui':
                return all.filter(p => p.subCategory === 'bag' || (p.name || '').toLowerCase().includes('balo') || (p.name || '').toLowerCase().includes('túi'));
            case 'non':
                return all.filter(p => p.subCategory === 'hat' || (p.name || '').toLowerCase().includes('nón'));
            case 'vo':
                return all.filter(p => p.subCategory === 'socks' || (p.name || '').toLowerCase().includes('vớ'));
            case 'chay-bo':
                return all.filter(p => p.category === 'shoes' && ((p.name || '').toLowerCase().includes('running') || (p.name || '').toLowerCase().includes('chạy')));
            case 'cham-soc-giay':
                return all.filter(p => p.category === 'care');
            case 'sale':
                return all.filter(p => p.isSale || (p.salePrice && p.salePrice < p.price));
            case 'doc-quyen':
                return all.filter(p => p.isAsicsExclusive || (p.badges && JSON.stringify(p.badges).includes('EXCLUSIVE')));
            default:
                break;
        }

        const brandMatch = all.filter(p => p.brand && p.brand.toLowerCase().replace(/\s+/g, '-') === lowerSlug);
        if (brandMatch.length > 0) return brandMatch;

        return [];
    } catch (error) {
        console.error('Error fetching collection products:', error.message);
        return [];
    }
};

// ===== News =====
export const getNews = async () => {
    try {
        return await get('/news');
    } catch (error) {
        console.error('Error fetching news:', error.message);
        return [];
    }
};

export const getNewsById = async (id) => {
    try {
        return await get(`/news/${id}`);
    } catch (error) {
        console.error('Error fetching news by ID:', error.message);
        return null;
    }
};

// ===== FAQ (static) =====
export const getFaqs = async () => [
    { id: 1, question: 'Làm sao để chọn size giày phù hợp?', key: 'faq_size_guide', answer: 'Bạn có thể tham khảo bảng quy đổi size (Size Chart) trong trang chi tiết sản phẩm. Nếu chân bè hoặc mu bàn chân dày, chúng tôi khuyên bạn nên tăng thêm 0.5 - 1 size.' },
    { id: 2, question: 'Chính sách đổi trả của ZestFoot như thế nào?', key: 'faq_return_policy', answer: 'ZestFoot hỗ trợ đổi hàng trong vòng 7 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên tem mác, chưa qua sử dụng và đầy đủ hộp.' },
    { id: 3, question: 'Thời gian giao hàng dự kiến là bao lâu?', key: 'faq_shipping_time', answer: 'Thời gian giao hàng:\n- Nội thành TP.HCM: 1-2 ngày.\n- Các tỉnh thành khác: 3-5 ngày tuỳ khu vực.' },
    { id: 4, question: 'Sản phẩm có được bảo hành không?', key: 'faq_warranty', answer: 'Có, ZestFoot bảo hành keo và chỉ trong vòng 6 tháng cho tất cả các sản phẩm giày dép chính hãng.' },
];

// ===== Auth =====
const persistAuth = (data) => {
    if (data?.session?.access_token) {
        localStorage.setItem('token', data.session.access_token);
    }
    if (data?.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
    }
};

export const registerUser = async (userData) => {
    try {
        const data = await post('/auth/register', userData);
        persistAuth(data);
        return { success: true, user: data.user, session: data.session };
    } catch (err) {
        return { success: false, message: err?.message || 'Lỗi đăng ký' };
    }
};

export const loginUser = async (email, password) => {
    try {
        const data = await post('/auth/login', { email: (email || '').trim(), password: (password || '').trim() });
        persistAuth(data);
        return { success: true, user: data.user, session: data.session };
    } catch (err) {
        return { success: false, message: err?.message || 'Email hoặc mật khẩu không đúng' };
    }
};

export const logoutUser = async () => {
    try {
        await post('/auth/logout', {});
    } catch (_) {
        // ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
};

export const isAuthenticated = async () => Boolean(localStorage.getItem('token'));

export const getCurrentUser = () => {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
};

// ===== Search (cache + local scoring) =====
let cachedAllProductsForSearch = null;

export const searchProducts = async (query) => {
    try {
        if (!query) return [];

        if (!cachedAllProductsForSearch) {
            cachedAllProductsForSearch = await getAllProducts();
        }

        const normalizedMsg = query.toLowerCase().trim();
        const keywords = normalizedMsg.split(' ').filter(k => k.length > 0);

        const scoredProducts = cachedAllProductsForSearch.map(product => {
            let score = 0;
            const searchString = `${product.name} ${product.brand} ${product.category} ${product.subCategory || ''}`.toLowerCase();

            if (product.brand && normalizedMsg.includes(product.brand.toLowerCase())) {
                score += 10;
            }

            keywords.forEach(kw => {
                if (searchString.includes(kw)) score += 2;
            });

            if (normalizedMsg.includes('nam') && product.gender === 'men') score += 5;
            if (normalizedMsg.includes('nữ') && product.gender === 'women') score += 5;

            if (normalizedMsg.includes('hot') || normalizedMsg.includes('trend')) {
                if (product.isTrending) score += 5;
            }

            if (normalizedMsg.includes('sale') || normalizedMsg.includes('giảm') || normalizedMsg.includes('khuyến mãi')) {
                if (product.isSale || (product.salePrice && product.salePrice < product.price)) score += 5;
            }

            return { ...product, score };
        });

        return scoredProducts.filter(p => p.score > 0).sort((a, b) => b.score - a.score);
    } catch (error) {
        console.error('Lỗi khi tìm kiếm sản phẩm:', error.message);
        return [];
    }
};
