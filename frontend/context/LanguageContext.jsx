

import React, { createContext, useState, useContext } from 'react';
import { translations } from '../data/locales';

// Create Context
const LanguageContext = createContext();

// Provider Component
export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('VI'); // Default language

    // Translation function
    const t = (key) => {
        return translations[language][key] || key; // Fallback to key if not found
    };

    const value = {
        language,
        setLanguage,
        t
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

// Custom Hook for easier usage
export const useLanguage = () => {
    return useContext(LanguageContext);
};
