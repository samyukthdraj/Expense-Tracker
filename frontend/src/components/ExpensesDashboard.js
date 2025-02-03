// frontend/src/components/ExpensesDashboard.js

import React, { useMemo } from 'react';

// Card Components
const Card = ({ children }) => <div className="p-4 border rounded-lg shadow-md bg-white">{children}</div>;
const CardContent = ({ children }) => <div className="p-2">{children}</div>;
const CardHeader = ({ children }) => <div className="p-2 border-b font-bold">{children}</div>;
const CardTitle = ({ children }) => <h2 className="text-lg font-bold">{children}</h2>;

// Main Dashboard Component
const ExpensesDashboard = ({ expenses = [] }) => {
  const monthlyData = useMemo(() => {
    const data = Array(12).fill(0).map((_, i) => ({
      month: new Date(0, i).toLocaleString('default', { month: 'short' }),
      amount: 0,
      count: 0,
    }));

    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthIndex = date.getMonth();
      data[monthIndex].amount += expense.amount;
      data[monthIndex].count += 1;
    });

    return data;
  }, [expenses]);

  const categoryData = useMemo(() => {
    const categories = {};
    expenses.forEach(expense => {
      categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const stats = useMemo(() => {
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avgExpense = totalExpense / Math.max(expenses.length, 1);
    const maxExpense = Math.max(...expenses.map(exp => exp.amount), 0);
    const minExpense = Math.min(...expenses.map(exp => exp.amount), 0);
    return { totalExpense, avgExpense, maxExpense, minExpense };
  }, [expenses]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Expense Analytics</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Average Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(stats.avgExpense).toLocaleString()}</div>
            <p className="text-xs text-gray-500">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Highest Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.maxExpense.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Single transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lowest Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.minExpense.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Single transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryData.length}</div>
            <p className="text-xs text-gray-500">Expense types</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend and Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-14">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expense Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((data, index) => (
                    <tr key={index}>
                      <td>{data.month}</td>
                      <td>{data.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.map((category, index) => (
                    <tr key={index}>
                      <td>{category.name}</td>
                      <td>{category.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpensesDashboard;
