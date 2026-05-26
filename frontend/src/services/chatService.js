import OpenAI from 'openai';
import { get } from '../../services/http';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY || import.meta.env.NEXT_PUBLIC_OPENAI_API_KEY;

const openai = apiKey ? new OpenAI({ apiKey, dangerouslyAllowBrowser: true }) : null;

const CHAT_MODEL = 'gpt-4o-mini';

let cachedProducts = null;
const VND_FORMATTER = new Intl.NumberFormat('vi-VN');

const SYSTEM_PROMPT = `Ban la tro ly ao nhiet tinh cua cua hang giay ZestFoot (HKT-Shoes).
Nhiem vu la tu van giay, goi y size, va tra loi thac mac don hang/van chuyen/doi tra.
Tra loi ngan gon, lich su, than thien, bang tieng Viet.

QUAN TRONG:
1. Chi dua vao thong tin san pham trong RAG context. Neu khong co trong context thi noi ro la chua tim thay, khong tu bia.
2. Khi goi y san pham thi uu tien markdown:
![Ten san pham](URL_HINH)
[Ten san pham hien thi](/products/ID_SAN_PHAM)`;

const STORE_KNOWLEDGE_BASE = `Thong tin chung cua cua hang:
- Giao hang: Noi thanh 1-2 ngay, tinh thanh khac 3-5 ngay.
- Thanh toan: COD, chuyen khoan QR, vi dien tu.
- Doi tra: Ho tro doi size/mau trong 7 ngay (giay chua su dung, con tem hop).
- Size: Co bang quy doi US/UK/CM.`;

const retrieveRelevantProducts = (message, products) => {
    if (!message || !products) return [];

    const normalizedMsg = message.toLowerCase().trim();
    const keywords = normalizedMsg.split(' ').filter((k) => k.length > 1);

    const scoredProducts = products.map((product) => {
        let score = 0;
        const searchString =
            `${product.name} ${product.brand} ${product.category} ${product.subCategory || ''}`.toLowerCase();

        if (product.brand && normalizedMsg.includes(product.brand.toLowerCase())) {
            score += 10;
        }

        keywords.forEach((kw) => {
            if (searchString.includes(kw)) score += 1;
        });

        if (normalizedMsg.includes('ban chay') || normalizedMsg.includes('hot') || normalizedMsg.includes('trend')) {
            if (product.isTrending) score += 5;
        }

        if (normalizedMsg.includes('moi')) {
            if (product.isNew) score += 5;
        }

        if (normalizedMsg.includes('khuyen mai') || normalizedMsg.includes('giam gia') || normalizedMsg.includes('sale')) {
            if (product.isSale || (product.salePrice && product.salePrice < product.price)) score += 5;
        }

        if (normalizedMsg.includes('nam') && product.gender === 'men') score += 5;
        if (normalizedMsg.includes('nu') && product.gender === 'women') score += 5;

        return { ...product, score };
    });

    const relevant = scoredProducts
        .filter((p) => p.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    return relevant.length > 0 ? relevant : products.slice(0, 5);
};

const formatPrice = (product) => {
    const value = product?.salePrice ?? product?.price;
    if (typeof value !== 'number') return 'Lien he';
    return `${VND_FORMATTER.format(value)}d`;
};

const buildFallbackReply = (products) => {
    if (!products || products.length === 0) {
        return 'Xin loi, AI dang tam thoi qua tai va shop chua tim thay san pham phu hop. Ban thu mo ta ro hon ve hang, muc gia, loai giay hoac gioi tinh de minh goi y sat hon.';
    }

    const suggestions = products
        .slice(0, 3)
        .map((p) => {
            const imageLine = p.image ? `![${p.name}](${p.image})\n` : '';
            return `${imageLine}[${p.name}](/products/${p.id})\nGia tham khao: ${formatPrice(p)}\nHang: ${p.brand || 'Dang cap nhat'}`;
        })
        .join('\n\n');

    return `AI dang ban hoac vuot quota, minh goi y nhanh theo du lieu san pham hien co:\n\n${suggestions}\n\nBan co the noi them vi du: "giay chay bo nam duoi 2 trieu" de minh loc sat hon.`;
};

export async function processChat(message) {
    try {
        if (!message || typeof message !== 'string') {
            throw new Error('Noi dung tin nhan khong hop le.');
        }

        if (!cachedProducts) {
            try {
                cachedProducts = await get('/products');
            } catch (error) {
                console.error('Loi tai san pham cho RAG:', error.message);
                throw new Error('Khong the tai du lieu san pham.');
            }
        }

        const relevantProducts = retrieveRelevantProducts(message, cachedProducts);

        const contextText =
            relevantProducts.length > 0
                ? `[RAG CONTEXT]:\n${relevantProducts
                      .map(
                          (p) =>
                              `- Ten: ${p.name}\n  ID: ${p.id}\n  Hinh: ${p.image || ''}\n  Hang: ${p.brand}\n  Gia: ${formatPrice(p)}\n  Phan loai: ${p.category}`
                      )
                      .join('\n\n')}`
                : '[RAG CONTEXT]: Khong tim thay san pham sat tu khoa.';

        if (!openai) {
            return buildFallbackReply(relevantProducts);
        }

        try {
            const completion = await openai.chat.completions.create({
                model: CHAT_MODEL,
                temperature: 0.4,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'system', content: `Hay ghi nho thong tin cua hang sau:\n${STORE_KNOWLEDGE_BASE}` },
                    { role: 'user', content: `${contextText}\n\n[USER QUERY]: ${message}` },
                ],
            });

            return completion.choices?.[0]?.message?.content || 'Xin loi, toi chua the tra loi luc nay.';
        } catch (openaiError) {
            console.error('Loi OpenAI chat-rag:', openaiError);

            const isQuotaOrRateLimit =
                openaiError?.status === 429 ||
                openaiError?.code === 'insufficient_quota' ||
                /429|quota|rate limit/i.test(openaiError?.message || '');

            if (isQuotaOrRateLimit) {
                return buildFallbackReply(relevantProducts);
            }

            throw openaiError;
        }
    } catch (error) {
        console.error('Loi API chat-rag:', error);
        throw new Error('Xin loi, he thong tu van bi loi ket noi hoac qua tai.');
    }
}
