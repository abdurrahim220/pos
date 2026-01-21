import React from "react";

const PrintableReceipt = ({ cart, totalPrice }) => {
  return (
    <div id="receipt" className="hidden print:block p-6 text-sm font-mono">
      <h2 className="text-center text-lg font-semibold mb-2">
        👟 Shoe Shop Receipt
      </h2>
      <p className="text-center text-xs text-gray-500 mb-2">
        Thank you for shopping with us!
      </p>
      <p className="text-center text-xs text-gray-500 mb-2">
        Date: {new Date().toLocaleString()}
      </p>
      <hr className="my-2 border-gray-400" />
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-400">
            <th className="text-left py-1">Product</th>
            <th className="text-right py-1">Qty</th>
            <th className="text-right py-1">Price</th>
            <th className="text-right py-1">Sub</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.product.barcode}>
              <td className="py-1">{item.product.name.slice(0, 12)}</td>
              <td className="text-right py-1">{item.quantity}</td>
              <td className="text-right py-1">
                {item.product.salePrice.toFixed(2)}
              </td>
              <td className="text-right py-1">
                {item.subtotal.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr className="my-2 border-gray-400" />
      <div className="flex justify-between font-semibold">
        <span>Total:</span>
        <span>tk{totalPrice.toFixed(2)}</span>
      </div>
      <p className="mt-4 text-center text-xs text-gray-500">
        Powered by shoelicious
      </p>
    </div>
  );
};

export default PrintableReceipt;