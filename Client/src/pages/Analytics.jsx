import { useEffect, useState, useMemo, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DatePicker, Select, Empty } from "antd";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { Download, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { saveAs } from "file-saver";
import Papa from "papaparse";

import Layout from "../components/Layout/Layout";
import api from "../api/axios";
import { formatCurrency } from "../utils/formatCurrency";

const { RangePicker } = DatePicker;

// Distinguishable in both light and dark themes.
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const Analytics = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.post("/transactions/get-transactions", {});
      setTransactions(data);
    } catch {
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const date = dayjs(t.date);
      const inRange =
        !dateRange ||
        dateRange.length !== 2 ||
        (date.isAfter(dateRange[0].startOf("day")) && date.isBefore(dateRange[1].endOf("day")));
      const matchesType = filterType === "all" || t.type === filterType;
      return inRange && matchesType;
    });
  }, [transactions, dateRange, filterType]);

  const { incomeTotal, expenseTotal } = useMemo(() => {
    const sumBy = (type) =>
      filteredTransactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0);
    return { incomeTotal: sumBy("income"), expenseTotal: sumBy("expense") };
  }, [filteredTransactions]);

  // Category breakdown - expenses only, which is what a spending pie should show
  const pieData = useMemo(() => {
    const byCategory = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    return Object.entries(byCategory)
      .map(([name, value], index) => ({ name, value, color: COLORS[index % COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const pieTotal = useMemo(() => pieData.reduce((sum, d) => sum + d.value, 0), [pieData]);

  // Month-by-month income vs expense, keyed by year+month so different years
  // never collapse into the same bucket
  const trendData = useMemo(() => {
    const byMonth = filteredTransactions.reduce((acc, t) => {
      const key = dayjs(t.date).format("YYYY-MM");
      if (!acc[key])
        acc[key] = { key, month: dayjs(t.date).format("MMM YYYY"), income: 0, expense: 0 };
      acc[key][t.type] += t.amount;
      return acc;
    }, {});

    return Object.values(byMonth).sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredTransactions]);

  const exportToCSV = () => {
    if (!filteredTransactions.length) {
      toast.error("No transactions to export");
      return;
    }
    const csv = Papa.unparse(
      filteredTransactions.map((t) => ({
        Date: dayjs(t.date).format("YYYY-MM-DD"),
        Type: t.type,
        Category: t.category,
        Description: t.description,
        Amount: t.amount,
        "Payment Mode": t.paymentMode,
      }))
    );
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "analytics-export.csv");
  };

  const summary = [
    { label: "Total Income", value: incomeTotal, icon: TrendingUp, accent: "text-green-500" },
    { label: "Total Expenses", value: expenseTotal, icon: TrendingDown, accent: "text-red-500" },
    {
      label: "Net Savings",
      value: incomeTotal - expenseTotal,
      icon: Wallet,
      accent: incomeTotal - expenseTotal >= 0 ? "text-green-500" : "text-red-500",
    },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Analytics</h2>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-200"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex flex-wrap items-end gap-6 mb-6">
          <div>
            <h6 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">
              Date Range
            </h6>
            <RangePicker value={dateRange} onChange={setDateRange} />
          </div>
          <div>
            <h6 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Type</h6>
            <Select
              value={filterType}
              onChange={setFilterType}
              className="w-40"
              options={[
                { value: "all", label: "All" },
                { value: "income", label: "Income" },
                { value: "expense", label: "Expense" },
              ]}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {summary.map(({ label, value, icon: Icon, accent }) => (
            <div
              key={label}
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-5 flex items-center gap-4"
            >
              <Icon size={26} className={accent} />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-xl font-semibold text-gray-800 dark:text-white">
                  {formatCurrency(value)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category-wise Pie Chart */}
          <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Spending by Category
            </h3>
            {loading || pieData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center">
                <Empty description={loading ? "Loading..." : "No expense data"} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${formatCurrency(value)}${
                        pieTotal > 0 ? ` (${((value / pieTotal) * 100).toFixed(1)}%)` : ""
                      }`,
                      name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Income vs Expense by month */}
          <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Income vs Expenses
            </h3>
            {loading || trendData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center">
                <Empty description={loading ? "Loading..." : "No data for this period"} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top categories */}
        <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-lg mt-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Top Spending Categories
          </h3>
          {pieData.length === 0 ? (
            <Empty description="No expense data" />
          ) : (
            <ul className="space-y-3">
              {pieData.slice(0, 5).map((entry) => (
                <li key={entry.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-200">{entry.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {formatCurrency(entry.value)} ({((entry.value / pieTotal) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(entry.value / pieTotal) * 100}%`,
                        backgroundColor: entry.color,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
