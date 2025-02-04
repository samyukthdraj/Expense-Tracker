// frontend/src/pages/ExpensesPage.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css';
import ExpensesDashboard from '../components/ExpensesDashboard.js';

const ExpensesPage = () => {
    const [expenses, setExpenses] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: '',
        reason: '',
        date: new Date()
    });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [categoryFilter, setCategoryFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState(new Date().getMonth());
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [totalMonthlyExpense, setTotalMonthlyExpense] = useState(0);
    const [yearlyExpense, setYearlyExpense] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingExpense, setEditingExpense] = useState(null);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 10;
    const navigate = useNavigate();
    const [currencySymbol, setCurrencySymbol] = useState('₹');
    const currencyOptions = [
        { symbol: '₹', label: 'INR (₹)' },
        { symbol: '$', label: 'USD ($)' },
        { symbol: 'AUD', label: 'Australian Dollars (AUD)' },
        { symbol: 'AED', label: 'Dirhams (AED)' }
    ];

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchExpenses();
    }, [navigate]);

    useEffect(() => {
        filterExpensesByMonth();
    }, [expenses, monthFilter]);

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


    const filterExpensesByMonth = () => {
        const filteredExpenses = expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === monthFilter;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        setFilteredExpenses(filteredExpenses);
        setCurrentPage(1);

        const total = filteredExpenses.reduce((acc, expense) => acc + expense.amount, 0);
        setTotalMonthlyExpense(total);

        const yearlyTotal = expenses.reduce((acc, expense) => acc + expense.amount, 0);
        setYearlyExpense(yearlyTotal);
    };

    const handleDateSelect = (date) => {
        const newDate = new Date(date);
        newDate.setHours(12, 0, 0, 0);
        setSelectedDate(newDate);
        setFormData(prev => ({
            ...prev,
            date: newDate
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'date') {
            const newDate = new Date(value);
            newDate.setHours(12, 0, 0, 0);
            setSelectedDate(newDate);
            setFormData(prev => ({
                ...prev,
                date: newDate
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleDelete = async (expenseId) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/expenses/${expenseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchExpenses();
            } catch (error) {
                alert('Failed to delete expense');
            }
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setFormData({
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            reason: expense.reason || '',
            date: new Date(expense.date)
        });
        setSelectedDate(new Date(expense.date));
        setCategoryFilter(expense.category === 'Breakfast' || expense.category === 'Lunch' || expense.category === 'Dinner' ? 'Food' : expense.category);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const expenseData = {
                ...formData,
                category: categoryFilter === 'Food' ? formData.category : categoryFilter || 'Miscellaneous'
            };
            
            if (editingExpense) {
                await axios.put(`/api/expenses/${editingExpense._id}`, expenseData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEditingExpense(null);
            } else {
                await axios.post('/api/expenses', expenseData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            setFormData({ title: '', amount: '', category: '', reason: '', date: selectedDate });
            fetchExpenses();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save expense');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const renderHoverContent = (date) => {
    const dayExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getDate() === date.getDate() &&
               expenseDate.getMonth() === date.getMonth() &&
               expenseDate.getFullYear() === date.getFullYear();
    });

    if (!dayExpenses.length) return '';
    
    const meals = ['Breakfast', 'Lunch', 'Dinner'];
    let content = [];
    
    meals.forEach(meal => {
        const mealExpenses = dayExpenses.filter(e => e.category === meal);
        if (mealExpenses.length > 0) {
            content.push(`${meal}:`);
            mealExpenses.forEach(exp => {
                content.push(`  ${exp.title}: Rs ${exp.amount}`);
                if (exp.reason) {
                    content.push(`  Reason: ${exp.reason}`);
                }
            });
            content.push('');
        }
    });
    
    const otherExpenses = dayExpenses.filter(e => !meals.includes(e.category));
    if (otherExpenses.length > 0) {
        content.push('Other Expenses:');
        otherExpenses.forEach(exp => {
            content.push(`  ${exp.title} (${exp.category}): Rs ${exp.amount}`);
            if (exp.reason) {
                content.push(`  Reason: ${exp.reason}`);
            }
        });
    }
    
    const totalAmount = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    content.push('');
    content.push(`Total: Rs ${totalAmount}`);
    
    return content.join('\n');
};

    const pageCount = Math.ceil(filteredExpenses.length / itemsPerPage);
    const paginatedExpenses = filteredExpenses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getMonthName = (monthIndex) => {
        return new Date(0, monthIndex).toLocaleString('default', { month: 'long' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600">
            <div className="container mx-auto p-6">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-bold text-gray-800">My Expenses</h2>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3zm7 4a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1z" clipRule="evenodd"/>
                            </svg>
                            Logout
                        </button>
                    </div>
                    


                    {/* Summary Cards */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-blue-50 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-blue-800">Monthly Expenses</h3>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{currencySymbol} {totalMonthlyExpense.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-blue-800">Yearly Expenses</h3>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{currencySymbol} {yearlyExpense.toLocaleString()}</p>
                    </div>
                </div>
            </div> 

                {/* Add the dashboard component here */}
                <ExpensesDashboard 
                    expenses={expenses} 
                    currencySymbol={currencySymbol}
                    onCurrencyChange={setCurrencySymbol}
                    currencyOptions={currencyOptions}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Calendar and Filters */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="month-filter">
                                Filter by Month
                            </label>
                            <select
                                id="month-filter"
                                value={monthFilter}
                                onChange={(e) => setMonthFilter(parseInt(e.target.value))}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            >
                                {[...Array(12)].map((_, i) => (
                                    <option key={i} value={i}>
                                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* <Calendar
                            onChange={handleDateSelect}
                            value={selectedDate}
                            className="w-full rounded-lg shadow-sm"
                            tileClassName={({ date }) => {
                                const dayExpenses = expenses.filter(e => {
                                    const expenseDate = new Date(e.date);
                                    return expenseDate.getDate() === date.getDate() &&
                                        expenseDate.getMonth() === date.getMonth() &&
                                        expenseDate.getFullYear() === date.getFullYear();
                                });
                                return dayExpenses.length > 0 ? 'expense-logged' : '';
                            }}

                            
                            // tileContent={({ date }) => {
                            //     const dayExpenses = expenses.filter(e => {
                            //         const expenseDate = new Date(e.date);
                            //         return expenseDate.getDate() === date.getDate() &&
                            //             expenseDate.getMonth() === date.getMonth() &&
                            //             expenseDate.getFullYear() === date.getFullYear();
                            //     });

                            //     if (dayExpenses.length > 0) {
                            //         console.log(dayExpenses, 'dayExpenses')
                            //         const hasBreakfast = dayExpenses.some(e => e.category === 'Breakfast');
                            //         const breakFastAmount = dayExpenses.find(e => e.category === "Breakfast")?.amount ?? 0;
                            //         const hasLunch = dayExpenses.some(e => e.category === 'Lunch');
                            //         const lunchAmount = dayExpenses.find(e => e.category === "Lunch")?.amount ?? 0;
                            //         const hasDinner = dayExpenses.some(e => e.category === 'Dinner');
                            //         const dinnerAmount = dayExpenses.find(e => e.category === "Dinner")?.amount ?? 0;

                            //         return (
                            //             <>
                            //                 <div className="expense-tooltip">
                            //                     {renderHoverContent(date)}
                            //                 </div>
                            //                 <div className="meal-dots">
                            //                     <div title={breakFastAmount} className={`meal-dot ${hasBreakfast ? 'active' : ''}`} />
                            //                     <div title={lunchAmount} className={`meal-dot ${hasLunch ? 'active' : ''}`} />
                            //                     <div title={dinnerAmount} className={`meal-dot ${hasDinner ? 'active' : ''}`} />
                            //                 </div>
                            //             </>
                            //         );
                            //     }
                            //     return null;
                            // }}


                            tileContent={({ date }) => {
                                const dayExpenses = expenses.filter(e => {
                                    const expenseDate = new Date(e.date);
                                    return expenseDate.getDate() === date.getDate() &&
                                        expenseDate.getMonth() === date.getMonth() &&
                                        expenseDate.getFullYear() === date.getFullYear();
                                });
                            
                                if (dayExpenses.length > 0) {
                                    const totalAmount = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                                    const hasBreakfast = dayExpenses.some(e => e.category === 'Breakfast');
                                    const hasLunch = dayExpenses.some(e => e.category === 'Lunch');
                                    const hasDinner = dayExpenses.some(e => e.category === 'Dinner');
                            
                                    return (
                                        <div className="relative group">
                                            <div className="meal-dots">
                                                <div className={`meal-dot ${hasBreakfast ? 'active' : ''}`} />
                                                <div className={`meal-dot ${hasLunch ? 'active' : ''}`} />
                                                <div className={`meal-dot ${hasDinner ? 'active' : ''}`} />
                                            </div>
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs invisible group-hover:visible whitespace-nowrap">
                                                Total: {currencySymbol}{totalAmount.toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        /> */}

                        {/* <Calendar
                            onChange={handleDateSelect}
                            value={selectedDate}
                            className="w-full rounded-lg shadow-sm"
                            tileClassName={({ date }) => {
                                const dayExpenses = expenses.filter(e => {
                                    const expenseDate = new Date(e.date);
                                    return expenseDate.getDate() === date.getDate() &&
                                        expenseDate.getMonth() === date.getMonth() &&
                                        expenseDate.getFullYear() === date.getFullYear();
                                });
                                return dayExpenses.length > 0 ? 'expense-logged' : '';
                            }}
                            tileContent={({ date }) => {
                                const dayExpenses = expenses.filter(e => {
                                    const expenseDate = new Date(e.date);
                                    return expenseDate.getDate() === date.getDate() &&
                                        expenseDate.getMonth() === date.getMonth() &&
                                        expenseDate.getFullYear() === date.getFullYear();
                                });

                                if (dayExpenses.length > 0) {
                                    const hasBreakfast = dayExpenses.some(e => e.category === 'Breakfast');
                                    const breakFastAmount = dayExpenses.reduce((sum, exp) => (exp.category === "Breakfast" ? sum + exp.amount : sum), 0); //Fix: Use reduce for amount.
                                    const hasLunch = dayExpenses.some(e => e.category === 'Lunch');
                                    const lunchAmount = dayExpenses.reduce((sum, exp) => (exp.category === "Lunch" ? sum + exp.amount : sum), 0); //Fix: Use reduce for amount.
                                    const hasDinner = dayExpenses.some(e => e.category === 'Dinner');
                                    const dinnerAmount = dayExpenses.reduce((sum, exp) => (exp.category === "Dinner" ? sum + exp.amount : sum), 0); //Fix: Use reduce for amount.

                                    const totalAmount = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0); // Extract total amount calculation

                                    return (
                                        <div className="relative group">
                                            <div className="meal-dots">
                                                <div className={`meal-dot ${hasBreakfast ? 'active' : ''}`} title={`Breakfast: ${currencySymbol}${breakFastAmount.toLocaleString()}`} /> 
                                                <div className={`meal-dot ${hasLunch ? 'active' : ''}`} title={`Lunch: ${currencySymbol}${lunchAmount.toLocaleString()}`} /> 
                                                <div className={`meal-dot ${hasDinner ? 'active' : ''}`} title={`Dinner: ${currencySymbol}${dinnerAmount.toLocaleString()}`} /> 
                                            </div>
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs invisible group-hover:visible whitespace-nowrap">
                                                Total: {currencySymbol}{totalAmount.toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        /> */}

                        <Calendar
                            onChange={handleDateSelect}
                            value={selectedDate}
                            className="w-full rounded-lg shadow-sm"
                            tileClassName={({ date }) => {
                                const today = new Date();
                                const isToday =
                                    date.getDate() === today.getDate() &&
                                    date.getMonth() === today.getMonth() &&
                                    date.getFullYear() === today.getFullYear();

                                const dayExpenses = expenses.filter(e => {
                                    const expenseDate = new Date(e.date);
                                    return expenseDate.getDate() === date.getDate() &&
                                        expenseDate.getMonth() === date.getMonth() &&
                                        expenseDate.getFullYear() === date.getFullYear();
                                });

                                // Determine the class name based on conditions
                                let className = '';
                                if (dayExpenses.length > 0) {
                                    className = 'expense-logged'; // Make the tile green if it has expenses
                                }

                                if (isToday) {
                                    className = 'react-calendar__tile--now'; //Highlight the current day with the existing yellow
                                }

                                return className;
                            }}
                            tileContent={({ date }) => {
                                const dayExpenses = expenses.filter(e => {
                                    const expenseDate = new Date(e.date);
                                    return expenseDate.getDate() === date.getDate() &&
                                        expenseDate.getMonth() === date.getMonth() &&
                                        expenseDate.getFullYear() === date.getFullYear();
                                });

                                if (dayExpenses.length > 0) {
                                    const hasBreakfast = dayExpenses.some(e => e.category === 'Breakfast');
                                    const breakFastAmount = dayExpenses.reduce((sum, exp) => (exp.category === "Breakfast" ? sum + exp.amount : sum), 0);
                                    const hasLunch = dayExpenses.some(e => e.category === 'Lunch');
                                    const lunchAmount = dayExpenses.reduce((sum, exp) => (exp.category === "Lunch" ? sum + exp.amount : sum), 0);
                                    const hasDinner = dayExpenses.some(e => e.category === 'Dinner');
                                    const dinnerAmount = dayExpenses.reduce((sum, exp) => (exp.category === "Dinner" ? sum + exp.amount : sum), 0);

                                    return (
                                        <>
                                            <div className="expense-tooltip">
                                                {renderHoverContent(date)}
                                            </div>
                                            <div className="meal-dots">
                                                <div title={breakFastAmount} className={`meal-dot ${hasBreakfast ? 'active' : ''}`} />
                                                <div title={lunchAmount} className={`meal-dot ${hasLunch ? 'active' : ''}`} />
                                                <div title={dinnerAmount} className={`meal-dot ${hasDinner ? 'active' : ''}`} />
                                            </div>
                                        </>
                                    );
                                }
                                return null;
                            }}
                        />

                     {/* Add a legend section to fill the gap */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-bold text-gray-700 mb-2">Legend</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-sm text-gray-600"> Breakfast, Lunch, Dinner</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-700 rounded-full"></div>
                                <span className="text-sm text-gray-600">Logged Day</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                                <span className="text-sm text-gray-600">Present Day Unlogged</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                <span className="text-sm text-gray-600">No Food Expense Logged</span>
                            </div>
                        </div>
                    </div>
                </div>

                    {/* Right Column - Add/Edit Form */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">
                            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                        </h3>

                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Category
                            </label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            >
                                <option value="">Select Category</option>
                                <option value="Food">Food</option>
                                <option value="Travel">Travel</option>
                                <option value="Shopping">Shopping</option>
                                <option value="Miscellaneous">Miscellaneous</option>
                            </select>
                        </div>

                        {categoryFilter === 'Food' && (
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Meal Type
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                >
                                    <option value="">Select Meal Type</option>
                                    <option value="Breakfast">Breakfast</option>
                                    <option value="Lunch">Lunch</option>
                                    <option value="Dinner">Dinner</option>
                                </select>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Expense title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    placeholder="Enter amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={selectedDate.toISOString().split('T')[0]}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Reason (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="reason"
                                    placeholder="Add a reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                                >
                                    {editingExpense ? 'Update Expense' : 'Add Expense'}
                                </button>
                                {editingExpense && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingExpense(null);
                                            setFormData({
                                                title: '',
                                                amount: '',
                                                category: '',
                                                reason: '',
                                                date: selectedDate
                                            });
                                        }}
                                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Expense List */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                        Expense History - {new Date(0, monthFilter).toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
                    </h3>

                    <div className="space-y-4">
                    {paginatedExpenses.map((expense) => (
                        <div key={expense._id} className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition duration-200">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-semibold text-gray-800">{expense.title}</h4>
                                    <p className="text-2xl font-bold text-blue-600"> {currencySymbol} {expense.amount.toLocaleString()}</p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">{expense.category}</span>
                                        {expense.reason && expense.reason.trim() !== '' && (
                                            <span className="ml-2 text-gray-500">- {expense.reason}</span>
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(expense.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(expense)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition duration-200"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(expense._id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>

                    {/* Pagination */}
                    {pageCount > 1 && (
                        <div className="flex justify-center items-center mt-8 gap-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                            >
                                Previous
                            </button>
                            <span className="text-gray-600">
                                Page {currentPage} of {pageCount}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                                disabled={currentPage === pageCount}
                                className="px-4 py-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {paginatedExpenses.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-lg">No expenses found for this month</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpensesPage;