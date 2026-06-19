import { get, post } from './http';
import { clearStoredUser, getStoredUser, setStoredUser } from './authStorage';

const withFallback = async (request, fallback, errorMessage) => {
    try {
        return await request();
    } catch (error) {
        console.error(errorMessage, error.message);
        return fallback;
    }
};

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
const getProductText = (product) => ({
    name: (product.name || '').toLowerCase(),
    subCategory: (product.subCategory || '').toLowerCase(),
    brand: (product.brand || '').toLowerCase(),
});

const includesAny = (value, terms) => terms.some((term) => value.includes(term));

// ===== Brands =====
export const getBrands = async () => withFallback(() => get('/brands'), [], 'Error fetching brands:');

// ===== Products =====
export const getAllProducts = async () => withFallback(() => get('/products').then(normalizeProducts), [], 'Error fetching all products:');

export const getProductById = async (id) => withFallback(() => get(`/products/${id}`).then(normalizeProduct), null, 'Error fetching product by ID:');

export const getNewArrivals = async () => withFallback(() => get('/products', { params: { isNew: true } }).then(normalizeProducts), [], 'Error fetching new arrivals:');

export const getSaleProducts = async () => withFallback(() => get('/products', { params: { isSale: true } }).then(normalizeProducts), [], 'Error fetching sale products:');

export const getTrendingProducts = async () => withFallback(() => get('/products', { params: { isTrending: true } }).then(normalizeProducts), [], 'Error fetching trending products:');

export const getAsicsProducts = async () => withFallback(() => get('/products', { params: { brand: 'ASICS' } }).then(normalizeProducts), [], 'Error fetching ASICS products:');

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

        const isMatchingGender = (product) => !matchGender || product.gender === matchGender;
        const isMatchingText = (product, terms) => {
            const { name, subCategory } = getProductText(product);
            return includesAny(name, terms) || includesAny(subCategory, terms);
        };

        if (lowerSlug.includes('giay-the-thao')) {
            return all.filter((product) => {
                if (!isMatchingGender(product) || product.category !== 'shoes') return false;
                const { name, subCategory } = getProductText(product);
                const isExplicitSneaker = subCategory === 'sneaker' || includesAny(name, ['sneaker', 'thể thao', 'running', 'walking']);
                const isOtherType = includesAny(name, ['sandal', 'xăng đan', 'dép', 'slide', 'da ', 'tây', 'boot', 'loafer']);
                return isExplicitSneaker || (!subCategory && !isOtherType);
            });
        }
        if (lowerSlug.includes('giay-xang-dan')) {
            return all.filter((product) => isMatchingGender(product) && product.category === 'shoes' && isMatchingText(product, ['sandal', 'xăng đan']));
        }
        if (lowerSlug.includes('dep')) {
            return all.filter((product) => isMatchingGender(product) && product.category === 'shoes' && isMatchingText(product, ['dép', 'slide']) || getProductText(product).subCategory === 'slipper' || getProductText(product).subCategory === 'slide');
        }
        if (lowerSlug.includes('giay-da')) {
            return all.filter((product) => {
                if (!isMatchingGender(product) || product.category !== 'shoes') return false;
                const { name, subCategory } = getProductText(product);
                return subCategory === 'formal' || includesAny(name, ['giày da', 'business', 'loafer', 'boot', 'tây']);
            });
        }
        if (lowerSlug === 'ao') {
            return all.filter((product) => {
                if (product.category !== 'apparel') return false;
                const { name, subCategory } = getProductText(product);
                return includesAny(subCategory, ['shirt', 'top']) || includesAny(name, ['áo', 'hoodie', 'jacket', 'tee']);
            });
        }
        if (lowerSlug === 'quan') {
            return all.filter((product) => {
                if (product.category !== 'apparel') return false;
                const { name, subCategory } = getProductText(product);
                return includesAny(subCategory, ['pant', 'bottom']) || includesAny(name, ['quần', 'short', 'legging']);
            });
        }
        if (lowerSlug === 'day-giay') {
            return all.filter((product) => {
                const { name, subCategory } = getProductText(product);
                return name.includes('dây') || subCategory === 'shoelace';
            });
        }

        switch (lowerSlug) {
            case 'tui':
                return all.filter((product) => {
                    const { name, subCategory } = getProductText(product);
                    return subCategory === 'bag' || includesAny(name, ['balo', 'túi']);
                });
            case 'non':
                return all.filter((product) => {
                    const { name, subCategory } = getProductText(product);
                    return subCategory === 'hat' || name.includes('nón');
                });
            case 'vo':
                return all.filter((product) => {
                    const { name, subCategory } = getProductText(product);
                    return subCategory === 'socks' || name.includes('vớ');
                });
            case 'chay-bo':
                return all.filter((product) => {
                    const { name } = getProductText(product);
                    return product.category === 'shoes' && includesAny(name, ['running', 'chạy']);
                });
            case 'cham-soc-giay':
                return all.filter((product) => product.category === 'care');
            case 'sale':
                return all.filter((product) => product.isSale || (product.salePrice && product.salePrice < product.price));
            case 'doc-quyen':
                return all.filter((product) => product.isAsicsExclusive || (product.badges && JSON.stringify(product.badges).includes('EXCLUSIVE')));
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
    return withFallback(() => get('/news'), [], 'Error fetching news:');
};

export const getNewsById = async (id) => {
    return withFallback(() => get(`/news/${id}`), null, 'Error fetching news by ID:');
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
        setStoredUser(data.user);
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
    clearStoredUser();
};

export const isAuthenticated = async () => Boolean(localStorage.getItem('token'));

export const getCurrentUser = () => {
    return getStoredUser();
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
