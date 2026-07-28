import { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, Form, Input, Select, DatePicker } from "antd";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import Layout from "../components/Layout/Layout";
import api from "../api/axios";
import { formatCurrency } from "../utils/formatCurrency";
import { CATEGORIES, PAYMENT_MODES } from "../constants/transactionOptions";

const isSameMonth = (date, reference = new Date()) => {
  const d = new Date(date);
  return d.getMonth() === reference.getMonth() && d.getFullYear() === reference.getFullYear();
};

const sumBy = (transactions, predicate) =>
  transactions.filter(predicate).reduce((sum, t) => sum + t.amount, 0);

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [form] = Form.useForm();

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.post("/transactions/get-transactions", {});
      setTransactions(data);
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const stats = useMemo(() => {
    const totalIncome = sumBy(transactions, (t) => t.type === "income");
    const totalExpenses = sumBy(transactions, (t) => t.type === "expense");
    return {
      balance: totalIncome - totalExpenses,
      monthlyIncome: sumBy(transactions, (t) => t.type === "income" && isSameMonth(t.date)),
      monthlyExpenses: sumBy(transactions, (t) => t.type === "expense" && isSameMonth(t.date)),
    };
  }, [transactions]);

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      await api.post("/transactions/add-transaction", {
        ...values,
        amount: Number(values.amount),
        date: values.date.toISOString(),
      });
      toast.success("Transaction added successfully");
      setShowModal(false);
      form.resetFields();
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add transaction");
    } finally {
      setSubmitting(false);
    }
  };

  const summaryCards = [
    {
      label: "Total Balance",
      value: stats.balance,
      icon: Wallet,
      accent: stats.balance >= 0 ? "text-green-500" : "text-red-500",
    },
    { label: "Income This Month", value: stats.monthlyIncome, icon: TrendingUp, accent: "text-green-500" },
    { label: "Expenses This Month", value: stats.monthlyExpenses, icon: TrendingDown, accent: "text-red-500" },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-wrap gap-4 justify-between items-center shadow-md bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-4 rounded-lg">
          <div>
            <h2 className="text-lg font-semibold">Expense Overview</h2>
            <p className="text-sm text-white/80">{dayjs().format("dddd, DD MMMM YYYY")}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-white text-green-600 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition-all duration-200"
          >
            <PlusCircle size={20} className="mr-2" /> Add Transaction
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {summaryCards.map(({ label, value, icon: Icon, accent }) => (
            <div
              key={label}
              className="bg-white dark:bg-gray-800 p-5 shadow-md rounded-lg flex items-center gap-4"
            >
              <Icon size={26} className={accent} />
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">{label}</h3>
                {loading ? (
                  <Skeleton width={110} height={24} />
                ) : (
                  <p className="text-xl font-semibold text-gray-800 dark:text-white">
                    {formatCurrency(value)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Recent Transactions
          </h3>
          {loading ? (
            <Skeleton count={5} height={40} className="mb-2" />
          ) : transactions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-6 text-center">
              No transactions yet. Add your first one to get started.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.slice(0, 5).map((t) => (
                <li key={t._id} className="py-3 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`shrink-0 rounded-full p-1.5 ${
                        t.type === "income"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {t.type === "income" ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <ArrowDownRight size={16} />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-gray-800 dark:text-gray-100 truncate">{t.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t.category} · {dayjs(t.date).format("DD MMM YYYY")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 font-medium ${
                      t.type === "income" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount)}
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
          destroyOnHidden
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Amount"
              name="amount"
              rules={[
                { required: true, message: "Please enter an amount" },
                {
                  validator: (_, value) =>
                    value === undefined || value === "" || Number(value) > 0
                      ? Promise.resolve()
                      : Promise.reject(new Error("Amount must be greater than zero")),
                },
              ]}
            >
              <Input type="number" min="0" step="0.01" prefix="₹" />
            </Form.Item>

            <Form.Item
              label="Type"
              name="type"
              rules={[{ required: true, message: "Select a transaction type" }]}
            >
              <Select
                options={[
                  { value: "income", label: "Income" },
                  { value: "expense", label: "Expense" },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: "Select a category" }]}
            >
              <Select options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
            </Form.Item>

            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: "Select a date" }]}
            >
              <DatePicker className="w-full" format="DD MMM YYYY" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Please enter a description" }]}
            >
              <Input placeholder="e.g. Groceries for the week" />
            </Form.Item>

            <Form.Item
              label="Payment Mode"
              name="paymentMode"
              rules={[{ required: true, message: "Select a payment mode" }]}
            >
              <Select options={PAYMENT_MODES.map((m) => ({ value: m, label: m }))} />
            </Form.Item>

            <Form.Item label="Reference" name="reference">
              <Input placeholder="Optional reference" />
            </Form.Item>

            <Form.Item label="Payment Bank" name="paymentBank">
              <Input placeholder="Optional bank name" />
            </Form.Item>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-500 text-white px-5 py-2 rounded-lg shadow-md hover:bg-green-600 transition-all duration-200 disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default HomePage;
