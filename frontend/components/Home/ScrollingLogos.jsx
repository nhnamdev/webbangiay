import React from 'react';
import './ScrollingLogos.css';

const ScrollingLogos = () => {
    return (
        <div className="scrolling-logos-container">
            <div className="marquee">
                <div className="marquee-content right-left">
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/Swoosh_Black.png?v=1763700293&width=100" alt="Nike" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/Jumpman_Black.png?v=1763700854&width=100" alt="Jordan" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/702280000101.png?v=1763700639&width=100" alt="Adidas" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/nb_0a276f75-97dd-4fff-be3e-d91fc1965463.png?v=1763700798&width=100" alt="New Balance" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/Group_1321317060_1.png?v=1734428916&width=100" alt="Puma" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/Group_1_3eea6295-99ac-4583-960a-842468852122.png?v=1734428959&width=100" alt="Vans" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/Converse-Logotipo-2017-Presente.png?v=1733414342&width=100" alt="Converse" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/crocs-uae-logo-png_seeklogo-443833.png?v=1763705918&width=100" alt="Crocs" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/Layer_1_9fd6a1c0-cbf8-4c27-8922-e197f74e2e0a.png?v=1734428939&width=100" alt="Fila" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/Group.png?v=1734428981&width=100" alt="Asics" /></div>
                </div>
                {/* Duplicate for seamless scrolling */}
                <div className="marquee-content right-left">
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/Swoosh_Black.png?v=1763700293&width=100" alt="Nike" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/Jumpman_Black.png?v=1763700854&width=100" alt="Jordan" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/702280000101.png?v=1763700639&width=100" alt="Adidas" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/nb_0a276f75-97dd-4fff-be3e-d91fc1965463.png?v=1763700798&width=100" alt="New Balance" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/Group_1321317060_1.png?v=1734428916&width=100" alt="Puma" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/Group_1_3eea6295-99ac-4583-960a-842468852122.png?v=1734428959&width=100" alt="Vans" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/Converse-Logotipo-2017-Presente.png?v=1733414342&width=100" alt="Converse" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/crocs-uae-logo-png_seeklogo-443833.png?v=1763705918&width=100" alt="Crocs" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/Layer_1_9fd6a1c0-cbf8-4c27-8922-e197f74e2e0a.png?v=1734428939&width=100" alt="Fila" /></div>
                    <div className="marquee-item"><img src="//abc-mart.com.vn/cdn/shop/files/Group.png?v=1734428981&width=100" alt="Asics" /></div>
                </div>
            </div>
        </div>
    );
};

export default ScrollingLogos;
