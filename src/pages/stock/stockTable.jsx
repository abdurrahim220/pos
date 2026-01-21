import { Eye } from "lucide-react";
import React, { useState } from "react";
import StockHistoryModal from "./StockHistoryModal";
import StockRequestsModal from "./stockrequestModal"; // ✅ New Import
import Barcode from "react-barcode";
import axiosClient from "../../api/axiosClient";

const StockTable = ({ totalStocks, limit, stocks, currentPage, onEdit }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false); // ✅ New state
  const [selectedStockId, setSelectedStockId] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);

  const [printBarcode, setPrintBarcode] = useState(null);
  const [printQr, setPrintQr] = useState(null);

  const handleEditClick = (stock) => {
    setSelectedStockId(stock._id);
    setSelectedStock(stock);
    setIsEditModalOpen(true);
  };

  const handleViewClick = (stockId) => {
    setSelectedStockId(stockId);
    setIsViewModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedStockId(null);
    setSelectedStock(null);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedStockId(null);
  };

  const closeRequestModal = () => {
    setIsRequestModalOpen(false);
    setSelectedStockId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const action = formData.get("action");
      const quantity = parseInt(formData.get("quantity"), 10);
      const reason = formData.get("reason");
      const branchId = formData.get("branchId");

      if (!["increase", "decrease"].includes(action)) {
        console.error("Invalid action:", action);
        return;
      }
      if (isNaN(quantity) || quantity <= 0) {
        console.error("Invalid quantity:", quantity);
        return;
      }

      await onEdit(selectedStockId, {
        action,
        quantity,
        reason,
        branchId: branchId || null,
      });
      closeEditModal();
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  const sirialFrom = totalStocks - limit * (currentPage - 1);

  /* ================================
      BARCODE PRINT
  =================================*/
  const handlePrintBarcode = async (sku) => {
    try {
      const res = await axiosClient.get(
        `/frontend/br-codes/print?page=1&limit=1&search=${sku}`,
      );

      if (!res.data.success || res.data.barcodes.length === 0) {
        alert("No barcode found for this SKU");
        return;
      }

      const data = res.data.barcodes[0];
      setPrintBarcode(data);

      setTimeout(() => {
        const printContent = document.getElementById("barcode-print-area");
        const w = window.open("", "_blank");

        w.document.write(`
          <html>
            <head>
              <title>Barcode Print</title>
              <style>
                @media print {
                  @page { size: 58mm 25mm; margin: 0 }
                  body {
                    margin: 0;
                    padding: 0;
                    width: 58mm;
                    height: 25mm;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: Arial;
                  }
                  .label { width:100%; text-align:center; padding:2mm }
                }
              </style>
            </head>
            <body>${printContent.innerHTML}</body>
          </html>
        `);

        w.document.close();
        w.focus();

        w.onafterprint = () => w.close();
        w.print();
      }, 400);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================================
      QR PRINT
  =================================*/
  const handlePrintQr = async (sku) => {
    try {
      const res = await axiosClient.get(
        `/frontend/br-codes/qr/print?page=1&limit=1&search=${sku}`,
      );

      if (!res.data.success || res.data.qrCodes.length === 0) {
        alert("No QR found for this SKU");
        return;
      }

      const data = res.data.qrCodes[0];
      setPrintQr(data);

      setTimeout(() => {
        const printContent = document.getElementById("qr-print-area");
        const w = window.open("", "_blank");

        w.document.write(`
          <html>
            <head>
              <title>QR Print</title>
              <style>
                @media print {
                  @page { 
                    size: 58mm 25mm; 
                    margin: 0;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                    width: 58mm;
                    height: 25mm;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: Arial, sans-serif;
                    overflow: hidden;
                  }
                  .label { 
                    width: 100%; 
                    height: 100%;
                    text-align: center; 
                    padding: 1mm;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                  }
                  img { 
                    max-width: 45mm !important;
                    max-height: 15mm !important;
                    width: auto !important;
                    height: auto !important;
                    object-fit: contain !important;
                  }
                  * {
                    box-sizing: border-box;
                  }
                }
              </style>
            </head>
            <body>${printContent.innerHTML}</body>
          </html>
        `);

        w.document.close();
        w.focus();

        w.onafterprint = () => w.close();
        w.print();
      }, 400);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 ">
            <th className="px-4 py-2 ">SL</th>
            <th className="px-4 py-2 ">Image</th>
            <th className="px-4 py-2">Product Name</th>
            <th className="px-4 py-2">Attributes</th>
            <th className="px-4 py-2">SKU</th>
            <th className="px-4 py-2">Current Stock</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {stocks?.length > 0 &&
            stocks?.map((stock, index) => (
              <tr key={stock._id} className="border-b">
                <td className="px-4 py-2">{sirialFrom - index}</td>
                <td className="px-4 py-3">
                  <img
                    style={{ objectFit: "contain" }}
                    src={
                      stock?.type === "simple"
                        ? stock?.images?.[0]?.small?.url ||
                          stock?.images?.[0]?.small
                        : stock?.variantDetails?.images?.[0]?.small?.url ||
                          stock?.variantDetails?.images?.[0]?.small ||
                          stock?.images?.[0]?.small
                    }
                    alt=""
                    className="w-12 h-12  object-contain"
                  />
                </td>
                <td className="px-4 py-2 underline">
                  <a
                    href={`https://www.shoelicious.com.bd/product-detail/${stock.productSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {stock.productName || "N/A"}
                  </a>
                </td>
                <td className="px-4 py-2">
                  {stock.type === "simple"
                    ? stock?.productAttributes
                        ?.map((atrr) => atrr.values)
                        .join(" | ")
                    : stock.variantDetails?.attributes
                        ?.map((atrr) => atrr.value)
                        .join(" | ") || "N/A"}
                </td>
                <td className="px-4 py-2">{stock.sku || "N/A"}</td>
                <td className="px-4 py-2">
                  <div>{stock.currentStock || 0}</div>
                  {stock.branches && stock.branches.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {stock.branches.map((b, idx) => (
                        <div key={idx}>
                          {b.branchName}: {b.branchStock}
                        </div>
                      ))}
                    </div>
                  )}
                </td>

                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => handleViewClick(stock._id)}
                    className="px-2 py-2 bg-green-500 text-white rounded-md"
                  >
                    <Eye />
                  </button>
                  <button
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
                    onClick={() => handleEditClick(stock)}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handlePrintBarcode(stock.sku)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded shadow"
                  >
                    BrCode
                  </button>
                  <button
                    onClick={() => handlePrintQr(stock.sku)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded shadow"
                  >
                    QRCode
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* ================= BARCODE PRINT TEMPLATE ================= */}
      <div id="barcode-print-area" style={{ display: "none" }}>
        {printBarcode && (
          <div className="label">
            <div
              style={{
                fontWeight: "bold",
                fontSize: "12px",
                marginBottom: "1px",
                lineHeight: "1.1",
              }}
            >
              Shoelicious
            </div>
            <div
              style={{
                fontWeight: "bold",
                fontSize: "9px",
                marginBottom: "1px",
                lineHeight: "1.1",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >
              {printBarcode.productName}
            </div>
            <div
              style={{
                fontSize: "10px",
                marginBottom: "2px",
                fontWeight: "bold",
                color: "#000",
              }}
            >
              Price: Tk. {printBarcode.productPrice}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto",
              }}
            >
              <Barcode
                value={String(printBarcode.sku)}
                width={1.4}
                height={30}
                fontSize={8}
                margin={0}
                displayValue={true}
                format="CODE128"
              />
            </div>
          </div>
        )}
      </div>

      {/* ================= QR PRINT TEMPLATE ================= */}
      <div id="qr-print-area" style={{ display: "none" }}>
        {printQr && (
          <div className="label">
            <div
              style={{
                fontWeight: "bold",
                fontSize: "12px",
                marginBottom: "1px",
                lineHeight: "1.1",
              }}
            >
              Shoelicious
            </div>
            <div
              style={{
                fontWeight: "bold",
                fontSize: "9px",
                marginBottom: "2px",
                lineHeight: "1.1",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >
              {printQr.productName}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                maxHeight: "15mm",
                overflow: "hidden",
              }}
            >
              <img
                src={printQr.qrCodeImage}
                alt="QR Code"
                style={{
                  maxWidth: "45mm",
                  maxHeight: "15mm",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </div>

            <div
              style={{
                fontSize: "10px",
                marginTop: "1px",
                fontWeight: "bold",
              }}
            >
              {printQr.sku}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white  rounded-lg p-6 w-[400px]">
            <h2 className="text-xl font-bold mb-4">Edit Stock</h2>
            <form onSubmit={handleSubmit}>
              {selectedStock?.branches && selectedStock.branches.length > 0 && (
                <div className="mb-4">
                  <label
                    htmlFor="branchId"
                    className="block text-sm font-medium"
                  >
                    Branch
                  </label>
                  <select
                    id="branchId"
                    name="branchId"
                    className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
                    required
                  >
                    <option value="">Select Branch</option>
                    {selectedStock.branches.map((branch) => (
                      <option key={branch.branchId} value={branch.branchId}>
                        {branch.branchName} (Current: {branch.branchStock})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="action" className="block text-sm font-medium">
                  Action
                </label>
                <select
                  id="action"
                  name="action"
                  defaultValue="increase"
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
                  required
                >
                  <option value="increase">Increase</option>
                  <option value="decrease">Decrease</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="quantity" className="block text-sm font-medium">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  defaultValue="1"
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="reason" className="block text-sm font-medium">
                  Reason
                </label>
                <input
                  type="text"
                  id="reason"
                  name="reason"
                  placeholder="Enter reason for stock change"
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="bg-danger-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Stock History Modal */}
      {isViewModalOpen && selectedStockId && (
        <StockHistoryModal
          summaryId={selectedStockId}
          onClose={closeViewModal}
        />
      )}

      {/* Stock Requests Modal */}
      {isRequestModalOpen && selectedStockId && (
        <StockRequestsModal
          stockId={selectedStockId}
          onClose={closeRequestModal}
        />
      )}
    </>
  );
};

export default StockTable;
