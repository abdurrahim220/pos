import React, { useState, useEffect } from "react";
import AdminLayoutWithAuth from "../../components/layout/SidebarLayout";
import {
  FiShoppingCart,
  FiActivity,
  FiDollarSign,
  FiSearch,
  FiCalendar,
  FiFilter,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp,
} from "react-icons/fi";
import axiosClient from "../../api/axiosClient";

const SaleAnalytic = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    todaySales: 0,
    todayOrders: 0,
    totalRevenue: 0,
    totalProfit: 0,
    todayReturns: 0,
    todayReplaces: 0,
    weeklySales: 0,
    monthlySales: 0,
  });

  // Timely Stats
  const [timelyStats, setTimelyStats] = useState({
    totalItems: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalReturn: 0,
    totalReplace: 0,
    totalCancelled: 0,
    totalComplete: 0,
  });

  // Filters
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchSalesData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sales, dateRange, searchTerm]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/pos-sales");
      const salesData = response.data.data || [];
      setSales(salesData);
      calculateStats(salesData);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
    const oneMonthAgo = new Date(
      new Date().setMonth(new Date().getMonth() - 1),
    );

    let totalOrders = 0;
    let todaySalesAmount = 0;
    let todayOrdersCount = 0;
    let totalRevenueAmount = 0;
    let totalProfitAmount = 0;
    let todayReturnsCount = 0;
    let todayReplacesCount = 0;
    let weeklySalesAmount = 0;
    let monthlySalesAmount = 0;

    data.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      const saleDateString = saleDate.toISOString().split("T")[0];
      const amount = sale.totalAmount || 0;
      const profit = sale.profit || 0;

      // Overall
      totalOrders++;
      totalRevenueAmount += amount;
      totalProfitAmount += profit;

      // Today
      if (saleDateString === today) {
        todaySalesAmount += amount;
        todayOrdersCount++;

        // Check for Return/Replace status
        // Assuming status strings. Adjust if backend uses different terms
        if (sale.status === "Refunded" || sale.status === "Returned") {
          todayReturnsCount++;
        }
        if (sale.status === "Replaced" || sale.status === "Replace") {
          todayReplacesCount++;
        }
      }

      // Weekly
      if (saleDate >= oneWeekAgo) {
        weeklySalesAmount += amount;
      }

      // Monthly
      if (saleDate >= oneMonthAgo) {
        monthlySalesAmount += amount;
      }
    });

    setStats({
      totalOrders,
      todaySales: todaySalesAmount,
      todayOrders: todayOrdersCount,
      totalRevenue: totalRevenueAmount,
      totalProfit: totalProfitAmount,
      todayReturns: todayReturnsCount,
      todayReplaces: todayReplacesCount,
      weeklySales: weeklySalesAmount,
      monthlySales: monthlySalesAmount,
    });
  };

  const calculateTimelyStats = (data) => {
    let revenue = 0;
    let profit = 0;
    let returns = 0;
    let replaces = 0;
    let cancelled = 0;
    let completed = 0;

    data.forEach((sale) => {
      revenue += sale.totalAmount || 0;
      profit += sale.profit || 0;

      // Status checks
      if (sale.status === "Refunded" || sale.status === "Returned") {
        returns++;
      }
      if (sale.status === "Replaced" || sale.status === "Replace") {
        replaces++;
      }
      if (sale.status === "Cancelled") {
        cancelled++;
      }
      if (sale.status === "Completed") {
        completed++;
      }
    });

    setTimelyStats({
      totalItems: data.length,
      totalRevenue: revenue,
      totalProfit: profit,
      totalReturn: returns,
      totalReplace: replaces,
      totalCancelled: cancelled,
      totalComplete: completed,
    });
  };

  const applyFilters = () => {
    let result = [...sales];

    // Date Range Filter
    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999); // Include the end of the 'to' day

      result = result.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= fromDate && saleDate <= toDate;
      });
    } else if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      result = result.filter((sale) => new Date(sale.createdAt) >= fromDate);
    } else if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((sale) => new Date(sale.createdAt) <= toDate);
    }

    // Search Filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (sale) =>
          sale.invoiceNo?.toLowerCase().includes(lowerTerm) ||
          sale.customer?.name?.toLowerCase().includes(lowerTerm) ||
          sale.customer?.phone?.includes(lowerTerm),
      );
    }

    setFilteredSales(result);
    calculateTimelyStats(result);
    setCurrentPage(1);
  };

  const handleDateChange = (type, value) => {
    setDateRange((prev) => ({ ...prev, [type]: value }));
  };

  const formatCurrency = (amount) => {
    return (
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "BDT",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
        .format(amount || 0)
        .replace("BDT", "")
        .trim() + " BDT"
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  // Status Badge Helper
  const getStatusBadge = (status) => {
    const statusStyles = {
      Completed: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Cancelled: "bg-red-100 text-red-800",
      Refunded: "bg-orange-100 text-orange-800",
      Returned: "bg-orange-100 text-orange-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          statusStyles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayoutWithAuth>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayoutWithAuth>
    );
  }

  return (
    <AdminLayoutWithAuth>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Sales Analysis
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Total Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Total Orders
                </p>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.totalOrders}
                </div>
                <div className="mt-1 text-xs text-gray-400">All time</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <FiShoppingCart className="text-blue-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Card 2: Today's Sales */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Today's Sales
                </p>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.todaySales)}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {stats.todayOrders} orders today
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-red-500 font-medium">
                    Return: {stats.todayReturns}
                  </span>
                  <span className="text-blue-500 font-medium">
                    Replace: {stats.todayReplaces}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <FiActivity className="text-green-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Card 3: Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Total Revenue
                </p>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  All time revenue
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <FiDollarSign className="text-purple-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Card 4: Total Profit */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Total Profit
                </p>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.totalProfit)}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-gray-500 w-32">
                    <span>Weekly Sales:</span>
                    <span className="font-medium text-gray-700">
                      {formatCurrency(stats.weeklySales)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 w-32">
                    <span>Monthly Sales:</span>
                    <span className="font-medium text-gray-700">
                      {formatCurrency(stats.monthlySales)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <FiTrendingUp className="text-orange-500 text-xl" />
              </div>
            </div>
          </div>
        </div>
        {/* timely analytics */}
        {/* Timely Analytics */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Timely Analytics
          </h2>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Results based on:</p>
                <p className="font-medium text-gray-800">
                  {dateRange.from ? formatDate(dateRange.from) : "Start"} —{" "}
                  {dateRange.to ? formatDate(dateRange.to) : "Present"}
                </p>
              </div>
              <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium self-start sm:self-auto">
                {timelyStats.totalItems} Records Found
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                  Revenue
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(timelyStats.totalRevenue)}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                  Profit
                </p>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(timelyStats.totalProfit)}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                  Returns
                </p>
                <p className="text-lg font-bold text-red-600">
                  {timelyStats.totalReturn}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                  Replaced
                </p>
                <p className="text-lg font-bold text-orange-600">
                  {timelyStats.totalReplace}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                  Cancelled
                </p>
                <p className="text-lg font-bold text-red-500">
                  {timelyStats.totalCancelled}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                  Completed
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {timelyStats.totalComplete}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales History Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header & Filters */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <h2 className="text-lg font-bold text-gray-800">Sales History</h2>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <span className="text-gray-500 text-sm">From:</span>
                  <input
                    type="date"
                    className="bg-transparent border-none outline-none text-sm text-gray-700"
                    value={dateRange.from}
                    onChange={(e) => handleDateChange("from", e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <span className="text-gray-500 text-sm">To:</span>
                  <input
                    type="date"
                    className="bg-transparent border-none outline-none text-sm text-gray-700"
                    value={dateRange.to}
                    onChange={(e) => handleDateChange("to", e.target.value)}
                  />
                </div>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    SL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Invoice No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.length > 0 ? (
                  currentItems.map((sale, index) => (
                    <tr
                      key={sale._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-blue-600 cursor-pointer hover:underline">
                        {sale.invoiceNo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {sale.customer?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {sale.customer?.phone || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center">
                        {sale.totalQuantity}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600 text-right">
                        {formatCurrency(sale.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-600 uppercase font-medium">
                          {sale.payment?.method || "CASH"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(sale.status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No sales found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredSales.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Prev
              </button>

              <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                {currentPage}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Last
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayoutWithAuth>
  );
};

export default SaleAnalytic;
