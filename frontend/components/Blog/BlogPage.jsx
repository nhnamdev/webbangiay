

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNews } from '../../services/api';
import './BlogPage.css';

const BlogPage = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            const data = await getNews();
            setArticles(data);
            setLoading(false);
        };
        fetchNews();
    }, []);

    if (loading) {
        return <div className="loading-screen"><div className="spinner"></div></div>;
    }

    return (
        <div className="main-blog section-container">
            {/* Breadcrumb */}
            <nav className="breadcrumb" aria-label="breadcrumbs">
                <Link to="/" title="Trang chủ">Trang chủ</Link>
                <span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.5 7L14.5 12L9.5 17" stroke="black" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </span>
                <span className="current-page">Bài viết</span>
            </nav>

            <div className="section-head-top">
                <h1 className="section-head">Bài viết</h1>
            </div>

            <div className="blogtag">
                <div className="tabs-collapse">
                    <span className="tab-button active">Tất cả</span>
                </div>

                <div className="tab-content">
                    <div className="blog-articles">
                        {articles.map((article) => (
                            <article key={article.id} className="article-card" data-aos="fade-up">
                                <div className="article-card__image-wrapper">
                                    <div className="article-card__image">
                                        <Link to={`/blogs/news/${article.id}`}>
                                            <img
                                                src={article.image}
                                                alt={article.title}
                                                loading="lazy"
                                            />
                                        </Link>
                                    </div>
                                </div>
                                <div className="card__content">
                                    <h3 className="card__heading">
                                        <Link to={`/blogs/news/${article.id}`}>
                                            {article.title}
                                        </Link>
                                    </h3>
                                    <p className="article-card__excerpt">
                                        {article.excerpt}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                {/* Pagination (Static for visual matching) */}
                <div className="pagination-wrapper">
                    <nav className="pagination" role="navigation" aria-label="Phân trang">
                        <ul className="pagination__list list-unstyled">
                            <li>
                                <span className="pagination__item pagination__item--current">1</span>
                            </li>
                            <li>
                                <a href="#" className="pagination__item">2</a>
                            </li>
                            <li className="last">
                                <a href="#" className="pagination__item pagination__item--next">
                                    <svg width="6" height="12" viewBox="0 0 6 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0.5 1L5.5 6L0.5 11" stroke="black" strokeLinecap="round" strokeLinejoin="round"></path>
                                    </svg>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default BlogPage;

// chinh lai phan trang blog
