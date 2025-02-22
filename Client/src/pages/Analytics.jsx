import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import Layout from "../components/Layout/Layout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { saveAs } from "file-saver";
import Papa from "papaparse";

const Analytics = () => {
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0"];

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const { data } = await axios.post("/api/transactions/get-transactions", { userid: user._id });
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };
    fetchTransactions();
  }, []);

  // Filter transactions based on date and type
  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    const isInDateRange = (!startDate || transactionDate >= startDate) && (!endDate || transactionDate <= endDate);
    const isMatchingType = filterType === "all" || t.type === filterType;
    return isInDateRange && isMatchingType;
  });

  // Calculate income and expense totals
  const incomeTotal = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expenseTotal = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  // Group transactions by category
  const categoryData = filteredTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const pieData = Object.keys(categoryData).map((key, index) => ({
    name: key,
    value: categoryData[key],
    color: COLORS[index % COLORS.length],
  }));

  // Prepare monthly trend data
  const trendData = filteredTransactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString("default", { month: "short" });
    acc[month] = (acc[month] || 0) + t.amount;
    return acc;
  }, {});

  const lineData = Object.keys(trendData).map((key) => ({ month: key, amount: trendData[key] }));

  // Export transactions as CSV
  const exportToCSV = () => {
    const csv = Papa.unparse(filteredTransactions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "transactions.csv");
  };

  return (
    <Layout>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">📊 Analytics</h2>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} placeholderText="Start Date" />
          <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} placeholderText="End Date" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Income & Expenses */}
          <div className="bg-white shadow-md p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-600">💰 Financial Overview</h3>
            <p className="mt-2 text-green-500">Total Income: ${incomeTotal}</p>
            <p className="mt-1 text-red-500">Total Expenses: ${expenseTotal}</p>
          </div>

          {/* Category-wise Pie Chart */}
          <div className="bg-white shadow-md p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-600">🛍 Category-wise Spending</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} (${((value / expenseTotal) * 100).toFixed(1)}%)`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trends Line Chart */}
          <div className="bg-white shadow-md p-6 rounded-lg col-span-2">
            <h3 className="text-lg font-semibold text-gray-600">📈 Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CSV Export Button */}
        <button onClick={exportToCSV} className="mt-4 bg-blue-500 text-white p-2 rounded">📥 Download CSV</button>
      </div>
    </Layout>
  );
};

export default Analytics;
