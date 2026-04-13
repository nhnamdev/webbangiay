import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './BannerCarousel.css';

const BannerCarousel = () => {
    const slides = [
        {
            id: 7,
            type: 'vimeo',
            video: "https://player.vimeo.com/video/1103618921?badge=0&autopause=0&player_id=0&app_id=58479&background=1&autoplay=1&loop=1&muted=1",
            link: "/collections/new-arrivals"
        },
        {
            id: 6,
            type: 'vimeo',
            video: "https://player.vimeo.com/video/988262463?badge=0&autopause=0&player_id=0&app_id=58479&background=1&autoplay=1&loop=1&muted=1",
            link: "/collections/new-arrivals"
        },
        {
            id: 1,
            type: 'image',
            image: "//abc-mart.com.vn/cdn/shop/files/12.12_EC.jpg?v=1765419048&width=1500",
            link: "/collections/sale"
        },
        {
            id: 2,
            type: 'image',
            image: "//abc-mart.com.vn/cdn/shop/files/H-STREET_HERO_BANNER.jpg?v=1765601397&width=1500",
            link: "/collections/puma"
        },
        {
            id: 3,
            type: 'video',
            video: "https://cdn.shopify.com/videos/c/o/v/e1e9724ec2394438b247ba27ee517065.mp4",
            link: "/collections/fila"
        },
        {
            id: 4,
            type: 'image',
            image: "//abc-mart.com.vn/cdn/shop/files/BANNER_SPEEDCAT_SMU.png?v=1763630030&width=1500",
            link: "/collections/puma-speedcat"
        },
        {
            id: 5,
            type: 'image',
            image: "//abc-mart.com.vn/cdn/shop/files/asics_life_walker.jpg?v=1765421454&width=1500",
            link: "/collections/asics"
        }
    ];

    return (
        <div className="banner-carousel-container">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={24}
                slidesPerView={'auto'}
                centeredSlides={true}
                loop={true}
                autoplay={{ delay: 10000, disableOnInteraction: false }}
                navigation={{
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom',
                }}
                pagination={{ clickable: true }}
                className="banner-swiper"
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id} className="custom-swiper-slide">
                        <a href={slide.link} className="banner-slide-link">
                            {slide.type === 'video' ? (
                                <video playsInline autoPlay muted loop className="banner-media">
                                    <source src={slide.video} type="video/mp4" />
                                </video>
                            ) : slide.type === 'vimeo' ? (
                                <div className="banner-media video-iframe-wrapper">
                                    {/*  */}
                                    <video className="video-placeholder" autoPlay loop muted playsInline>
                                        <source src="/HKTShoes.mp4" type="video/mp4" />
                                    </video>
                                    <iframe
                                        src={slide.video}
                                        frameBorder="0"
                                        allow="autoplay; fullscreen; picture-in-picture"
                                        allowFullScreen
                                        title="vimeo-banner"
                                        style={{ width: '100%', height: '100%', pointerEvents: 'none', position: 'relative', zIndex: 2 }}
                                    ></iframe>
                                </div>
                            ) : (
                                <img src={slide.image} alt="Banner" className="banner-media" />
                            )}
                        </a>
                    </SwiperSlide>
                ))}

                {/*  */}
                <div className="swiper-button-prev-custom">
                    <svg width="40" height="80" viewBox="0 0 40 80" className="nav-curve">
                        <path
                            d="M0 80C0 68.9543 8.95435 60 20 60C31.0457 60 40 51.0457 40 40C40 28.9543 31.0457 20 20 20C8.95435 20 0 11.0457 0 0V80Z"
                            fill="white"
                        ></path>
                    </svg>
                    <div className="nav-arrow-circle">
                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                            <path
                                d="M18.6667 10.6667L13.3334 16.0001L18.6667 21.3334"
                                stroke="black"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            ></path>
                        </svg>
                    </div>
                </div>
                <div className="swiper-button-next-custom">
                    <div className="nav-arrow-circle">
                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                            <path
                                d="M13.3333 10.6667L18.6666 16.0001L13.3333 21.3334"
                                stroke="black"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            ></path>
                        </svg>
                    </div>
                    <svg width="40" height="80" viewBox="0 0 40 80" className="nav-curve">
                        <path
                            d="M40 80C40 68.9543 31.0457 60 20 60C8.95435 60 0 51.0457 0 40C0 28.9543 8.95435 20 20 20C31.0457 20 40 11.0457 40 0V80Z"
                            fill="white"
                        ></path>
                    </svg>
                </div>
            </Swiper>
        </div>
    );
};

export default BannerCarousel;