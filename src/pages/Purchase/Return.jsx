"use client";
import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import AdminLayoutWithAuth from "../../components/layout/SidebarLayout";
import { toast } from "react-toastify";

const Return = () => {
  const [formData, setFormData] = useState({
    invoiceNo: "",
    reason: "",
    status: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [saleFound, setSaleFound] = useState(false);
  const [saleData, setSaleData] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Check invoice and fetch sale details
  const handleCheckInvoice = async () => {
    if (!formData.invoiceNo) {
      toast.error("Please enter an invoice number");
      return;
    }

    setChecking(true);
    setSelectedProducts([]);

    try {
      const { data } = await axiosClient.get(
        `/pos-sales/invoice?invoiceNo=${formData.invoiceNo}`
      );

      if (data.success && data.data) {
        setSaleFound(true);
        setSaleData(data.data);
        
        // Initialize selected products with all products and zero return quantities
        const initialSelected = data.data.products.map(product => ({
          ...product,
          returnQuantity: 0,
          isSelected: false
        }));
        setSelectedProducts(initialSelected);
        
        toast.success(`Sale found for invoice ${formData.invoiceNo}`);
      } else {
        setSaleFound(false);
        toast.error("No sale found with this invoice");
      }
    } catch (error) {
      console.error("Check invoice error:", error);
      setSaleFound(false);
      toast.error("Failed to fetch sale info");
    } finally {
      setChecking(false);
    }
  };

  // Handle product selection for return
  const handleProductSelect = (index) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index].isSelected = !updatedProducts[index].isSelected;
    
    // Reset return quantity when deselected
    if (!updatedProducts[index].isSelected) {
      updatedProducts[index].returnQuantity = 0;
    }
    
    setSelectedProducts(updatedProducts);
  };

  // Handle return quantity change
  const handleQuantityChange = (index, quantity) => {
    const updatedProducts = [...selectedProducts];
    const maxQuantity = updatedProducts[index].quantity;
    
    // Ensure return quantity doesn't exceed purchased quantity
    if (quantity <= maxQuantity && quantity >= 0) {
      updatedProducts[index].returnQuantity = quantity;
    }
    
    setSelectedProducts(updatedProducts);
  };

  // Calculate total return amount
  const calculateReturnTotal = () => {
    return selectedProducts.reduce((total, product) => {
      if (product.isSelected && product.returnQuantity > 0) {
        return total + (product.price * product.returnQuantity);
      }
      return total;
    }, 0);
  };

  // Check if any products are selected for return
  const hasSelectedProducts = () => {
    return selectedProducts.some(product => 
      product.isSelected && product.returnQuantity > 0
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!saleFound) {
      toast.error("Please verify invoice first");
      return;
    }

    if (!hasSelectedProducts()) {
      toast.error("Please select at least one product to return");
      return;
    }

    if (!formData.reason || !formData.status) {
      toast.error("Please provide reason and select status");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        products: selectedProducts
          .filter(product => product.isSelected && product.returnQuantity > 0)
          .map(product => ({
            sku: product.sku,
            productName: product.productName,
            price: product.price,
            quantity: product.returnQuantity,
            purchasePrice: product.purchasePrice
          }))
      };

      const { data } = await axiosClient.put("/pos-sales/cancel", payload);

      if (data.success) {
        toast.success(data.message);
        setFormData({ invoiceNo: "", reason: "", status: "" });
        setSaleFound(false);
        setSaleData(null);
        setSelectedProducts([]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Cancel sale error:", error);
      toast.error(error.response?.data?.message || "Failed to process return");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayoutWithAuth>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">
                Return / Cancel POS Sale
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Verify the invoice first, then select products to return.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Invoice Input + Check Button */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label
                    htmlFor="invoiceNo"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    id="invoiceNo"
                    name="invoiceNo"
                    value={formData.invoiceNo}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter invoice number"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCheckInvoice}
                  disabled={checking}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {checking ? "Checking..." : "Verify Invoice"}
                </button>
              </div>

              {/* Sale Details Preview */}
              {saleFound && saleData && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Sale Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-blue-700">Customer</p>
                      <p className="text-blue-900">{saleData.customer?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-blue-700">Phone</p>
                      <p className="text-blue-900">{saleData.customer?.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-blue-700">Total Amount</p>
                      <p className="text-blue-900">${saleData.totalAmount}</p>
                    </div>
                    <div>
                      <p className="font-medium text-blue-700">Date</p>
                      <p className="text-blue-900">
                        {new Date(saleData.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Table */}
              {saleFound && selectedProducts.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Select Products to Return
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Select products and specify quantities to return
                    </p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Select
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SKU
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Purchased Qty
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Return Qty
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Return Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedProducts.map((product, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={product.isSelected}
                                onChange={() => handleProductSelect(index)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {product.productName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.sku || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${product.price}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                max={product.quantity}
                                value={product.returnQuantity}
                                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                                disabled={!product.isSelected}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ${(product.price * product.returnQuantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Return Summary */}
                  {hasSelectedProducts() && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-green-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-semibold text-green-900">
                            Return Summary
                          </h4>
                          <p className="text-sm text-green-700">
                            {selectedProducts.filter(p => p.isSelected && p.returnQuantity > 0).length} 
                            product(s) selected for return
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-700">Total Return Amount</p>
                          <p className="text-2xl font-bold text-green-900">
                            ${calculateReturnTotal().toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Return Details Form */}
              {saleFound && hasSelectedProducts() && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="reason"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Cancellation Reason *
                      </label>
                      <textarea
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Please provide a reason for return/cancellation..."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Action Type *
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select action type</option>
                        <option value="Refunded">Refund</option>
                        <option value="Cancelled">Cancel</option>
                        <option value="Replace">Replace</option>
                      </select>

                      {/* Info Box */}
                      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="flex">
                          <div className="shrink-0">
                            <svg
                              className="h-5 w-5 text-yellow-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                              Important Information
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <ul className="list-disc list-inside space-y-1">
                                <li>Selected products will be returned and stock will be updated</li>
                                <li>Refund amount: ${calculateReturnTotal().toFixed(2)}</li>
                                <li>This action cannot be undone</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        `Process ${formData.status || 'Return'}`
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </AdminLayoutWithAuth>
  );
};

export default Return;