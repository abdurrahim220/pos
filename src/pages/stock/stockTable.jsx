import { FaEye } from "react-icons/fa";
import React, { useState } from "react";
import StockHistoryModal from "./StockHistoryModal.jsx";
import StockRequestsModal from "./StockRequestsModal.jsx";
import Barcode from "react-barcode";
import axiosClient from "../../api/axiosClient";

const StockTable = ({ totalStocks, limit, stocks, currentPage, onEdit }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState(null);

  const [printBarcode, setPrintBarcode] = useState(null);
  const [printQr, setPrintQr] = useState(null);

  const handleEditClick = (stockId) => {
    setSelectedStockId(stockId);
    setIsEditModalOpen(true);
  };

  const handleViewClick = (stockId) => {
    setSelectedStockId(stockId);
    setIsViewModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedStockId(null);
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

      if (!["increase", "decrease"].includes(action)) return;
      if (isNaN(quantity) || quantity <= 0) return;

      await onEdit(selectedStockId, { action, quantity, reason });
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
        `/frontend/br-codes/print?page=1&limit=1&search=${sku}`
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
        `/frontend/br-codes/qr/print?page=1&limit=1&search=${sku}`
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
          <tr className="bg-gray-100 text-gray-700">
            <th className="px-4 py-2">SL</th>
            <th className="px-4 py-2">Image</th>
            <th className="px-4 py-2">Product Name</th>
            <th className="px-4 py-2">Attributes</th>
            <th className="px-4 py-2">SKU</th>
            <th className="px-4 py-2">Current Stock</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {stocks?.length > 0 &&
            stocks?.map((stock, index) => (
              <tr key={stock._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{sirialFrom - index}</td>

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
                    className="w-12 h-12 rounded-lg border bg-white shadow-sm"
                  />
                </td>

                <td className="px-4 py-2 underline text-blue-600">
                  <a
                    href={`https://www.shoelicious.com.bd/product-detail/${stock.productSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {stock.productName}
                  </a>
                </td>

                <td className="px-4 py-2">
                  {stock.type === "simple"
                    ? stock?.productAttributes?.map((a) => a.values).join(" | ")
                    : stock?.variantDetails?.attributes
                        ?.map((a) => a.value)
                        .join(" | ")}
                </td>

                <td className="px-4 py-2">{stock.sku}</td>

                <td
                  className={`px-4 py-2 font-semibold ${
                    stock.currentStock <= 5 ? "text-red-600" : "text-gray-800"
                  }`}
                >
                  {stock.currentStock}
                </td>

                <td className="px-4 py-2 flex justify-center gap-2">
                  <button
                    onClick={() => handleViewClick(stock._id)}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded shadow"
                  >
                    <FaEye />
                  </button>

                  <button
                    onClick={() => handleEditClick(stock._id)}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded shadow"
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

      {/* Existing Modals */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded p-6 w-[420px]">
            <h2 className="text-xl font-bold mb-4">Edit Stock</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <select name="action" className="w-full border p-2">
                  <option value="increase">Increase</option>
                  <option value="decrease">Decrease</option>
                </select>
              </div>

              <div className="mb-4">
                <input
                  type="number"
                  name="quantity"
                  defaultValue="1"
                  min="1"
                  className="w-full border p-2"
                />
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  name="reason"
                  placeholder="Reason"
                  className="w-full border p-2"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewModalOpen && selectedStockId && (
        <StockHistoryModal
          summaryId={selectedStockId}
          onClose={closeViewModal}
        />
      )}

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
