// src/pages/ExpensesPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ExpensesPage = () => {
    const [expenses, setExpenses] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchExpenses();
    }, [navigate]);

    const fetchExpenses = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('/api/expenses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExpenses(data);
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/expenses', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData({ title: '', amount: '', category: '' });
            fetchExpenses();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add expense');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Expenses</h2>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Logout
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        value={formData.title}
                        onChange={handleChange}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        type="number"
                        name="amount"
                        placeholder="Amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        type="text"
                        name="category"
                        placeholder="Category"
                        value={formData.category}
                        onChange={handleChange}
                        className="p-2 border rounded"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Add Expense
                    </button>
                </div>
            </form>

            <div className="space-y-4">
                {expenses.map((expense) => (
                    <div
                        key={expense._id}
                        className="p-4 border rounded shadow-sm"
                    >
                        <h3 className="font-bold">{expense.title}</h3>
                        <p>${expense.amount}</p>
                        <p className="text-gray-600">{expense.category}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpensesPage;