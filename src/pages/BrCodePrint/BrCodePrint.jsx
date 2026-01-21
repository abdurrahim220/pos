import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import AdminLayoutWithAuth from "../../components/layout/SidebarLayout";
import Loading from "../../components/Loading";
import Barcode from "react-barcode";

const AdminBarcodesPrint = () => {
  const [barcodes, setBarcodes] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filteredBarcodes, setFilteredBarcodes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  // Professional settings optimized for Xprinter XP-420B
  const [printSettings, setPrintSettings] = useState({
    copies: 1,
    paperWidth: 58,
    barcodeWidth: 1.2,
    barcodeHeight: 30,
    fontSize: 8,
    titleFontSize: 12,
    productFontSize: 9,
    priceFontSize: 10,
    labelHeight: 25,
  });

  // console.log(searchTerm);
  // Fetch barcodes
  const fetchBarcodes = async (page = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const res = await axiosClient.get(
        `/frontend/br-codes/print?page=${page}&limit=30&search=${searchTerm}`
      );
      const data = res.data;
      // console.log(data)
      if (data.success) {
        setBarcodes(data.barcodes);
        setPage(data.page);
        setFilteredBarcodes(data.barcodes);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch barcodes:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBarcodes(page, searchTerm);
  }, [page, searchTerm]);
  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBarcodes(barcodes);
    } else {
      const filtered = barcodes.filter((barcode) =>
        String(barcode.sku).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBarcodes(filtered);
    }
  }, [searchTerm, barcodes]);


  const handleSelect = (sku) => {
    setSelected((prev) =>
      prev.includes(sku) ? prev.filter((id) => id !== sku) : [...prev, sku]
    );
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };
  const handleSelectAll = () => {
    if (selected.length === barcodes.length) {
      setSelected([]);
    } else {
      setSelected(barcodes.map((b) => b.sku));
    }
  };

  const filtered = barcodes.filter((b) => selected.includes(b.sku));

  const handlePrint = () => {
    if (filtered.length === 0) {
      alert("Please select at least one barcode to print.");
      return;
    }

    const printContent = document.getElementById("print-area-thermal");
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcodes - Xprinter XP-420B</title>
          <style>
            @media print {
              @page {
                margin: 0;
                padding: 0;
                size: ${printSettings.paperWidth}mm ${printSettings.labelHeight}mm;
              }
              body {
                margin: 0;
                padding: 0;
                width: ${printSettings.paperWidth}mm;
                height: ${printSettings.labelHeight}mm;
                font-family: Arial, sans-serif;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .barcode-label {
                width: ${printSettings.paperWidth}mm;
                height: ${printSettings.labelHeight}mm;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 1mm;
                page-break-after: always;
              }
              * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handlePrintSettingsChange = (key, value) => {
    setPrintSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Generate print data with copies
  const getPrintData = () => {
    const printData = [];
    filtered.forEach((barcode) => {
      for (let i = 0; i < printSettings.copies; i++) {
        printData.push(barcode);
      }
    });
    return printData;
  };

  if (loading)
    return (
      <AdminLayoutWithAuth>
        <Loading />
      </AdminLayoutWithAuth>
    );

  return (
    <AdminLayoutWithAuth>
      {/* Screen UI (hidden during print) */}
      <div className="print:hidden p-4 bg-gray-100 min-h-screen">
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                🏷️ Barcode Printing
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Thermal Printer:{" "}
                <span className="font-semibold">Xprinter XP-420B</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {printSettings.paperWidth}mm Paper
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                disabled={selected.length === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                🖨️ Print Labels ({getPrintData().length})
              </button>
              <button
                onClick={() => setPage(page > 1 ? page - 1 : 1)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
                disabled={page === 1}
              >
                ◀ Previous
              </button>
              <button
                onClick={() => setPage(page < totalPages ? page + 1 : page)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
                disabled={page === totalPages}
              >
                Next ▶
              </button>
            </div>
          </div>

          {/* Print Settings Panel */}
          {/* Print Settings Panel */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg text-blue-900">
                Print Configuration
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Paper Width Input */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  📏 Paper Width (mm)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  step="1"
                  value={printSettings.paperWidth}
                  onChange={(e) =>
                    handlePrintSettingsChange(
                      "paperWidth",
                      Math.max(1, parseInt(e.target.value) || 58)
                    )
                  }
                  className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter paper width"
                />
                <span className="text-xs text-gray-500">40-120mm</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  📋 Copies per Label
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={printSettings.copies}
                  onChange={(e) =>
                    handlePrintSettingsChange(
                      "copies",
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  }
                  className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  📐 Label Height (mm)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={printSettings.labelHeight}
                  onChange={(e) =>
                    handlePrintSettingsChange(
                      "labelHeight",
                      Math.max(1, parseInt(e.target.value) || 25)
                    )
                  }
                  className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                <div className="text-sm text-blue-600 bg-blue-100 px-3 py-2 rounded w-full">
                  <div className="font-semibold">Label Size:</div>
                  <div>
                    {printSettings.paperWidth}mm × {printSettings.labelHeight}mm
                  </div>
                </div>
              </div>
            </div>

            {/* Barcode Settings */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-blue-200 pt-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Barcode Width
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="30"
                  step="0.1"
                  value={printSettings.barcodeWidth}
                  onChange={(e) =>
                    handlePrintSettingsChange(
                      "barcodeWidth",
                      Math.max(0.5, parseFloat(e.target.value) || 1.2)
                    )
                  }
                  className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Barcode Height
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  step="1"
                  value={printSettings.barcodeHeight}
                  onChange={(e) =>
                    handlePrintSettingsChange(
                      "barcodeHeight",
                      Math.max(1, parseInt(e.target.value) || 30)
                    )
                  }
                  className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Barcode Font Size
                </label>
                <input
                  type="number"
                  min="1"
                  max="240"
                  step="1"
                  value={printSettings.fontSize}
                  onChange={(e) =>
                    handlePrintSettingsChange(
                      "fontSize",
                      Math.max(6, parseInt(e.target.value) || 8)
                    )
                  }
                  className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Title Font Size
                </label>
                <input
                  type="number"
                  min="1"
                  max="240"
                  step="1"
                  value={printSettings.titleFontSize}
                  onChange={(e) =>
                    handlePrintSettingsChange(
                      "titleFontSize",
                      Math.max(1, parseInt(e.target.value) || 12)
                    )
                  }
                  className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Additional Font Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Product Font Size
                </label>
                <input
                  type="number"
                  min="1"
                  max="140"
                  step="1"
                  value={printSettings.productFontSize}
                  onChange={(e) =>
                    handlePrintSettingsChange(
                      "productFontSize",
                      Math.max(1, parseInt(e.target.value) || 9)
                    )
                  }
                  className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Price Font Size
                </label>
                <input
                  type="number"
                  min="1"
                  max="160"
                  step="1"
                  value={printSettings.priceFontSize}
                  onChange={(e) =>
                    handlePrintSettingsChange(
                      "priceFontSize",
                      Math.max(1, parseInt(e.target.value) || 10)
                    )
                  }
                  className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() =>
                    setPrintSettings({
                      copies: 1,
                      paperWidth: 58,
                      barcodeWidth: 1.2,
                      barcodeHeight: 30,
                      fontSize: 8,
                      titleFontSize: 12,
                      productFontSize: 9,
                      priceFontSize: 10,
                      labelHeight: 25,
                    })
                  }
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded transition-colors text-sm font-medium"
                >
                  🔄 Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-center text-sm text-gray-600 bg-white px-3 py-2 rounded shadow-sm">
            <span className="font-semibold">Page {page}</span> of {totalPages} •
            <span className="mx-2">•</span>
            <span className="font-semibold">{barcodes.length}</span> products
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-sm text-gray-600 bg-white px-3 py-2 rounded shadow-sm">
              <span className="font-semibold text-blue-600">
                {selected.length}
              </span>{" "}
              selected •
              <span className="font-semibold text-blue-600 ml-1">
                {getPrintData().length}
              </span>{" "}
              labels
            </span>
            <button
              onClick={handleSelectAll}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded transition-colors shadow-sm font-medium"
            >
              {selected.length === barcodes.length
                ? "✗ Deselect All"
                : "✓ Select All"}
            </button>
          </div>
        </div>
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by SKU..."
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-600">
              Found {filteredBarcodes.length} product(s) matching "{searchTerm}"
            </div>
          )}
        </div>

        {/* Barcode Grid */}
        {filteredBarcodes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? "No products found" : "No products available"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? `No products found matching "${searchTerm}". Try a different SKU.`
                : "There are no products to display on this page."}
            </p>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {filteredBarcodes.map((b) => (
              <div
                key={b.sku}
                className={`border-2 border-gray-200 p-3 rounded-lg cursor-pointer transition-all bg-white shadow-sm hover:shadow-md ${
                  selected.includes(b.sku)
                    ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50"
                    : "hover:border-blue-300"
                }`}
                onClick={() => handleSelect(b.sku)}
              >
                <div className="text-center mb-2">
                  <p className="font-bold text-gray-800 text-sm mb-1">
                    Shoelicious
                  </p>
                  <p className="text-xs font-semibold text-gray-700 truncate mb-1">
                    {b.productName}
                  </p>
                  <p className="text-xs text-blue-600 font-bold mb-2">
                    Tk. {b.productPrice}
                  </p>
                  <p className="text-xs text-gray-500 font-mono bg-gray-100 p-1 rounded">
                    {String(b.sku)}
                  </p>
                </div>
                <div className="flex justify-center scale-90">
                  <Barcode
                    value={String(b.sku)}
                    width={printSettings.barcodeWidth}
                    height={40}
                    fontSize={printSettings.fontSize}
                    displayValue={true}
                    format="CODE128"
                  />
                </div>
                {selected.includes(b.sku) && (
                  <div className="text-center mt-2 text-xs font-semibold text-blue-600 bg-blue-100 py-1 rounded">
                    {printSettings.copies} copy
                    {printSettings.copies > 1 ? "ies" : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRINT-ONLY AREA - Optimized for thermal printer */}
      <div id="print-area-thermal" className="screen:hidden">
        {getPrintData().map((b, index) => (
          <div
            key={`${b.sku}-${index}`}
            className="barcode-label"
            style={{
              width: `${printSettings.paperWidth}mm`,
              height: `${printSettings.labelHeight}mm`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "1mm",
              fontFamily: "Arial, sans-serif",
              pageBreakAfter: "always",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: `${printSettings.titleFontSize}px`,
                marginBottom: "1px",
                lineHeight: "1.1",
              }}
            >
              Shoelicious
            </div>
            <div
              style={{
                fontWeight: "bold",
                fontSize: `${printSettings.productFontSize}px`,
                marginBottom: "1px",
                lineHeight: "1.1",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >
              {b.productName}
            </div>
            <div
              style={{
                fontSize: `${printSettings.priceFontSize}px`,
                marginBottom: "2px",
                fontWeight: "bold",
                color: "#000",
              }}
            >
              Price: Tk. {b.productPrice}
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
                value={b.sku}
                width={printSettings.barcodeWidth}
                height={printSettings.barcodeHeight}
                fontSize={printSettings.fontSize}
                margin={0}
                displayValue={true}
                format="CODE128"
              />
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @media screen {
          .screen\\:hidden {
            display: none !important;
          }
        }
        @media print {
          body,
          html {
            margin: 0 !important;
            padding: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            margin: 0;
            padding: 0;
            size: ${printSettings.paperWidth}mm ${printSettings.labelHeight}mm;
          }
        }
      `}</style>
    </AdminLayoutWithAuth>
  );
};

export default AdminBarcodesPrint;
