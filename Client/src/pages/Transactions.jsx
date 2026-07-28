import { useState, useEffect, useCallback, useMemo } from "react";
import { Select, Table, DatePicker, Modal, Empty, Form, Input, Tag } from "antd";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { Pencil, Trash2, Download } from "lucide-react";
import Papa from "papaparse";
import { saveAs } from "file-saver";

import Layout from "../components/Layout/Layout";
import api from "../api/axios";
import { formatCurrency } from "../utils/formatCurrency";
import { CATEGORIES, PAYMENT_MODES } from "../constants/transactionOptions";

const { RangePicker } = DatePicker;

const FREQUENCY_OPTIONS = [
  { value: "7", label: "Last 1 Week" },
  { value: "30", label: "Last 1 Month" },
  { value: "365", label: "Last 1 Year" },
  { value: "custom", label: "Custom Range" },
];

const Transactions = () => {
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState([]);
  const [frequency, setFrequency] = useState("30");
  const [selectedDate, setSelectedDate] = useState([dayjs().subtract(30, "days"), dayjs()]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [form] = Form.useForm();

  const getAllTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.post("/transactions/get-transactions", {
        frequency,
        selectedDate:
          frequency === "custom" && selectedDate?.length === 2
            ? [selectedDate[0].toISOString(), selectedDate[1].toISOString()]
            : [],
        type,
      });
      setAllTransactions(data || []);
    } catch {
      toast.error("Unable to get transactions");
      setAllTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [frequency, selectedDate, type]);

  useEffect(() => {
    getAllTransactions();
  }, [getAllTransactions]);

  const totals = useMemo(() => {
    const income = allTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = allTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [allTransactions]);

  const handleDelete = async () => {
    try {
      await api.delete(`/transactions/delete-transaction/${deleteId}`);
      toast.success("Transaction deleted successfully");
      setAllTransactions((prev) => prev.filter((item) => item._id !== deleteId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete transaction");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const handleEdit = (record) => {
    setEditData(record);
    form.setFieldsValue({ ...record, date: dayjs(record.date) });
  };

  const handleUpdate = async (values) => {
    try {
      await api.put(`/transactions/update-transaction/${editData._id}`, {
        ...values,
        amount: Number(values.amount),
        date: values.date.toISOString(),
      });
      toast.success("Transaction updated successfully");
      setEditData(null);
      getAllTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update transaction");
    }
  };

  const exportToCSV = () => {
    if (!allTransactions.length) {
      toast.error("No transactions to export");
      return;
    }
    const csv = Papa.unparse(
      allTransactions.map((t) => ({
        Date: dayjs(t.date).format("YYYY-MM-DD"),
        Type: t.type,
        Category: t.category,
        Description: t.description,
        Amount: t.amount,
        "Payment Mode": t.paymentMode,
        "Payment Bank": t.paymentBank || "",
        Reference: t.reference || "",
      }))
    );
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "transactions.csv");
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      render: (date) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Type",
      dataIndex: "type",
      render: (value) => (
        <Tag color={value === "income" ? "green" : "red"} className="capitalize">
          {value}
        </Tag>
      ),
    },
    { title: "Category", dataIndex: "category" },
    { title: "Description", dataIndex: "description" },
    { title: "Payment Mode", dataIndex: "paymentMode", responsive: ["md"] },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right",
      sorter: (a, b) => a.amount - b.amount,
      render: (amount, record) => (
        <span className={record.type === "income" ? "text-green-600" : "text-red-600"}>
          {record.type === "income" ? "+" : "-"}
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: "Action",
      dataIndex: "_id",
      align: "center",
      render: (_, record) => (
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => handleEdit(record)}
            aria-label="Edit transaction"
            className="text-blue-500 hover:text-blue-700"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => {
              setDeleteId(record._id);
              setShowDeleteModal(true);
            }}
            aria-label="Delete transaction"
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex flex-wrap items-end gap-6 mb-6">
          <div>
            <h6 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">
              Frequency
            </h6>
            <Select
              value={frequency}
              className="w-48"
              options={FREQUENCY_OPTIONS}
              onChange={(value) => {
                setFrequency(value);
                if (value !== "custom") {
                  setSelectedDate([dayjs().subtract(Number(value), "days"), dayjs()]);
                }
              }}
            />
          </div>

          {frequency === "custom" && (
            <div>
              <h6 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">
                Date Range
              </h6>
              <RangePicker
                value={selectedDate}
                onChange={(values) => setSelectedDate(values || [])}
              />
            </div>
          )}

          <div>
            <h6 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Type</h6>
            <Select
              value={type}
              className="w-48"
              onChange={setType}
              options={[
                { value: "all", label: "All" },
                { value: "income", label: "Income" },
                { value: "expense", label: "Expense" },
              ]}
            />
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-200 ml-auto"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>

        {/* Totals for the current filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Income", value: totals.income, className: "text-green-500" },
            { label: "Expenses", value: totals.expense, className: "text-red-500" },
            {
              label: "Net",
              value: totals.net,
              className: totals.net >= 0 ? "text-green-500" : "text-red-500",
            },
          ].map(({ label, value, className }) => (
            <div key={label} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              <p className={`text-lg font-semibold ${className}`}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Transactions</h2>

        <Table
          dataSource={allTransactions}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: "max-content" }}
          className="shadow-md bg-white dark:bg-gray-800 rounded-lg"
          locale={{
            emptyText: <Empty description="No transactions found for this filter" />,
          }}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          title="Confirm Deletion"
          open={showDeleteModal}
          onOk={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <p>Are you sure you want to delete this transaction? This cannot be undone.</p>
        </Modal>

        {/* Edit Transaction Modal */}
        <Modal
          title="Edit Transaction"
          open={!!editData}
          onCancel={() => setEditData(null)}
          onOk={() => form.submit()}
          okText="Update"
          cancelText="Cancel"
          destroyOnHidden
        >
          <Form form={form} layout="vertical" onFinish={handleUpdate}>
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

            <Form.Item label="Type" name="type" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: "income", label: "Income" },
                  { value: "expense", label: "Expense" },
                ]}
              />
            </Form.Item>

            <Form.Item label="Category" name="category" rules={[{ required: true }]}>
              <Select options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
            </Form.Item>

            <Form.Item label="Date" name="date" rules={[{ required: true }]}>
              <DatePicker className="w-full" format="DD MMM YYYY" />
            </Form.Item>

            <Form.Item label="Description" name="description" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Payment Mode" name="paymentMode" rules={[{ required: true }]}>
              <Select options={PAYMENT_MODES.map((m) => ({ value: m, label: m }))} />
            </Form.Item>

            <Form.Item label="Reference" name="reference">
              <Input placeholder="Optional reference" />
            </Form.Item>

            <Form.Item label="Payment Bank" name="paymentBank">
              <Input placeholder="Optional bank name" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Transactions;
