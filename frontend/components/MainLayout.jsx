import React from 'react';
import Navbar from './Navbar/Navbar';
import CategoryBar from './CategoryBar/CategoryBar';
import Footer from './Footer/Footer';

const MainLayout = ({ children }) => {
    return (
        <>
            <Navbar />
            <CategoryBar />
            {children}
            <Footer />
        </>
    );
};

export default MainLayout;
