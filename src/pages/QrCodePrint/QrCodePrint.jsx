import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import AdminLayoutWithAuth from "../../components/layout/SidebarLayout";
import Loading from "../../components/Loading";

const AdminQrCodesPrint = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [allQrCodes, setAllQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);
  const [selectedQrCodes, setSelectedQrCodes] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [printMode, setPrintMode] = useState("selected");
  const [filteredQrCodes, setFilteredQrCodes] = useState([]);
  // Layout configuration
  const [searchTerm, setSearchTerm] = useState("");

  const [layoutConfig, setLayoutConfig] = useState({
    // Screen view
    screenColumns: 6,
    screenGap: 8,

    // Print view
    printColumns: 4,
    printGap: 5,
    printCardWidth: 70,
    printCardHeight: 70,
    printMargin: 5,
    itemsPerPage: 30,

    // Paper
    printPaperSize: "A4",
    printOrientation: "portrait",

    // Printer type
    printerType: "a4", // "a4" | "label"
    labelWidth: 80, // mm – Xprinter XP-420B default
    labelGap: 3, // mm between labels
  });

  /* ------------------------------------------------------------------ */
  /*  API Calls                                                         */
  /* ------------------------------------------------------------------ */
  const fetchQrCodes = async (page = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const res = await axiosClient.get(
        `/frontend/br-codes/qr/print?page=${page}&limit=30&search=${searchTerm}`
      );
      const data = res.data;
      if (data.success) {
        // console.log(data.qrCodes);
        setQrCodes(data.qrCodes);
        setFilteredQrCodes(data.qrCodes);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setSelectedQrCodes(new Set());
        setSelectAll(false);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchAllQrCodesForPrint = async () => {
    try {
      const res = await axiosClient.get(
        `/frontend/br-codes/qr/print?limit=1000`
      );
      const data = res.data;
      if (data.success) {
        setAllQrCodes(data.qrCodes || []);
      }
    } catch (err) {
      console.error("Error fetching all qr codes:", err);
    }
  };

  useEffect(() => {
    fetchQrCodes(page, searchTerm);
  }, [page, searchTerm]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredQrCodes(qrCodes);
    } else {
      const filtered = qrCodes.filter((qrCode) =>
        String(qrCode.sku).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQrCodes(filtered);
    }
  }, [searchTerm, qrCodes]);

  /* ------------------------------------------------------------------ */
  /*  Selection helpers                                                 */
  /* ------------------------------------------------------------------ */
  const toggleQrCodeSelection = (sku) => {
    const newSelected = new Set(selectedQrCodes);
    if (newSelected.has(sku)) newSelected.delete(sku);
    else newSelected.add(sku);
    setSelectedQrCodes(newSelected);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedQrCodes(new Set());
    } else {
      const allSkus = qrCodes.map((b) => b.sku);
      setSelectedQrCodes(new Set(allSkus));
    }
    setSelectAll(!selectAll);
  };

  const getQrCodesToPrint = () => {
    switch (printMode) {
      case "selected":
        return allQrCodes.filter((b) => selectedQrCodes.has(b.sku));
      case "current":
        return qrCodes;
      case "all":
        return allQrCodes;
      default:
        return [];
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Paper / label dimensions                                          */
  /* ------------------------------------------------------------------ */
  const getPaperDimensions = () => {
    const { printPaperSize, printOrientation, printerType, labelWidth } =
      layoutConfig;

    if (printerType === "label") {
      return { width: labelWidth, height: null };
    }

    const paperSizes = {
      A4: { width: 210, height: 297 },
      Letter: { width: 216, height: 279 },
      Legal: { width: 216, height: 356 },
    };
    const paper = paperSizes[printPaperSize] || paperSizes.A4;
    const isLandscape = printOrientation === "landscape";

    return isLandscape
      ? { width: paper.height, height: paper.width }
      : { width: paper.width, height: paper.height };
  };

  /* ------------------------------------------------------------------ */
  /*  Layout fit check                                                  */
  /* ------------------------------------------------------------------ */
  const checkLayoutFit = () => {
    const {
      printerType,
      printColumns,
      printMargin,
      printGap,
      printCardWidth,
      printCardHeight,
      itemsPerPage,
      labelWidth,
    } = layoutConfig;

    if (printerType === "label") {
      const requiredWidth = printCardWidth + printMargin * 2;
      return {
        fitsWidth: requiredWidth <= labelWidth,
        fitsHeight: true,
        requiredWidth,
        requiredHeight: printCardHeight + printMargin * 2,
        pageWidth: labelWidth,
        pageHeight: null,
      };
    }

    const paper = getPaperDimensions();
    const requiredWidth =
      printCardWidth * printColumns +
      printGap * (printColumns - 1) +
      printMargin * 2;
    const rows = Math.ceil(itemsPerPage / printColumns);
    const requiredHeight =
      printCardHeight * rows + printGap * (rows - 1) + printMargin * 2;

    return {
      fitsWidth: requiredWidth <= paper.width,
      fitsHeight: requiredHeight <= paper.height,
      requiredWidth,
      requiredHeight,
      pageWidth: paper.width,
      pageHeight: paper.height,
    };
  };

  /* ------------------------------------------------------------------ */
  /*  Print handling                                                    */
  /* ------------------------------------------------------------------ */
  const handlePrint = async () => {
    if (printMode === "selected" && selectedQrCodes.size === 0) {
      alert("Please select at least one QR code to print");
      return;
    }

    const fitCheck = checkLayoutFit();
    if (!fitCheck.fitsWidth || !fitCheck.fitsHeight) {
      const proceed = window.confirm(
        `Layout may not fit!\n\n` +
          `Required: ${fitCheck.requiredWidth.toFixed(
            1
          )}mm × ${fitCheck.requiredHeight.toFixed(1)}mm\n` +
          `Page: ${fitCheck.pageWidth}mm × ${
            fitCheck.pageHeight || "auto"
          }mm\n\nProceed anyway?`
      );
      if (!proceed) return;
    }

    setIsPrinting(true);
    if (printMode === "all" || printMode === "selected") {
      await fetchAllQrCodesForPrint();
    }
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 600);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };
  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const updateLayoutConfig = (key, value) => {
    setLayoutConfig((prev) => ({ ...prev, [key]: value }));
  };

  /* ------------------------------------------------------------------ */
  /*  Auto-adjust card size                                             */
  /* ------------------------------------------------------------------ */
  const calculateOptimalCardSize = () => {
    const {
      printPaperSize,
      printOrientation,
      printColumns,
      printMargin,
      printGap,
      itemsPerPage,
      printerType,
      labelWidth,
    } = layoutConfig;

    if (printerType === "label") {
      const available = labelWidth - printMargin * 2;
      const size = Math.floor(available * 0.92); // 92% of width → square
      return { width: size, height: size };
    }

    const paper = getPaperDimensions();
    const availableWidth = paper.width - printMargin * 2;
    const availableHeight = paper.height - printMargin * 2;

    const cardWidth = Math.floor(
      (availableWidth - printGap * (printColumns - 1)) / printColumns
    );
    const rows = Math.ceil(itemsPerPage / printColumns);
    const cardHeight = Math.floor(
      (availableHeight - printGap * (rows - 1)) / rows
    );

    return {
      width: Math.min(cardWidth, cardHeight),
      height: Math.min(cardWidth, cardHeight),
    };
  };

  const applyOptimalSize = () => {
    const optimal = calculateOptimalCardSize();
    setLayoutConfig((prev) => ({
      ...prev,
      printCardWidth: optimal.width,
      printCardHeight: optimal.height,
    }));
  };

  /* ------------------------------------------------------------------ */
  /*  Print CSS (the only part that changed for centering)              */
  /* ------------------------------------------------------------------ */
  const getPrintStyles = () => {
    const {
      printerType,
      printColumns,
      printGap,
      printCardWidth,
      printCardHeight,
      printMargin,
      printPaperSize,
      printOrientation,
      labelWidth,
      labelGap,
    } = layoutConfig;

    const pageCss =
      printerType === "label"
        ? `@page { size: ${labelWidth}mm auto; margin: ${printMargin}mm; }`
        : `@page { size: ${printPaperSize} ${printOrientation}; margin: ${printMargin}mm !important; }`;

    const gridCss =
      printerType === "label"
        ? ""
        : `
        .printable-page {
          display: grid;
          grid-template-columns: repeat(${printColumns}, 1fr);
          grid-auto-rows: ${printCardHeight}mm;
          gap: ${printGap}mm;
          align-content: start;
          page-break-after: always;
          page-break-inside: avoid;
        }`;

    const labelSpecific =
      printerType === "label"
        ? `
      .printable-page {
        page-break-after: always;
        padding: ${labelGap}mm 0;
        height: auto !important;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
      }
      .price-tag {
        margin-bottom: ${labelGap}mm;
        width: ${printCardWidth}mm !important;
        height: ${printCardHeight}mm !important;
        padding: 0 !important;
        border: 1px solid #000 !important;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 2mm;
        background: white !important;
        page-break-inside: avoid;
      }
      .sku-text {
        margin: 1mm 0 0 0 !important;
        font-size: 12pt !important;
        font-weight: 500;
        text-align: center;
        width: 100%;
        word-break: break-all;
        line-height: 1.2;
      }
      .qr-container {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 1mm;
        box-sizing: border-box;
      }
      .qr-code {
        width: 100% !important;
        height: 100% !important;
        max-width: 100% !important;
        max-height: 100% !important;
        object-fit: contain;
      }
    `
        : "";

    return `
      @media print {
        ${pageCss}

        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: auto !important;
          background: white !important;
        }

        body * { visibility: hidden; }
        .printable-section, .printable-section * { visibility: visible; }
        .printable-section { position: absolute; left: 0; top: 0; width: 100%; }

        .no-print { display: none !important; }

        ${gridCss}
        ${labelSpecific}

        /* A4/Letter grid cards */
        .price-tag {
          width: ${printCardWidth}mm !important;
          height: ${printCardHeight}mm !important;
          border: 1px solid #000 !important;
          padding: 1mm !important;
          background: white !important;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          page-break-inside: avoid;
          break-inside: avoid;
          font-size: 8pt !important;
          gap: 1mm;
        }

        .qr-code {
          width: 100% !important;
          height: auto !important;
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: contain;
        }

        .sku-text {
          font-size: 6pt !important;
          margin-bottom: 1mm !important;
          text-align: center;
          word-break: break-all;
        }

        .print-config-summary, .size-warning { display: none !important; }
      }

      @media screen {
        .print-only { display: none !important; }
        .print-config-summary { display: block !important; }
      }
    `;
  };

  /* ------------------------------------------------------------------ */
  /*  Split into pages (one label per page when using label printer)    */
  /* ------------------------------------------------------------------ */
  const splitIntoPages = (codes, itemsPerPage) => {
    if (layoutConfig.printerType === "label") {
      return codes.map((c) => [c]); // one QR per page
    }
    const pages = [];
    for (let i = 0; i < codes.length; i += itemsPerPage) {
      pages.push(codes.slice(i, i + itemsPerPage));
    }
    return pages;
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  if (loading)
    return (
      <AdminLayoutWithAuth>
        <Loading />
      </AdminLayoutWithAuth>
    );

  const qrCodesToPrint = isPrinting ? getQrCodesToPrint() : [];
  const selectedCount = selectedQrCodes.size;
  const printPages = splitIntoPages(qrCodesToPrint, layoutConfig.itemsPerPage);
  const fitCheck = checkLayoutFit();
  const optimalSize = calculateOptimalCardSize();

  const screenGridClass = `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-${Math.min(
    8,
    layoutConfig.screenColumns
  )} xl:grid-cols-${Math.min(12, layoutConfig.screenColumns)} gap-${
    layoutConfig.screenGap / 4
  }`;

  return (
    <AdminLayoutWithAuth>
      <div className="p-4 bg-gray-100 min-h-screen">
        <style>{getPrintStyles()}</style>

        {/* ====================  CONTROL PANEL  ==================== */}
        <div className="no-print mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">QR Codes Print</h1>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                disabled={
                  isPrinting ||
                  (printMode === "selected" && selectedCount === 0)
                }
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {isPrinting ? "Preparing..." : "Print"}
              </button>
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={handleNext}
                disabled={page === totalPages}
                className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {/* Print mode */}
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Print:</span>
              <select
                value={printMode}
                onChange={(e) => setPrintMode(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="selected">
                  Selected Items ({selectedCount})
                </option>
                <option value="current">Current Page ({qrCodes.length})</option>
                <option value="all">All Items</option>
              </select>
            </div>
            {printMode === "selected" && (
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectAll}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {selectAll ? "Deselect All" : "Select All"} on Page
                </button>
                <span className="text-sm text-gray-600">
                  {selectedCount} selected
                </span>
              </div>
            )}
          </div>

          {/* Layout customisation */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Layout Customization</h3>

            {/* Fit warning */}
            {(!fitCheck.fitsWidth || !fitCheck.fitsHeight) && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center">
                  <span className="text-yellow-600 mr-2">Warning</span>
                  <span className="text-yellow-800 font-medium">
                    Layout may not fit!
                  </span>
                </div>
                <div className="text-sm text-yellow-700 mt-1">
                  Required: {fitCheck.requiredWidth.toFixed(1)}mm ×{" "}
                  {fitCheck.requiredHeight.toFixed(1)}mm | Page:{" "}
                  {fitCheck.pageWidth}mm × {fitCheck.pageHeight || "auto"}mm
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Screen view */}
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">Screen View</h4>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Columns
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={layoutConfig.screenColumns}
                    onChange={(e) =>
                      updateLayoutConfig(
                        "screenColumns",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Gap (px)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="32"
                    value={layoutConfig.screenGap}
                    onChange={(e) =>
                      updateLayoutConfig("screenGap", parseInt(e.target.value))
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>

              {/* Print view */}
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">Print View</h4>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Columns
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={layoutConfig.printColumns}
                    onChange={(e) =>
                      updateLayoutConfig(
                        "printColumns",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    disabled={layoutConfig.printerType === "label"}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Gap (mm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={layoutConfig.printGap}
                    onChange={(e) =>
                      updateLayoutConfig("printGap", parseInt(e.target.value))
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    disabled={layoutConfig.printerType === "label"}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Items Per Page
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={layoutConfig.itemsPerPage}
                    onChange={(e) =>
                      updateLayoutConfig(
                        "itemsPerPage",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    disabled={layoutConfig.printerType === "label"}
                  />
                </div>
              </div>

              {/* Card size */}
              <div className="space-y-2">
                <h4 className="font-medium text-purple-600">Card Size (mm)</h4>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Width
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={layoutConfig.printCardWidth}
                    onChange={(e) =>
                      updateLayoutConfig(
                        "printCardWidth",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Height
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={layoutConfig.printCardHeight}
                    onChange={(e) =>
                      updateLayoutConfig(
                        "printCardHeight",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={applyOptimalSize}
                    className="text-blue-600 text-sm font-medium hover:text-blue-800"
                  >
                    Auto-adjust
                  </button>
                  <span className="text-xs text-gray-500">
                    Optimal: {optimalSize.width}×{optimalSize.height}mm
                  </span>
                </div>
              </div>

              {/* Printer / Media */}
              <div className="space-y-2">
                <h4 className="font-medium text-orange-600">Printer / Media</h4>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Printer Type
                  </label>
                  <select
                    value={layoutConfig.printerType}
                    onChange={(e) =>
                      updateLayoutConfig("printerType", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="a4">A4 / Letter / Legal (Sheet)</option>
                    <option value="label">Xprinter XP-420B (Label Roll)</option>
                  </select>
                </div>

                {layoutConfig.printerType === "a4" ? (
                  <>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Paper Size
                      </label>
                      <select
                        value={layoutConfig.printPaperSize}
                        onChange={(e) =>
                          updateLayoutConfig("printPaperSize", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="A4">A4</option>
                        <option value="Letter">Letter</option>
                        <option value="Legal">Legal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Orientation
                      </label>
                      <select
                        value={layoutConfig.printOrientation}
                        onChange={(e) =>
                          updateLayoutConfig("printOrientation", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Label Width (mm)
                      </label>
                      <input
                        type="number"
                        min="40"
                        max="110"
                        value={layoutConfig.labelWidth}
                        onChange={(e) =>
                          updateLayoutConfig(
                            "labelWidth",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Gap Between Labels (mm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={layoutConfig.labelGap}
                        onChange={(e) =>
                          updateLayoutConfig(
                            "labelGap",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Margin (mm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={layoutConfig.printMargin}
                    onChange={(e) =>
                      updateLayoutConfig(
                        "printMargin",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Print summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded print-config-summary">
              <h4 className="font-medium mb-2">Print Summary:</h4>
              <div className="text-sm text-gray-600 grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  Printer:{" "}
                  {layoutConfig.printerType === "label"
                    ? "Xprinter XP-420B"
                    : layoutConfig.printPaperSize}
                </div>
                <div>
                  Size: {layoutConfig.printCardWidth}×
                  {layoutConfig.printCardHeight}mm
                </div>
                <div>
                  {layoutConfig.printerType === "label"
                    ? "1 per label"
                    : `${layoutConfig.printColumns} cols`}
                </div>
                <div>
                  Fit:{" "}
                  {fitCheck.fitsWidth && fitCheck.fitsHeight ? "Yes" : "No"}
                </div>
              </div>
              {(printMode === "all" || printMode === "selected") && (
                <div className="text-sm text-green-600 mt-2">
                  {qrCodesToPrint.length} QR codes → {printPages.length}{" "}
                  label(s)
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Search */}
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
              Found {filteredQrCodes.length} product(s) matching "{searchTerm}"
            </div>
          )}
        </div>
        {/* Page indicator */}
        <div className="no-print text-center text-sm text-gray-600 mb-3">
          Page {page} of {totalPages} | Screen: {layoutConfig.screenColumns}{" "}
          cols
        </div>

        {/* ====================  PRINT CONTENT  ==================== */}
        {isPrinting ? (
          <div className="printable-section">
            {printPages.map((pageCodes, pageIndex) => (
              <div key={pageIndex} className="printable-page">
                {pageCodes.map((b, idx) => (
                  <div key={`${pageIndex}-${idx}`} className="price-tag">
                    <p className="sku-text text-gray-600 font-mono">{b.sku}</p>
                    <div className="qr-container">
                      <img
                        src={b.qrCodeImage}
                        alt={`QR Code for ${b.productName}`}
                        className="qr-code"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          /* ====================  SCREEN VIEW  ==================== */
          <div className={screenGridClass}>
            {filteredQrCodes.map((b, idx) => (
              <div className="flex flex-col gap-2  p-2">
                <a
                  target="_blank"
                  href={`https://www.shoelicious.com.bd/product-detail/${b.slug}`}
                  className="sku-text text-gray-600 font-mono text-xs mb-2 truncate underline"
                >
                  {b.productName}
                </a>
                <div
                  key={idx}
                  className={`bg-white border rounded-sm p-2 text-center cursor-pointer transition-all ${
                    selectedQrCodes.has(b.sku)
                      ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() =>
                    printMode === "selected" && toggleQrCodeSelection(b.sku)
                  }
                >
                  {printMode === "selected" && (
                    <div className="flex justify-between items-start mb-1">
                      <input
                        type="checkbox"
                        checked={selectedQrCodes.has(b.sku)}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}

                  <p className="sku-text text-gray-600 font-mono text-xs mb-2 truncate">
                    {b.sku}
                  </p>

                  <div className="flex-1 flex items-center justify-center">
                    <img
                      src={b.qrCodeImage}
                      alt={`QR Code for ${b.productName}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayoutWithAuth>
  );
};

export default AdminQrCodesPrint;
