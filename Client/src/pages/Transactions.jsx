import React, { useState, useEffect, useCallback } from "react";
import { Select, Table, Tabs, DatePicker, Modal, Empty, Spin, Form, Input } from "antd";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "../components/Layout/Layout";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const Transactions = () => {
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [allTransactions, setAllTransactions] = useState([]);
  const [frequency, setFrequency] = useState(7);
  const [selectedDate, setSelectedDate] = useState([dayjs().subtract(7, "days"), dayjs()]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form] = Form.useForm();

  // Fetch Transactions
  const getAllTransactions = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        toast.error("User not found, please log in again.");
        return;
      }
      setLoading(true);
      const response = await axios.post("/api/transactions/get-transactions", {
        userid: user._id,
        frequency,
        selectedDate:
          frequency === "custom" && selectedDate.length === 2
            ? [selectedDate[0].toISOString(), selectedDate[1].toISOString()]
            : [],
        type: type, // Always send the type, even if it's "all"
      });
      setAllTransactions(response.data || []);
    } catch (error) {
      toast.error("Unable to get transactions");
      setAllTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [frequency, selectedDate, type]);

  useEffect(() => {
    getAllTransactions();
  }, [getAllTransactions]);

  // Handle delete confirmation
  const handleDeleteConfirm = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Handle transaction deletion
  const handleDelete = async () => {
    try {
      await axios.delete(`/api/transactions/delete-transaction/${deleteId}`);
      toast.success("Transaction deleted successfully");
      setAllTransactions((prev) => prev.filter((item) => item._id !== deleteId));
    } catch (error) {
      toast.error("Failed to delete transaction");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  // Open Edit Modal
  const handleEdit = (record) => {
    setEditData(record);
    form.setFieldsValue({
      amount: record.amount,
      type: record.type,
      category: record.category,
      description: record.description,
    });
    setShowEditModal(true);
  };

  // Handle Update Transaction
  const handleUpdate = async (values) => {
    try {
      await axios.put(`/api/transactions/update-transaction/${editData._id}`, values);
      toast.success("Transaction updated successfully");
      setShowEditModal(false);
      setEditData(null);
      getAllTransactions();
    } catch (error) {
      toast.error("Failed to update transaction");
    }
  };

  // Table Columns
  const columns = [
    { title: "Date", dataIndex: "date", render: (date) => dayjs(date).format("DD MMM YYYY") },
    { title: "Amount", dataIndex: "amount", render: (amount) => `₹${amount}` },
    { title: "Category", dataIndex: "category" },
    { title: "Description", dataIndex: "description" },
    {
      title: "Action",
      dataIndex: "_id",
      render: (_, record) => (
        <div className="flex gap-4">
          <button onClick={() => handleEdit(record)} className="text-blue-500 hover:text-blue-700">
            Edit
          </button>
          <button onClick={() => handleDeleteConfirm(record._id)} className="text-red-500 hover:text-red-700">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-100 min-h-screen">
        {/* Filters */}
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-wrap items-center justify-between mb-6 border border-gray-200">
          <div>
            <h6 className="text-gray-700 font-medium">Select Frequency</h6>
            <Select
              value={frequency}
              className="w-48 border-gray-300 rounded-md"
              onChange={(value) => {
                setFrequency(value);
                if (value !== "custom") {
                  setSelectedDate([dayjs().subtract(value, "days"), dayjs()]);
                }
              }}
            >
              <Select.Option value="1">Yesterday</Select.Option>
              <Select.Option value="7">Last 1 Week</Select.Option>
              <Select.Option value="30">Last 1 Month</Select.Option>
              <Select.Option value="365">Last 1 Year</Select.Option>
              <Select.Option value="custom">Custom</Select.Option>
            </Select>
          </div>
          {frequency === "custom" && (
            <div>
              <h6 className="text-gray-700 font-medium">Select Date Range</h6>
              <RangePicker value={selectedDate} onChange={(values) => setSelectedDate(values || [])} />
            </div>
          )}
          <div>
            <h6 className="text-gray-700 font-medium">Select Type</h6>
            <Select value={type} className="w-48 border-gray-300 rounded-md" onChange={(value) => setType(value)}>
              <Select.Option value="all">All</Select.Option>
              <Select.Option value="income">Income</Select.Option>
              <Select.Option value="expense">Expense</Select.Option>
            </Select>
          </div>
        </div>

        {/* Transactions Table */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Transactions</h2>
        {loading ? (
          <Spin size="large" className="flex justify-center items-center" />
        ) : (
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="Transactions" key="1">
              {allTransactions.length > 0 ? (
                <Table dataSource={allTransactions} columns={columns} rowKey="_id" pagination={{ pageSize: 5 }} className="shadow-md bg-white rounded-lg" />
              ) : (
                <Empty description="No Transactions Found" className="bg-white p-6 rounded-lg shadow-md" />
              )}
            </Tabs.TabPane>
          </Tabs>
        )}

        {/* Delete Confirmation Modal */}
        <Modal title="Confirm Deletion" open={showDeleteModal} onOk={handleDelete} onCancel={() => setShowDeleteModal(false)} okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }}>
          <p>Are you sure you want to delete this transaction?</p>
        </Modal>

        {/* Edit Transaction Modal */}
        <Modal title="Edit Transaction" open={showEditModal} onCancel={() => setShowEditModal(false)} onOk={() => form.submit()} okText="Update" cancelText="Cancel">
          <Form form={form} layout="vertical" onFinish={handleUpdate}>
            <Form.Item label="Amount" name="amount"><Input type="number" /></Form.Item>
            <Form.Item label="Category" name="category"><Input /></Form.Item>
            <Form.Item label="Description" name="description"><Input /></Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Transactions;
