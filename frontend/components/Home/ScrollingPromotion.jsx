import React from 'react';
import './ScrollingPromotion.css';

const ScrollingPromotion = () => {
    // Helper to process text into even/odd spans
    const processText = (text) => {
        return text.split(' ').map((word, index) => (
            <span key={index} className={index % 2 === 0 ? 'even-word' : 'odd-word'}>
                {word}{' '}
            </span>
        ));
    };

    const vietnameseText = "Thật nhiều thương hiệu chỉ với một cửa hàng!";
    const englishText = "All Brands in One Shop!";

    return (
        <section className="scrolling-promotion-section section">
            <div className="scrolling-promotion-container">
                <div className="marquee-wrapper">
                    <div className="marquee marquee_inner-promotion">
                        {/* Repeat content multiple times for seamless scrolling */}
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="marquee_sub-promotion right_left">
                                <div className="text--promotion marquee__inner-promotion marquee-child">
                                    <p className="evenodd_outline">
                                        {processText(vietnameseText)}
                                    </p>
                                </div>
                                <div className="text--promotion marquee__inner-promotion marquee-child">
                                    <p className="evenodd_outline">
                                        {processText(englishText)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ScrollingPromotion;
