

import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';
import { useAuth } from '../../context/AuthContext';
import { sendMessageToBot } from '../../services/aiService';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Flatten all questions for the single view
    const qaGroups = [
        {
            id: 'product',
            questions: [
                { q: "Tôi có thể check size sản phẩm của mình ở đâu?", a: "Bạn có thể xem \"Bảng quy đổi kích cỡ\" (Size Chart) nằm ngay bên cạnh phần chọn size trong trang chi tiết của từng đôi giày. Chúng tôi cung cấp đầy đủ thông số theo chuẩn US, UK, và CM (chiều dài chân) để bạn dễ dàng lựa chọn." },
                { q: "Các sản phẩm có phải chính hãng / nguyên bản không?", a: "Chúng tôi cam kết 100% sản phẩm bán ra là hàng chính hãng (Authentic). Mỗi đôi giày đều đi kèm phụ kiện, hộp và tem mác đầy đủ từ nhà sản xuất. Chúng tôi sẵn sàng hoàn tiền và bồi thường nếu phát hiện hàng giả." }
            ]
        },
        {
            id: 'order',
            questions: [
                { q: "Theo dõi đơn hàng của tôi", a: "Bạn có thể theo dõi đơn hàng bằng 2 cách:\n1. Đăng nhập vào tài khoản, chọn mục \"Lịch sử đơn hàng\" để xem trạng thái cập nhật.\n2. Kiểm tra email xác nhận đơn hàng, chúng tôi có gửi kèm mã vận đơn và link theo dõi vị trí gói hàng theo thời gian thực." },
                { q: "Thời gian giao hàng bao lâu?", a: "Thời gian giao hàng dự kiến phụ thuộc vào địa chỉ của bạn:\n- Nội thành (TP.HCM/Hà Nội): 1 - 2 ngày làm việc.\n- Các tỉnh thành khác: 3 - 5 ngày làm việc.\n(Lưu ý: Thời gian có thể thay đổi vào các dịp lễ tết hoặc sự kiện khuyến mãi lớn)." },
                { q: "Có thể thay đổi địa chỉ sau khi đặt hàng?", a: "Bạn có thể thay đổi nếu đơn hàng đang ở trạng thái \"Đang xử lý\". Vui lòng liên hệ ngay qua Hotline hoặc Fanpage để nhân viên hỗ trợ kịp thời. Nếu đơn hàng đã chuyển sang trạng thái \"Đang giao\", chúng tôi sẽ cố gắng liên hệ đơn vị vận chuyển nhưng không đảm bảo 100% sẽ thay đổi được." }
            ]
        },
        {
            id: 'payment',
            questions: [
                { q: "Có những hình thức thanh toán nào trên trang ?", a: "Chúng tôi hỗ trợ đa dạng các phương thức thanh toán:\n- Thanh toán khi nhận hàng (COD).\n- Chuyển khoản ngân hàng (QR Code).\n- Ví điện tử (Momo, ZaloPay)." },
                { q: "Khi sản phẩm tới tay bị hư hỏng thì như thế nào?", a: "Nếu hộp giày bị móp méo nghiêm trọng hoặc sản phẩm bên trong bị lỗi/hư hỏng do vận chuyển, bạn vui lòng quay video lúc mở hộp và liên hệ ngay với chúng tôi. Shop sẽ gửi đổi sản phẩm mới ngay lập tức và chịu hoàn toàn phí vận chuyển 2 chiều." },
                { q: "Tôi có thể đổi lại các sản phẩm tôi đã mua không?", a: "Chúng tôi hỗ trợ đổi size hoặc đổi mẫu trong vòng 07 ngày kể từ khi nhận hàng.\nĐiều kiện: Giày chưa qua sử dụng, đế chưa bị bẩn/mòn, còn nguyên tem mác và hộp.\nVui lòng liên hệ CSKH để được hướng dẫn quy trình đổi hàng." }
            ]
        }
    ];

    const allQuestions = qaGroups.flatMap(g => g.questions);

    const { user } = useAuth();

    // Initialize/Reset chat with welcome message and all options
    useEffect(() => {
        setMessages([
            {
                type: 'bot',
                text: 'Chào mừng bạn đến với HKT-SHOES. Chúng tôi có thể giúp gì cho bạn?',
                options: allQuestions.map(q => ({ label: q.q, value: q }))
            }
        ]);
    }, [user]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleQuestionClick = async (qObj) => {
        const newMessages = [...messages, { type: 'user', text: qObj.q }];
        setMessages(newMessages);
        setIsTyping(true);

        const aiResponse = await sendMessageToBot(qObj.q);
        setMessages(prev => [...prev, { type: 'bot', text: aiResponse }]);
        setIsTyping(false);
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userText = inputValue;
        setMessages(prev => [...prev, { type: 'user', text: userText }]);
        setInputValue("");
        setIsTyping(true);

        const aiResponse = await sendMessageToBot(userText);
        setMessages(prev => [...prev, { type: 'bot', text: aiResponse }]);
        setIsTyping(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="chatbot-container">
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="header-title">
                            <h3>HKT-SHOES</h3>
                            <p style={{ fontSize: '11px', opacity: 0.8 }}>Thường trả lời trong vài phút</p>
                        </div>
                    </div>

                    <div className="chatbot-body">
                        <div className="message-list">
                            {messages.map((msg, index) => (
                                <div key={index} className={`message-item ${msg.type}`}>
                                    {msg.type === 'user' ? (
                                        <div className="msg-bubble">{msg.text}</div>
                                    ) : (
                                        <div className="bot-container">
                                            <div className="bot-text-content">
                                                <ReactMarkdown
                                                    components={{
                                                        a: ({ node, ...props }) => (
                                                            <a
                                                                {...props}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    const href = props.href;
                                                                    if (href && href.startsWith('/')) {
                                                                        navigate(href);
                                                                    } else {
                                                                        window.open(href, '_blank');
                                                                    }
                                                                }}
                                                            />
                                                        )
                                                    }}
                                                >
                                                    {msg.text}
                                                </ReactMarkdown>
                                            </div>

                                            {msg.options && (
                                                <div className="bot-options-container">
                                                    <div className="bot-options-header">Bạn có thể muốn hỏi:</div>
                                                    <div className="bot-options-list">
                                                        {msg.options.map((opt, idx) => (
                                                            <button
                                                                key={idx}
                                                                className="bot-option-btn"
                                                                onClick={() => handleQuestionClick(opt.value)}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="bot-footer">
                                                Được gửi bởi Trợ lý Chat AI • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isTyping && <div className="typing-indicator">Admin đang nhập...</div>}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="input-area" style={{ margin: '15px', marginTop: '0' }}>
                        <input
                            type="text"
                            placeholder="Viết tin nhắn..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="send-btn" onClick={handleSend}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="#AAA" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
            <div className="chatbot-toggle" onClick={toggleChat}>
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="white" />
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM6 9H18V11H6V9ZM14 14H6V12H14V14ZM18 8H6V6H18V8Z" fill="white" />
                    </svg>
                )}
            </div>
        </div>
    );
};


export default ChatBot;
