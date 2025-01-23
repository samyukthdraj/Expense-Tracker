import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false); // Add loading state
    const [error, setError] = useState(''); // Add error state
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true
        setError(''); // Clear any previous errors

        try {
            const response = await axios.post('/api/users/signup', formData);
            if (response.status === 201) { // Check for successful response
                alert('Signup successful! Please login.');
                navigate('/login'); // Redirect to the login page
            }
        } catch (error) {
            // Handle API errors
            setError(error.response?.data?.message || 'Signup failed. Please try again.');
            console.error('Signup Error:', error); // Log the error for debugging
        } finally {
            setLoading(false); // Set loading to false
        }
    };

    const handleBackClick = () => {
        navigate('/'); // Navigate to HeroPage.js ie localhost:3000
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded shadow">
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
                    <h2 className="text-2xl font-bold text-center">Sign Up</h2>
                    <div className="w-6"></div> {/* Placeholder for alignment */}
                </div>
                {error && ( // Display error message if there's an error
                    <div className="text-red-500 text-center">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300"
                        disabled={loading} // Disable the button when loading
                    >
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                <button
                    onClick={() => navigate('/login')} // Navigate to the login page
                    className="w-full mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition duration-300"
                >
                    Go to Login
                </button>
            </div>
        </div>
    );
};

export default SignupPage;
