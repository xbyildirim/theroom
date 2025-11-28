import React from 'react';
import { LANGUAGES } from '../constants/languages';

const LanguageTabs = ({ activeLang, setActiveLang }) => {
    return (
        <div className="d-flex gap-2 mb-3 p-2 bg-light rounded shadow-sm overflow-auto">
            {LANGUAGES.map((lang) => (
                <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveLang(lang.code)}
                    className={`btn btn-sm d-flex align-items-center gap-2 rounded-pill px-3 transition-all
                        ${activeLang === lang.code 
                            ? 'btn-primary shadow fw-bold' 
                            : 'btn-outline-secondary border-0'}`}
                >
                    <span style={{ fontSize: '1.2em' }}>{lang.flag}</span>
                    {lang.label}
                </button>
            ))}
        </div>
    );
};

export default LanguageTabs;