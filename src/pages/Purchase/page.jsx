import React, { useState, useEffect } from "react";
import AdminLayoutWithAuth from "../../components/layout/SidebarLayout";
import {
  FiSearch,
  FiShoppingCart,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";

import axiosClient from "../../api/axiosClient";
import SalesTrendChart from "../../components/charts/SalesTrendChart";
import PaymentMethodsChart from "../../components/charts/PaymentMethodsChart";
import StatusDistributionChart from "../../components/charts/StatusDistributionChart";
import RevenueTrendChart from "../../components/charts/RevenueTrendChart";

import SalesDetailsCard from "./SalesDetailsCard";
import SalesTable from "./SalesTable";

const Purchases = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  const [chartTimeRange, setChartTimeRange] = useState("week");
  const [saleToPrint, setSaleToPrint] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [editFormData, setEditFormData] = useState({
    customerName: "",
    customerPhone: "",
    status: "",
    discount: 0,
    discountType: "fixed",
    paymentMethod: "",
    paymentAmount: 0,
    products: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get("/pos-sales");

        setSales(response.data.data || []);
        setFilteredSales(response.data.data || []);
      } catch (error) {
        console.error("Error fetching sales data:", error);

        setSales([]);
        setFilteredSales([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = sales;
    if (searchTerm) {
      filtered = filtered.filter(
        (sale) =>
          sale.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.customer?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          sale.customer?.phone?.includes(searchTerm)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((sale) => sale.status === statusFilter);
    }
    setFilteredSales(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sales]);

  const generateChartData = () => {
    const now = new Date();
    let data = [];
    if (chartTimeRange === "week") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateString = date.toISOString().split("T")[0];
        const daySales = sales.filter((sale) => {
          const saleDate = new Date(sale.createdAt).toISOString().split("T")[0];
          return saleDate === dateString;
        });

        data.push({
          name: date.toLocaleDateString("en-US", { weekday: "short" }),
          date: dateString,
          sales: daySales.length,
          revenue: daySales.reduce(
            (sum, sale) => sum + (sale.totalAmount || 0),
            0
          ),
          profit: daySales.reduce((sum, sale) => sum + (sale.profit || 0), 0),
          fullDate: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        });
      }
    } else if (chartTimeRange === "month") {
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - i * 7 - 6);
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() - i * 7);
        const weekSales = sales.filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return saleDate >= weekStart && saleDate <= weekEnd;
        });

        data.push({
          name: `Week ${4 - i}`,
          sales: weekSales.length,
          revenue: weekSales.reduce(
            (sum, sale) => sum + (sale.totalAmount || 0),
            0
          ),
          profit: weekSales.reduce((sum, sale) => sum + (sale.profit || 0), 0),
          period: `${weekStart.getDate()}-${weekEnd.getDate()} ${weekStart.toLocaleDateString(
            "en-US",
            { month: "short" }
          )}`,
        });
      }
    } else if (chartTimeRange === "year") {
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthSales = sales.filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return (
            saleDate.getMonth() === month.getMonth() &&
            saleDate.getFullYear() === month.getFullYear()
          );
        });
        data.push({
          name: month.toLocaleDateString("en-US", { month: "short" }),
          sales: monthSales.length,
          revenue: monthSales.reduce(
            (sum, sale) => sum + (sale.totalAmount || 0),
            0
          ),
          profit: monthSales.reduce((sum, sale) => sum + (sale.profit || 0), 0),
        });
      }
    }
    return data;
  };

  const paymentMethodData = () => {
    const methods = {};
    sales.forEach((sale) => {
      const method = sale.payment?.method || "unknown";
      methods[method] = (methods[method] || 0) + 1;
    });
    return Object.entries(methods).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      count: value,
    }));
  };

  const statusDistributionData = () => {
    const statusCounts = {};
    sales.forEach((sale) => {
      const status = sale.status || "unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      count: value,
    }));
  };

  const chartData = generateChartData();
  const paymentData = paymentMethodData();
  const statusData = statusDistributionData();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
    }).format(amount || 0);
  };

  const handlePrintInvoice = (sale) => {
    setSaleToPrint(sale);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setEditFormData({
      customerName: sale.customer?.name || "",
      customerPhone: sale.customer?.phone || "",
      status: sale.status || "Completed",
      discount: sale.discount || 0,
      discountType: sale.discountType || "fixed",
      paymentMethod: sale.payment?.method || "cash",
      paymentAmount: sale.payment?.amount || 0,
      products: sale.products ? [...sale.products] : [],
    });
    setIsEditModalOpen(true);
  };

  const handleProductQtyChange = (sku, newQty) => {
    if (newQty < 1) return;
    setEditFormData((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.sku === sku ? { ...p, quantity: newQty } : p
      ),
    }));
  };

  const handleUpdateSale = async (e) => {
    e.preventDefault();
    try {
      // Recalculate totals
      const newSubTotal = editFormData.products.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0
      );
      const discountAmt =
        editFormData.discountType === "percent"
          ? (newSubTotal * editFormData.discount) / 100
          : editFormData.discount;
      const newTotalAmount = newSubTotal - discountAmt;

      const payload = {
        customer: {
          name: editFormData.customerName,
          phone: editFormData.customerPhone,
        },
        status: editFormData.status,
        discount: editFormData.discount,
        discountType: editFormData.discountType,
        payment: {
          method: editFormData.paymentMethod,
          amount: editFormData.paymentAmount,
        },
        products: editFormData.products,
        subTotal: newSubTotal,
        totalAmount: newTotalAmount,
        totalQuantity: editFormData.products.reduce((sum, p) => sum + p.quantity, 0),
      };

      const response = await axiosClient.patch(
        `/pos-sales/${editingSale._id}`,
        payload
      );
      if (response.data.success) {
        toast.success("Sale updated successfully");
        // Update local state
        setSales((prev) =>
          prev.map((s) => (s._id === editingSale._id ? response.data.data : s))
        );
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating sale:", error);
      toast.error(error.response?.data?.message || "Failed to update sale");
    }
  };

  if (loading) {
    return (
      <AdminLayoutWithAuth>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading sales data...</p>
          </div>
        </div>
      </AdminLayoutWithAuth>
    );
  }

  return (
    <AdminLayoutWithAuth>
      {/* 🖨️ PRINT TEMPLATE — hidden on screen, shown only when printing */}

      {saleToPrint && (
        <div className="print-invoice-container">
          <div className="print-invoice">
            {/* Header */}
            <div className="text-center mb-3">
              <h2 className="text-md text-[26px] font-bold">Shoelicious</h2>
              <p className="text-md">Shop No: SC-032A,Jamuna Future Park,</p>
              <p className="text-md">DHAKA, Dhaka, 1229, BANGLADESH</p>
              <p className="text-md">
                Mobile: 01601561085 , No Warranty/Currently:No Refund/Exchange
              </p>
            </div>

            <div className="border-t border-b my-3 py-1 text-center">
              <h3 className="text-sm font-bold">Invoice</h3>
            </div>

            {/* Customer Info */}
            <div className="mb-3 text-md">
              <p>
                <strong>Customer:</strong>{" "}
                {saleToPrint.customer?.name || "Walk-in"}
              </p>
              {saleToPrint.customer?.phone && (
                <p>
                  <strong>Mobile:</strong> {saleToPrint.customer.phone}
                </p>
              )}
            </div>

            <div className="flex justify-between text-md ">
              <span>Invoice No: {saleToPrint.invoiceNo || "N/A"}</span>
              <span>Date: {formatDate(saleToPrint.createdAt)}</span>
            </div>
            {/* product table name sr_no */}
            <table className="w-full text-md border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-1 py-1 text-left">Sr No</th>
                  <th className="px-1 py-1 text-center">Product Name</th>
                </tr>
              </thead>
              <tbody>
                {(saleToPrint.products || []).map((product, idx) => {
                  const productName = product.productName || "N/A";

                  return (
                    <tr key={idx}>
                      <td className="px-1 py-1">{idx + 1}</td>
                      <td className="px-1 py-1">{productName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Products Table price and quantity */}
            <table className="w-full text-md  border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-1 py-1 text-left">Sr No</th>
                  <th className="px-1 py-1 text-left">Qty(unit_price)</th>
                  <th className="px-1 py-1 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {(saleToPrint.products || []).map((product, idx) => {
                  return (
                    <tr key={idx}>
                      <td className="px-1 py-1 text-center">{idx + 1}</td>
                      <td className="px-1 py-1 text-center">
                        {product.quantity || 1}({product.price || 1})
                      </td>
                      <td className="px-1 py-1 text-center">
                        {product.quantity * product.price}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Payment Summary */}
            <div className="mt-3 text-md">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="capitalize">
                  {saleToPrint.payment?.method || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(saleToPrint.subTotal || 0)}</span>
              </div>
              {saleToPrint.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount</span> <span>{saleToPrint.discountType}</span>
                  <span>-{formatCurrency(saleToPrint.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-1 border-t">
                <span>Total Amount</span>
                <span>{formatCurrency(saleToPrint.totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid Amount</span>
                <span>{formatCurrency(saleToPrint.payment?.amount || 0)}</span>
              </div>
              {saleToPrint.payment?.amount > saleToPrint.totalAmount && (
                <div className="flex justify-between text-green-600">
                  <span>Change</span>
                  <span>
                    {formatCurrency(
                      (saleToPrint.payment?.amount || 0) -
                      (saleToPrint.totalAmount || 0)
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Status and Profit Info */}
            <div className="mt-2 text-sm border-t pt-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <span
                  className={`font-semibold ${saleToPrint.status === "Completed"
                    ? "text-green-600"
                    : saleToPrint.status === "Cancelled"
                      ? "text-red-600"
                      : saleToPrint.status === "Refunded"
                        ? "text-orange-600"
                        : "text-blue-600"
                    }`}
                >
                  {saleToPrint.status}
                </span>
              </div>
            </div>

            <div className="mt-10 text-lg text-center">
              <p>Software by Shannon IT WhatsApp: +8801743136127</p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen print:hidden">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">POS Sales</h1>
              <p className="text-gray-600 mt-2">
                Manage and view all point of sale transactions
              </p>
            </div>
            <a href="/sales">
              <button className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors">
                <FiPlus className="text-lg" />
                New Sale
              </button>
            </a>
          </div>
        </div>

        <SalesDetailsCard sales={sales} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SalesTrendChart
            data={chartData}
            timeRange={chartTimeRange}
            onTimeRangeChange={setChartTimeRange}
          />

          <PaymentMethodsChart data={paymentData} />

          <StatusDistributionChart data={statusData} />

          <RevenueTrendChart data={chartData} />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice, customer name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="all">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <SalesTable
              currentItems={currentItems}
              handlePrintInvoice={handlePrintInvoice}
              onEdit={handleEdit}
            />
          </div>

          {currentItems.length === 0 && (
            <div className="text-center py-12">
              <FiShoppingCart className="mx-auto text-4xl text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No sales found
              </h3>
              <p className="text-gray-500">
                {sales.length === 0
                  ? "No sales have been recorded yet."
                  : "No sales match your current filters."}
              </p>
            </div>
          )}

          {filteredSales.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredSales.length)}
                </span>{" "}
                of <span className="font-medium">{filteredSales.length}</span>{" "}
                results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronLeft className="text-lg" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronRight className="text-lg" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Edit POS Sale</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Close"
              >
                <FiX className="text-xl text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUpdateSale} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.customerName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        customerName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Walk-in Customer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Phone
                  </label>
                  <input
                    type="text"
                    value={editFormData.customerPhone}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        customerPhone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="017XXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                    <option value="Replace">Replace</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={editFormData.paymentMethod}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="mobile banking">Mobile Banking</option>
                    <option value="bank">Bank</option>
                    <option value="replace">Replace</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type
                  </label>
                  <select
                    value={editFormData.discountType}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        discountType: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="fixed">Fixed (৳)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    value={editFormData.discount}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        discount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    value={editFormData.paymentAmount}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        paymentAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min="0"
                  />
                </div>
              </div>

              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Products
                </h3>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {editFormData.products.map((product, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {product.productName}
                        </p>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            ৳{product.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-white border rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleProductQtyChange(
                                product.sku,
                                product.quantity - 1
                              )
                            }
                            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {product.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleProductQtyChange(
                                product.sku,
                                product.quantity + 1
                              )
                            }
                            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <p className="font-bold text-blue-600">
                            ৳{(product.price * product.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-95"
                >
                  Update Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @media screen {
          .print-invoice-container {
            display: none;
          }
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
            font-size: 14px;
            line-height: 1.4;
            display: flex;
            justify-content: center;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print-invoice-container {
            position: relative;
            width: 80mm; /* Standard thermal width */
            margin: 0;
            padding: 0;
          }
          .print-invoice {
            width: 80mm;
            padding: 5mm 3mm;
            font-family: "Courier New", monospace;
          }
          .print-invoice-container,
          .print-invoice,
          .print-invoice * {
            page-break-before: avoid !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th,
          td {
            padding: 2px 0;
          }
          @page {
            size: auto;
            margin: 0;
          }
        }
      `}</style>
    </AdminLayoutWithAuth>
  );
};

export default Purchases;
