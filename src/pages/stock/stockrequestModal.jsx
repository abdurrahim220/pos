import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

const StockRequestsModal = ({ stockId, onClose }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axiosClient.get(`/stock-request/${stockId}`);
        setRequests(res?.data?.data);
      } catch (error) {
        console.error("Error fetching stock requests:", error);
      }
    };

    if (stockId) {
      fetchRequests();
    }
  }, [stockId]);

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await axiosClient.post(`/stock-request/status-update/${requestId}`, {
        status: newStatus,
      });
      setRequests((prevRequests) =>
        prevRequests?.map((r) =>
          r._id === requestId ? { ...r, status: newStatus } : r,
        ),
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    }
  };

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center bg-opacity-50">
      <div className="bg-white  rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Stock Requests</h2>

        <div className="overflow-y-auto max-h-60">
          {requests.length === 0 ? (
            <p className="text-gray-500">No stock requests available.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 ">
                  <th className="px-4 py-2">Quantity</th>
                  <th className="px-4 py-2">Reason</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests?.map((request) => (
                  <tr key={request._id} className="border-b">
                    <td className="px-4 py-2">{request.quantity}</td>
                    <td className="px-4 py-2">{request.reason}</td>
                    <td className="px-4 py-2">
                      <select
                        value={request.status}
                        onChange={(e) =>
                          handleStatusChange(request._id, e.target.value)
                        }
                        className="border rounded px-2 py-1 bg-background  text-sm"
                        disabled={request.status !== "pending"}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockRequestsModal;
