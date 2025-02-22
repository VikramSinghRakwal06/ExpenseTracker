import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { Modal, Form, Input, Select } from "antd";
import axios from "axios";
import toast from "react-hot-toast";
import Spinner from "../components/Layout/Spinner";
import {
  BarChart,
  TrendingUp,
  DollarSign,
  PlusCircle,
  Moon,
  Sun,
  Briefcase,
  CreditCard,
  Wallet,
  Banknote,
  ShoppingCart,
  Utensils,
  Film,
  HeartPulse,
  GraduationCap,
  Landmark,
} from "lucide-react";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [form] = Form.useForm();
  const calculateTotalBalance = (transactions) => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return totalIncome - totalExpenses;
  };

  const calculateMonthlyIncome = (transactions) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === "income" &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateMonthlyExpenses = (transactions) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === "expense" &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const { data } = await axios.post(
          "/api/transactions/get-transactions",
          { userid: user._id }
        );
        setTransactions(data);
      } catch (error) {
        toast.error("Failed to load transactions");
      }
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  const handleSubmit = async (values) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      setLoading(true);
      await axios.post("/api/transactions/add-transaction", {
        ...values,
        userid: user._id,
      });
      setLoading(false);
      toast.success("Transaction Added Successfully");
      setShowModal(false);
      form.resetFields();
    } catch (error) {
      setLoading(false);
      toast.error("Failed to add transaction");
    }
  };

  return (
    <Layout>
      <div
        className={`transition-all duration-300 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
        } min-h-screen p-6`}
      >
        {loading && <Spinner />}

        {/* Header Section */}
        <div className="flex justify-between items-center shadow-md bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-4 rounded-lg">
          <h2 className="text-lg font-semibold">Expense Overview</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-white text-gray-600 px-3 py-2 rounded-lg shadow-md hover:bg-gray-100 transition-all duration-200"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center bg-white text-green-600 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition-all duration-200"
            >
              <PlusCircle size={20} className="mr-2" /> Add Expense
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="bg-white p-4 shadow-md rounded-lg flex items-center">
            <DollarSign size={24} className="text-green-500 mr-3" />
            <div>
              <h3 className="text-gray-600 text-sm">Total Balance</h3>
              <p className="text-lg font-semibold">
                ₹{calculateTotalBalance(transactions).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 shadow-md rounded-lg flex items-center">
            <TrendingUp size={24} className="text-blue-500 mr-3" />
            <div>
              <h3 className="text-gray-600 text-sm">Monthly Income</h3>
              <p className="text-lg font-semibold">
                ₹{calculateMonthlyIncome(transactions).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 shadow-md rounded-lg flex items-center">
            <BarChart size={24} className="text-red-500 mr-3" />
            <div>
              <h3 className="text-gray-600 text-sm">Monthly Expenses</h3>
              <p className="text-lg font-semibold">
                ₹
                {calculateMonthlyExpenses(transactions).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
        {/* Recent Transactions */}
        <div className="bg-white shadow-md p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-600 mb-4">
            Recent Transactions
          </h3>
          {loading ? (
            <Skeleton count={5} height={40} className="mb-2" />
          ) : (
            <ul>
              {transactions.slice(0, 5).map((t, index) => (
                <li
                  key={index}
                  className="border-b py-2 flex justify-between items-center"
                >
                  <span className="capitalize">
                    {t.category} - {t.description || "No Description"}
                  </span>
                  <span
                    className={
                      t.type === "income" ? "text-green-500" : "text-red-500"
                    }
                  >
                    ${t.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Transaction Modal */}
        <Modal
          title="Add Transaction"
          open={showModal}
          onCancel={() => setShowModal(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Amount"
              name="amount"
              rules={[{ required: true, message: "Please enter an amount" }]}
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              label="Type"
              name="type"
              rules={[{ required: true, message: "Select a transaction type" }]}
            >
              <Select>
                <Select.Option value="income">Income</Select.Option>
                <Select.Option value="expense">Expense</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: "Select a category" }]}
            >
              <Select>
                <Select.Option value="Salary">
                  <div className="flex items-center">
                    <Briefcase size={16} className="mr-2" /> Salary
                  </div>
                </Select.Option>
                <Select.Option value="Bonus">
                  <div className="flex items-center">
                    <Banknote size={16} className="mr-2" /> Bonus
                  </div>
                </Select.Option>
                <Select.Option value="Project">
                  <div className="flex items-center">
                    <Briefcase size={16} className="mr-2" /> Project
                  </div>
                </Select.Option>
                <Select.Option value="Food">
                  <div className="flex items-center">
                    <Utensils size={16} className="mr-2" /> Food
                  </div>
                </Select.Option>
                <Select.Option value="Bills">
                  <div className="flex items-center">
                    <Landmark size={16} className="mr-2" /> Bills
                  </div>
                </Select.Option>
                <Select.Option value="Movie">
                  <div className="flex items-center">
                    <Film size={16} className="mr-2" /> Movie
                  </div>
                </Select.Option>
                <Select.Option value="Medical">
                  <div className="flex items-center">
                    <HeartPulse size={16} className="mr-2" /> Medical
                  </div>
                </Select.Option>
                <Select.Option value="Fee">
                  <div className="flex items-center">
                    <GraduationCap size={16} className="mr-2" /> Fee
                  </div>
                </Select.Option>
                <Select.Option value="Tax">
                  <div className="flex items-center">
                    <Landmark size={16} className="mr-2" /> Tax
                  </div>
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: "Select a date" }]}
            >
              <Input type="date" />
            </Form.Item>

            <Form.Item label="Reference" name="reference">
              <Input type="text" placeholder="Optional reference" />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input type="text" placeholder="Short description (optional)" />
            </Form.Item>

            <Form.Item
              label="Payment Mode"
              name="paymentMode"
              rules={[{ required: true, message: "Select a payment mode" }]}
            >
              <Select>
                <Select.Option value="Cash">
                  <div className="flex items-center">
                    <Wallet size={16} className="mr-2" /> Cash
                  </div>
                </Select.Option>
                <Select.Option value="Card">
                  <div className="flex items-center">
                    <CreditCard size={16} className="mr-2" /> Card
                  </div>
                </Select.Option>
                <Select.Option value="Online">
                  <div className="flex items-center">
                    <ShoppingCart size={16} className="mr-2" /> Online
                  </div>
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Payment Bank" name="paymentBank">
              <Input type="text" placeholder="Enter Bank Name (Optional)" />
            </Form.Item>
            <div className="flex justify-end">
              {" "}
              <button
                type="submit"
                className="bg-green-500 text-white px-5 py-2 rounded-xl shadow-md hover:bg-green-600 transition-all duration-200"
              >
                {" "}
                Save{" "}
              </button>{" "}
            </div>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default HomePage;
