import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import express from 'express';
import path from 'path';
import userRoutes from './routes/userRoutes';
import expenseRoutes from './routes/expenseRoutes';
import dotenv from 'dotenv';
import connectDB from './config/db';


dotenv.config();
connectDB();

const server = express();
server.use(express.json());
server.use('/api/users', userRoutes);
server.use('/api/expenses', expenseRoutes);


server.use(express.static(path.join(__dirname, '../build')));
server.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();