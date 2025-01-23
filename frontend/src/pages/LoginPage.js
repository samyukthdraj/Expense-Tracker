import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/users/login', formData);
            localStorage.setItem('token', response.data.token);
            navigate('/expenses'); // Navigate to expenses page on successful login
        } catch (error) {
            alert(error.response?.data?.message || 'Login failed');
        }
    };

    const handleSignupClick = () => {
        navigate('/signup'); // Navigate to the signup page
    };

    const handleBackClick = () => {
        navigate('/'); // Navigate to the HeroPage.js ie localhost:3000/
    };

    return (
        <div className="min-h-screen flex items-center justify-center"> 
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-2xl">
                <div className="flex justify-between items-center">
                    <button
                        onClick={handleBackClick} // Call handleBackClick on click
                        className="text-gray-600 hover:text-gray-800 transition duration-300"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                    </button>
                    <h2 className="text-3xl font-bold text-center text-gray-800">Login</h2>
                    <div className="w-6"></div> {/* Placeholder for alignment */}
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        Login
                    </button>
                </form>
                <button
                    onClick={handleSignupClick} // Call handleSignupClick on click
                    className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition duration-300"
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
