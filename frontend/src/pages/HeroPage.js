import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 text-white flex flex-col">
            <div className="flex justify-between items-center p-6">
                <h1 className="text-2xl font-bold">Expense Tracker</h1>
            </div>

            <div className="flex flex-grow justify-center items-center">
                <div className="text-center space-y-8">
                    <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
                        Manage Your Finances
                        <span className="block mt-2">With Ease</span>
                    </h2>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Keep track of your expenses, set budgets, and achieve your financial goals effortlessly.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-50 transition duration-300"
                        >
                            Get Started
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-blue-400 bg-opacity-20 text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-30 transition duration-300 backdrop-blur-sm"
                        >
                            Log In
                        </button>
                    </div>
                </div>
            </div>

            <footer className="text-center p-4 text-blue-100 bg-blue-600/20 backdrop-blur-sm">
                © {new Date().getFullYear()} Expense Tracker. All rights reserved.
            </footer>
        </div>
    );
};

export default HeroPage;
