import { processChat } from '../src/services/chatService.js';

export const sendMessageToBot = async (message) => {
    try {
        const reply = await processChat(message);
        return reply || 'Xin lỗi, chưa nhận được phản hồi từ AI.';
    } catch (error) {
        console.error('Lỗi gọi API chat:', error);
        return error.message || "Xin lỗi, hiện tại hệ thống tư vấn bị lỗi kết nối hoặc quá tải. Bạn vui lòng thử lại sau nhé.";
    }
};
