import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient.js";

const StockHistoryModal = ({ summaryId, onClose }) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockHistory, setStockHistory] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockHistory = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get("/pos-stock/history", {
          params: {
            summaryId,
            page,
            limit,
            search: searchQuery,
          },
        });

        const { data, pagination } = response.data;
        if (data) {
          setStockHistory(data);
          setPaginationInfo(pagination);
          setError(null);
        }
      } catch (err) {
        setError("Failed to fetch stock history.");
      } finally {
        setLoading(false);
      }
    };

    if (summaryId) fetchStockHistory();
  }, [summaryId, page, limit, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const renderPagination = () => {
    const { currentPage, totalPages } = paginationInfo;
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            i === currentPage
              ? "bg-primary-600 text-white shadow"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
        <button
          className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white disabled:opacity-40"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </button>

        {pages}

        <button
          className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white disabled:opacity-40"
          disabled={page === paginationInfo.totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[1000px] max-h-[85vh] overflow-y-auto border">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Stock History
          </h2>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
          >
            ✕ Close
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by type or reason..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-center text-gray-600 py-6">
            Loading stock history...
          </p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-2">Transaction ID</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Quantity</th>
                  <th className="px-4 py-2">Reason</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>

              <tbody>
                {stockHistory?.length > 0 ? (
                  stockHistory?.map((history) => (
                    <tr key={history.transactionId} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-2 font-medium">{history.transactionId}</td>

                      <td
                        className={`px-4 py-2 capitalize font-semibold ${
                          history.transactionType === "increase"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {history.transactionType}
                      </td>

                      <td className="px-4 py-2">{history.quantity}</td>
                      <td className="px-4 py-2">{history.reason || "—"}</td>

                      <td className="px-4 py-2">
                        {new Date(history.transactionDate).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center px-4 py-6 text-gray-500">
                      No matching stock history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {paginationInfo.totalPages > 1 && renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default StockHistoryModal;
