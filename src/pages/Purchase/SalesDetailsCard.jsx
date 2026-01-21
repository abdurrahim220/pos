import React from "react";
import { FaWallet } from "react-icons/fa";
import { FiCalendar, FiShoppingCart, FiUser } from "react-icons/fi";
import { GiCancel, GiProfit, GiWallet } from "react-icons/gi";
import { MdFindReplace } from "react-icons/md";
import { TbReplaceFilled, TbWalletOff } from "react-icons/tb";

export default function SalesDetailsCard({ sales }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
    }).format(amount || 0);
  };
  // console.log("sales", sales)

  const today = new Date().toISOString().split("T")[0];
  const todaySales = sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt).toISOString().split("T")[0];
    return saleDate === today;
  });

  const todayRevenue = todaySales
    .filter((s) => s.status === "Completed" || s.status === "Replace")
    .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

  const todayProfit = todaySales
    .filter((s) => s.status === "Completed" || s.status === "Replace")
    .reduce((sum, sale) => sum + (sale.profit || 0), 0);

  return (
    <div>
      {/* Today's Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Today's Sales</p>
              <p className="text-3xl font-bold mt-1">{todaySales.length}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <FiShoppingCart className="text-white text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Today's Revenue
              </p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(todayRevenue)}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <GiWallet className="text-white text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">
                Today's Profit
              </p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(todayProfit)}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <GiProfit className="text-white text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {sales.length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiShoppingCart className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(
                  sales
                    .filter(
                      (s) => s.status === "Completed" || s.status === "Replace"
                    )
                    .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
                )}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <GiWallet className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Profit</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(
                  sales
                    .filter(
                      (s) => s.status === "Completed" || s.status === "Replace"
                    )
                    .reduce((sum, sale) => sum + (sale.profit || 0), 0)
                )}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <GiProfit className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Return Money</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(
                  sales
                    .filter(
                      (s) => s.status === "Refunded" || s.status === "Canceled"
                    )
                    .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
                )}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg ">
              <TbWalletOff className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {sales.filter((s) => s.status === "Completed").length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FiUser className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Replace</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {sales.filter((s) => s.status === "Replace").length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TbReplaceFilled className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Refunded</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {sales.filter((s) => s.status === "Refunded").length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <MdFindReplace className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {sales.filter((s) => s.status === "Cancelled").length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <GiCancel className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg. Sale</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(
                  sales.length > 0
                    ? sales.reduce(
                        (sum, sale) => sum + (sale.totalAmount || 0),
                        0
                      ) / sales.length
                    : 0
                )}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiCalendar className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
