import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import AdminLayoutWithAuth from "../../components/layout/SidebarLayout";
import axiosClient from "../../api/axiosClient";
import { useSelector } from "react-redux";
import { IoCartOutline } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import { FaUserEdit } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";

const extractSkuFromInput = (raw) => {
  const input = raw.trim();
  if (!input) return null;

  if (/^[a-zA-Z0-9-_]{3,50}$/.test(input)) return input;

  return null;
};

const POS = () => {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cart, setCart] = useState([]);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("fixed");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const inputRef = useRef(null);
  const user = useSelector((state) => state.auth.user);

  const [saleToPrint, setSaleToPrint] = useState(null);

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

  const totalQuantity = cart.reduce((s, i) => s + i.quantity, 0);
  const subTotal = cart.reduce((s, i) => s + i.subtotal, 0);

  // Calculate total purchase cost
  const totalPurchaseCost = cart.reduce(
    (s, i) => s + i.product.purchasePrice * i.quantity,
    0
  );

  // Calculate discount amount based on type
  const discountAmount =
    discountType === "percent" ? (subTotal * discount) / 100 : discount;

  // Final total
  const totalAmount = subTotal - discountAmount;

  // Calculate profit
  const profit = totalAmount - totalPurchaseCost;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fetchAndAdd = useCallback(async (sku) => {
    try {
      const { data } = await axiosClient.get(`/frontend/br-codes/pos/${sku}`);
      if (!data.success || !data.data) {
        toast.error(data.message || "Product not found");
        return;
      }

      const product = {
        id: data.data.productId,
        name: data.data.productName,
        salePrice: data.data.salePrice ?? 0,
        purchasePrice: data.data.purchasePrice ?? 0,
        stock: data.data.currentStock ?? 0,
        barcode: data.data.brCode,
        sku: data.data.sku,
        productImage: data.data.productImage,
        isVariation: data.data.isVariation ?? false,
        variationAttributesValue:
          data.data.variationAttributes?.[0]?.value || "",
      };

      addToCart(product);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error fetching product");
    } finally {
      setBarcodeInput("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const key = `${product.sku}-${product.barcode}`;
      const existingIdx = prev.findIndex(
        (i) => `${i.product.sku}-${i.product.barcode}` === key
      );

      if (existingIdx > -1) {
        const item = prev[existingIdx];
        const newQty = item.quantity + 1;
        if (newQty > product.stock) {
          toast.error("Not enough stock!");
          return prev;
        }
        const updated = [...prev];
        updated[existingIdx] = {
          ...item,
          quantity: newQty,
          subtotal: newQty * product.salePrice,
        };
        return updated;
      }

      if (product.stock < 1) {
        toast.error("Product out of stock!");
        return prev;
      }

      return [...prev, { product, quantity: 1, subtotal: product.salePrice }];
    });
  };

  const updateQuantity = (sku, barcode, newQty) => {
    if (newQty < 1) return removeFromCart(sku, barcode);

    setCart((prev) =>
      prev.map((i) =>
        i.product.sku === sku && i.product.barcode === barcode
          ? {
            ...i,
            quantity: Math.min(newQty, i.product.stock),
            subtotal: Math.min(newQty, i.product.stock) * i.product.salePrice,
          }
          : i
      )
    );
  };

  const removeFromCart = (sku, barcode) => {
    setCart((prev) =>
      prev.filter(
        (i) => !(i.product.sku === sku && i.product.barcode === barcode)
      )
    );
    toast.success("Item removed");
  };

  const clearCart = () => {
    if (!cart.length) return;
    setCart([]);
    setDiscount(0);
    setPaymentMethod("cash");
    toast.info("Cart cleared");
  };

  /* ---------- checkout ---------- */
  const handleCheckout = async () => {
    if (!cart.length) return toast.error("Cart is empty!");
    if (!paymentMethod) return toast.error("Select payment method");

    const payload = {
      customer: showCustomerInfo
        ? { phone: customerPhone, name: customerName }
        : null,
      products: cart.map((i) => ({
        sku: i.product.sku,
        quantity: i.quantity,
        price: i.product.salePrice,
        purchasePrice: i.product.purchasePrice,
        productName: i.product.name,
      })),
      totalQuantity,
      subTotal,
      totalAmount,
      discount,
      discountType,
      discountAmount,
      totalPurchaseCost,
      profit,
      payment: { method: paymentMethod, amount: totalAmount },
      soldBy: user?.id,
    };

    try {
      const { data } = await axiosClient.post("/pos-sales", payload);
      console.log(data);
      if (data.success) {
        toast.success(`Sale complete`);

        // Prepare for print
        if (data.data) {
          const printData = {
            ...payload,
            invoiceNo: data.data.invoiceNo || "N/A",
            createdAt: data.data.createdAt || new Date().toISOString(),
            status: data.data.status || "Completed",
          };
          setSaleToPrint(printData);
          setTimeout(() => {
            window.print();
          }, 500);
        }

        setCart([]);
        setCustomerPhone("");
        setCustomerName("");
        setDiscount(0);
        setPaymentMethod("cash");
        setShowCustomerInfo(false);
      } else {
        toast.error(data.message || "Checkout failed");
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Checkout error");
    }
  };

  useEffect(() => {
    let buffer = "";
    let timeout = null;
    let lastKeyTime = Date.now();

    const onKeyDown = (e) => {
      const target = e.target;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isTyping) return; // <-- Skip scanning logic when typing manually
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const now = Date.now();
      const diff = now - lastKeyTime;

      if (diff > 80) buffer = "";

      lastKeyTime = now;
      buffer += e.key;

      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (buffer.length >= 3) {
          setBarcodeInput(buffer);
        }
        buffer = "";
      }, 100);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  /* ---------- DEBOUNCED INPUT → API CALL ---------- */
  useEffect(() => {
    if (!barcodeInput) return;

    const timer = setTimeout(() => {
      const sku = extractSkuFromInput(barcodeInput);
      if (sku) {
        fetchAndAdd(sku);
      } else {
        toast.error("Invalid SKU format");
        setBarcodeInput("");
        inputRef.current?.focus();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [barcodeInput, fetchAndAdd]);

  /* ---------- UI HANDLERS ---------- */
  const handleManualScan = () => {
    const sku = extractSkuFromInput(barcodeInput);
    if (sku) fetchAndAdd(sku);
    else toast.error("Invalid SKU format");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleManualScan();
  };

  return (
    <AdminLayoutWithAuth>
      {/* 🖨️ PRINT TEMPLATE — hidden on screen, shown only when printing */}
      {saleToPrint && (
        <div className="print-invoice-container">
          <div className="print-invoice">
            {/* Header */}
            <div className="text-center mb-3">
              <h2 className="text-md text-[26px] font-bold">Shoelicious</h2>
              <p className="text-md">Shop No: SC-032A,Jamuna Future Park,</p>
              <p className="text-md">DHAKA, Dhaka, 1229, BANGLADESH</p>
              <p className="text-md">
                Mobile: 01601561085 , No Warranty/Currently:No Refund/Exchange
              </p>
            </div>

            <div className="border-t border-b my-3 py-1 text-center">
              <h3 className="text-sm font-bold">Invoice</h3>
            </div>

            {/* Customer Info */}
            <div className="mb-3 text-md">
              <p>
                <strong>Customer:</strong>{" "}
                {saleToPrint.customer?.name || "Walk-in"}
              </p>
              {saleToPrint.customer?.phone && (
                <p>
                  <strong>Mobile:</strong> {saleToPrint.customer.phone}
                </p>
              )}
            </div>

            <div className="flex justify-between text-md ">
              <span>Invoice No: {saleToPrint.invoiceNo || "N/A"}</span>
              <span>Date: {formatDate(saleToPrint.createdAt)}</span>
            </div>
            {/* product table name sr_no */}
            <table className="w-full text-md border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-1 py-1 text-left">Sr No</th>
                  <th className="px-1 py-1 text-center">Product Name</th>
                </tr>
              </thead>
              <tbody>
                {(saleToPrint.products || []).map((product, idx) => {
                  const productName = product.productName || "N/A";

                  return (
                    <tr key={idx}>
                      <td className="px-1 py-1">{idx + 1}</td>
                      <td className="px-1 py-1">{productName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Products Table price and quantity */}
            <table className="w-full text-md  border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-1 py-1 text-left">Sr No</th>
                  <th className="px-1 py-1 text-left">Qty(unit_price)</th>
                  <th className="px-1 py-1 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {(saleToPrint.products || []).map((product, idx) => {
                  return (
                    <tr key={idx}>
                      <td className="px-1 py-1 text-center">{idx + 1}</td>
                      <td className="px-1 py-1 text-center">
                        {product.quantity || 1}({product.price || 1})
                      </td>
                      <td className="px-1 py-1 text-center">
                        {product.quantity * product.price}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Payment Summary */}
            <div className="mt-3 text-md">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="capitalize">
                  {saleToPrint.payment?.method || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(saleToPrint.subTotal || 0)}</span>
              </div>
              {saleToPrint.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount</span> <span>{saleToPrint.discountType}</span>
                  <span>-{formatCurrency(saleToPrint.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-1 border-t">
                <span>Total Amount</span>
                <span>{formatCurrency(saleToPrint.totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid Amount</span>
                <span>{formatCurrency(saleToPrint.payment?.amount || 0)}</span>
              </div>
              {saleToPrint.payment?.amount > saleToPrint.totalAmount && (
                <div className="flex justify-between text-green-600">
                  <span>Change</span>
                  <span>
                    {formatCurrency(
                      (saleToPrint.payment?.amount || 0) -
                      (saleToPrint.totalAmount || 0)
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Status and Profit Info */}
            <div className="mt-2 text-sm border-t pt-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <span
                  className={`font-semibold ${saleToPrint.status === "Completed"
                    ? "text-green-600"
                    : saleToPrint.status === "Cancelled"
                      ? "text-red-600"
                      : saleToPrint.status === "Refunded"
                        ? "text-orange-600"
                        : "text-blue-600"
                    }`}
                >
                  {saleToPrint.status}
                </span>
              </div>
            </div>

            <div className="mt-10 text-lg text-center">
              <p>Software by Shannon IT WhatsApp: +8801743136127</p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen print:hidden">
        <div className="px-4 sm:px-6 lg:px-0 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ---------- LEFT ---------- */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Point of Sale
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Scan products and process sales
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 px-4 py-2 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">
                        Total Items
                      </p>
                      <p className="text-xl font-bold text-blue-700">
                        {totalQuantity}
                      </p>
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">
                        Total Amount
                      </p>
                      <p className="text-xl font-bold text-green-700">
                        <span className="text-2xl">৳</span>
                        {totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scanner input */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Scan Products
                </h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Scan barcode or enter SKU..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <button
                    onClick={handleManualScan}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <AiFillProduct size={25} />
                    Add
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Press <kbd>Enter</kbd> or click Add. SKU format: alphanumeric,
                  3-50 characters
                </p>
              </div>

              {/* Customer info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setShowCustomerInfo(!showCustomerInfo)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${showCustomerInfo
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      <FaUserEdit size={25} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Customer Information
                      </h3>
                      <p className="text-sm text-gray-600">
                        {showCustomerInfo ? "Click to hide" : "Click to add"}
                      </p>
                    </div>
                  </div>
                </button>

                {showCustomerInfo && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Enter name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart list */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Current Sale
                  </h2>
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center gap-2"
                    >
                      <MdDeleteOutline size={20} />
                      Clear All
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <IoCartOutline size={35} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No items in cart
                    </h3>
                    <p className="text-gray-500">Scan products to add them</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => {
                      const key = `${item.product.sku}-${item.product.barcode}`;
                      const itemProfit =
                        (item.product.salePrice - item.product.purchasePrice) *
                        item.quantity;

                      return (
                        <div
                          key={key}
                          className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {item.product.name}
                            </h4>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                              <span>SKU: {item.product.sku}</span>
                              {item.product.variationAttributesValue && (
                                <span>
                                  Attr: {item.product.variationAttributesValue}
                                </span>
                              )}
                              <span>Stock: {item.product.stock}</span>
                            </div>
                            <div className="flex gap-4 mt-1 text-sm">
                              <span className="text-green-600 font-medium">
                                Sale: ৳{item.product.salePrice.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.sku,
                                    item.product.barcode,
                                    item.quantity - 1
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors"
                              >
                                -
                              </button>
                              <span className="w-12 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.sku,
                                    item.product.barcode,
                                    item.quantity + 1
                                  )
                                }
                                disabled={item.quantity >= item.product.stock}
                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                +
                              </button>
                            </div>

                            <div className="text-right min-w-20">
                              <p className="font-semibold text-gray-900">
                                <span className="text-2xl">৳</span>
                                {item.subtotal.toFixed(2)}
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                removeFromCart(
                                  item.product.sku,
                                  item.product.barcode
                                )
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Remove"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ---------- RIGHT – SUMMARY ---------- */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Items Count</span>
                    <span className="font-medium">{totalQuantity}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      <span className="text-2xl">৳</span> {subTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between py-3 border-b border-gray-100 items-center">
                    <span className="text-gray-600">Discount</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">৳</span>

                      {/* Discount Input */}
                      <input
                        type="text"
                        value={discount}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setDiscount(val);
                        }}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                      />

                      {/* Discount Type Buttons */}
                      <div className="flex border border-gray-300 rounded overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setDiscountType("fixed")}
                          className={`px-2 py-1 text-sm ${discountType === "fixed"
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-600"
                            }`}
                        >
                          ৳
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountType("percent")}
                          className={`px-2 py-1 text-sm ${discountType === "percent"
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-600"
                            }`}
                        >
                          %
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Discount Amount</span>
                    <span className="font-medium text-red-600">
                      -<span className="text-2xl">৳</span>{" "}
                      {discountAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      <span className="text-2xl">৳</span>{" "}
                      {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["cash", "card", "mobile banking", "bank", "replace"].map(
                      (m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`p-3 rounded-lg border transition-colors capitalize text-sm font-medium ${paymentMethod === m
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                          {m}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={!cart.length || !paymentMethod}
                    className="w-full px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Complete Sale
                  </button>
                </div>

                {cart.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const first = cart[0];
                          updateQuantity(
                            first.product.sku,
                            first.product.barcode,
                            first.quantity + 1
                          );
                        }}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        Add Item
                      </button>
                      <button
                        onClick={clearCart}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        Clear Cart
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @media screen {
          .print-invoice-container {
            display: none;
          }
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
            font-size: 14px;
            line-height: 1.4;
            display: flex;
            justify-content: center;
          }
          .print\\:hidden,
          .Toastify {
            display: none !important;
          }
          .print-invoice-container {
            position: relative;
            width: 80mm; /* Standard thermal width */
            margin: 0;
            padding: 0;
          }
          .print-invoice {
            width: 80mm;
            padding: 5mm 3mm;
            font-family: "Courier New", monospace;
          }
          .print-invoice-container,
          .print-invoice,
          .print-invoice * {
            page-break-before: avoid !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th,
          td {
            padding: 2px 0;
          }
          @page {
            size: auto;
            margin: 0;
          }
        }
      `}</style>
    </AdminLayoutWithAuth>
  );
};

export default POS;
