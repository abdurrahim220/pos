import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // All filters in state
  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "",
    approved: null,
    page: 1,
    limit: 10
  });

  const [totalPages, setTotalPages] = useState(1);

  const handleDelete = async (id) => {
    const response = await axiosClient.delete(`/products/${id}`);
    if (response.data.success) {
      toast.success(response.data.message);
      getProducts();
    }
  };

  const getProducts = async () => {
  setLoading(true);
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    if (filters.searchTerm) queryParams.append('name', filters.searchTerm);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.approved !== null) queryParams.append('approved', filters.approved);
    queryParams.append('page', filters.page);
    queryParams.append('limit', filters.limit);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/v1/pos-users/product?${queryParams}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    
    // Check if response is ok first
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.totalItems || 0);
    } else {
      toast.error(data.error || "Failed to fetch products");
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    toast.error("Failed to fetch products");
    // Reset states on error
    setProducts([]);
    setTotalPages(1);
    setTotalProducts(0);
  }
  setLoading(false);
};
  useEffect(() => {
    getProducts();
  }, [filters]); 

  // Update individual filters
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 
    }));
  };

  const handleProductApproval = async (id, isApproved) => {
    try {
      const res = await axiosClient.post(`/products/approval/${id}`, {
        approved: !isApproved,
      });
      if (res.data.success) {
        toast.success("Approval status updated");
        getProducts();
      }
    } catch (err) {
      toast.error("Failed to update approval status");
      console.error(err);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      updateFilter('page', page);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, filters.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`px-3 py-1 rounded ${
            i === filters.page
              ? "bg-primary-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
        <button
          onClick={() => handlePageChange(1)}
          disabled={filters.page === 1}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          First
        </button>
        <button
          onClick={() => handlePageChange(filters.page - 1)}
          disabled={filters.page === 1}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(filters.page + 1)}
          disabled={filters.page === totalPages}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={filters.page === totalPages}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Last
        </button>
        
        {/* Page info */}
        <span className="text-sm text-gray-600 ml-2">
          Page {filters.page} of {totalPages} ({totalProducts} total items)
        </span>
      </div>
    );
  };

  // Fixed serial number calculation
  const calculateSerialNumber = (index) => {
    return totalProducts - (filters.page - 1) * filters.limit - index;
  };

  return (
    <div className="w-full p-4">
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search products..."
          value={filters.searchTerm}
          onChange={(e) => updateFilter('searchTerm', e.target.value)}
          className="border text-black border-gray-500 p-2 rounded flex-1 min-w-[200px]"
        />
        <select
          className="border text-black border-gray-500 p-2 rounded"
          value={filters.approved === null ? '' : filters.approved.toString()}
          onChange={(e) => updateFilter('approved', e.target.value === '' ? null : e.target.value === 'true')}
        >
          <option value="">All Approval</option>
          <option value="true">Approved</option>
          <option value="false">Not Approved</option>
        </select>
        <select
          className="border text-black border-gray-500 p-2 rounded"
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
          <option value="unpublished">Unpublished</option>
        </select>
        
        {/* Reset Filters Button */}
        <button
          onClick={() => setFilters({
            searchTerm: "",
            status: "",
            approved: null,
            page: 1,
            limit: 10
          })}
          className="border border-gray-500 p-2 rounded hover:bg-gray-100"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-black">SL</th>
              <th className="px-4 py-3 text-left font-medium text-black">Image</th>
              <th className="px-4 py-3 text-left font-medium text-black">Product Name</th>
              <th className="px-4 py-3 text-left font-medium text-black">SKU</th>
              <th className="px-4 py-3 text-left font-medium text-black">Status</th>
              <th className="px-4 py-3 text-left font-medium text-black">Approved</th>
              <th className="px-4 py-3 font-medium text-black text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : products?.length > 0 ? (
              products?.map((product, index) => (
                <tr key={product._id} className="">
                  <td className="px-4 py-3 font-medium">
                    {calculateSerialNumber(index)} {/* Fixed serial number */}
                  </td>
                  <td className="px-4 py-3">
                    <img
                      style={{ objectFit: "contain" }}
                      src={product?.images[0]?.small?.url}
                      alt=""
                      className="w-12 h-12 object-contain"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3">
                    {product.type === "simple" ? product.sku : "Not Applicable"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium 
                      ${
                        product.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="flex justify-center items-center h-20 px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        disabled
                        className="sr-only peer"
                        checked={product?.approved || false}
                        onChange={() =>
                          handleProductApproval(product?._id, product?.approved)
                        }
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </td>
                  <td>
                    <div className="flex items-center gap-3 justify-center">
                      <Link
                        className="bg-primary-100 text-primary-600 w-10 h-10 flex justify-center items-center rounded-full"
                        to={`/products/${product._id}`}
                      >
                        <Icon icon="lucide:eye" />
                      </Link>
                      <Link
                        className="bg-success-100 text-success-600 w-10 h-10 flex justify-center items-center rounded-full"
                        to={`/products/${product._id}/edit`}
                      >
                        <Icon icon="lucide:edit" />
                      </Link>
                      <button
                        className="bg-danger-100 text-danger-600 w-10 h-10 flex justify-center items-center rounded-full"
                        onClick={() => handleDelete(product._id)}
                      >
                        <Icon icon="fluent:delete-24-regular" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default ProductTable;