import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ExpensesPage from './pages/ExpensesPage';
import HeroPage from './pages/HeroPage'; // Import the HeroPage component

const PrivateRoute = ({ element }) => {
    const isAuthenticated = !!localStorage.getItem('token'); // Check if user is authenticated
    return isAuthenticated ? element : <Navigate to="/login" />;
};

const NotFoundPage = () => (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>404</h1>
        <p>Page not found</p>
    </div>
);

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Redirect root path ("/") to HeroPage */}
                <Route path="/" element={<HeroPage />} />

                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Protected Route */}
                <Route path="/expenses" element={<PrivateRoute element={<ExpensesPage />} />} />

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
};

export default App;
