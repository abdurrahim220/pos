import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";

import StockTable from "./stockTable.jsx";
import axiosClient from "../../api/axiosClient.js";
import { TrLoader } from "../../components/common/TrLoader.jsx";
import BreadCrumb from "../../components/ui/BreadCrumb.jsx";
import AdminLayoutWithAuth from "../../components/layout/SidebarLayout.jsx";

const StockList = () => {
  const [stocks, setStocks] = useState([]);
  const [totalStocks, setTotalStocks] = useState(0);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStocks();
  }, [currentPage, search]);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/pos-stock", {
        params: {
          page: currentPage,
          limit: limit,
          search: search,
        },
      });

      setStocks(res.data.data);
      setTotalPages(res?.data?.pagination?.totalPages);
      setTotalStocks(res?.data?.pagination?.totalItems);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      toast.error("Failed to fetch stock data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleEdit = async (id, updatedData) => {
    try {
      const response = await axiosClient.put(
        `/pos-stock?summaryId=${id}`,
        updatedData,
      );

      if (response?.data?.success) {
        setStocks((prevStocks) =>
          prevStocks?.map((stock) =>
            stock._id === id
              ? {
                  ...stock,
                  currentStock:
                    updatedData.action === "increase"
                      ? stock.currentStock + updatedData.quantity
                      : stock.currentStock - updatedData.quantity,
                }
              : stock,
          ),
        );
        toast.success("Stock updated successfully");
      } else {
        toast.error(response.message || "Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("An error occurred while updating the stock");
    }
  };

  // ---------- SMART PAGINATION ----------
  const getPageNumbers = () => {
    const pages = [];
    const total = totalPages;
    const current = currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, "...", total);
      } else if (current >= total - 2) {
        pages.push(1, "...", total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, "...", current - 1, current, current + 1, "...", total);
      }
    }

    return pages;
  };

  return (
    <AdminLayoutWithAuth>
      <div className="grid grid-cols-12">
        <div className="col-span-12">
          <BreadCrumb name={"Stock List"} />
          <div className="card border-0 mt-4">
            <div className="card-header flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="icon-field relative">
                  <input
                    type="text"
                    value={search}
                    onChange={handleSearch}
                    className="bg-white ps-10 border-neutral-200 rounded-lg w-auto"
                    placeholder="Search by product name or SKU"
                  />
                  <span className="icon absolute top-1/2 left-0 text-lg flex">
                    <Icon icon="ion:search-outline" />
                  </span>
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="overflow-hidden rounded-lg shadow">
                {loading ? (
                  <TrLoader />
                ) : (
                  <StockTable
                    totalStocks={totalStocks}
                    limit={limit}
                    stocks={stocks}
                    currentPage={currentPage}
                    onEdit={handleEdit}
                  />
                )}
              </div>

              {/* ------------ PAGINATION UI ------------ */}
              <div className="flex justify-center mt-6">
                <ul className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-black hover:bg-gray-200 disabled:opacity-40"
                  >
                    First
                  </button>

                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-black hover:bg-gray-200 disabled:opacity-40"
                  >
                    Prev
                  </button>

                  {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-lg bg-gray-50 text-gray-500"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={index}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg border transition ${
                          currentPage === page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-800 hover:bg-gray-100 border-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-black hover:bg-gray-200 disabled:opacity-40"
                  >
                    Next
                  </button>

                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-black hover:bg-gray-200 disabled:opacity-40"
                  >
                    Last
                  </button>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutWithAuth>
  );
};

export default StockList;
