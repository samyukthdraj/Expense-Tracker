import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white flex flex-col">
            {/* Navigation Bar */}
            <div className="flex justify-between items-center p-6">
                <h1 className="text-2xl font-bold">Expense Tracker</h1>
                <div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="flex flex-grow justify-center items-center">
                <div className="text-center space-y-6">
                    <h2 className="text-4xl sm:text-6xl font-extrabold tracking-wide">
                        Manage Your Finances Seamlessly
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto">
                        Keep track of your expenses, set budgets, and achieve your financial goals with ease. Join now to get started!
                    </p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300"
                        >
                            Get Started
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300"
                        >
                            Log In
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center p-4 bg-gray-800 text-gray-400">
                © {new Date().getFullYear()} Expense Tracker. All rights reserved.
            </footer>
        </div>
    );
};

export default HeroPage;
