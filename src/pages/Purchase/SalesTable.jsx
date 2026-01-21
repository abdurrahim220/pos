import React from "react";
import { FiCalendar, FiEdit, FiEye, FiPrinter, FiUser } from "react-icons/fi";

export default function SalesTable({ currentItems, handlePrintInvoice, onEdit }) {
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
  const getStatusBadge = (status) => {
    const statusStyles = {
      Completed: "bg-green-100 text-green-800 border-green-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200",
      Refunded: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Replace: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status] || "bg-gray-100 text-gray-800 border-gray-200"
          }`}
      >
        {status}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    const icons = { cash: "৳", card: "💳", mobile: "📱", digital: "📲" };
    return icons[method] || "💵";
  };

  return (
    <>
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Sale Details
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Products
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {currentItems.map((sale) => (
            <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm text-gray-600">
                    {sale.invoiceNo || "No Invoice"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <FiCalendar className="text-gray-400" />
                    {formatDate(sale.createdAt)}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium text-gray-900">
                    {sale.customer?.name || "Walk-in Customer"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {sale.customer?.phone || "No phone"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <FiUser className="text-gray-400" />
                    {sale.soldBy?.name || "Unknown"}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm text-gray-900">
                    {sale.products?.length || 0} item
                    {(sale.products?.length || 0) !== 1 ? "s" : ""}
                  </div>
                  <div className="text-xs text-gray-500">
                    Qty: {sale.totalQuantity || 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                    {sale.products?.map((p) => p.sku).join(", ") || "No products"}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(sale.totalAmount)}
                  </div>
                  {(sale.discount || 0) > 0 && (
                    <div className="text-xs text-red-600">
                      {sale.discountType === "percent" ? "%" : "৳"}-
                      {formatCurrency(sale.discount)}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <span>{getPaymentMethodIcon(sale.payment?.method)}</span>
                    {sale.payment?.method || "Unknown"}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(sale.status || "Unknown")}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintInvoice(sale)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Print Invoice"
                  >
                    <FiPrinter className="text-lg" />
                  </button>
                  <button
                  onClick={() => onEdit(sale)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <FiEdit className="text-lg" />
                </button>
                </div>
                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
