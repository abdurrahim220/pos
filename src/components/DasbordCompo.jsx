import React from "react";
import  { useEffect, useState } from "react";
import DashboardGraph from "./GraphComp";
import Loading from "./Loading";
import axiosClient from "../api/axiosClient";

const DashboardPage = () => {
  const [dashboardDataCounts, setDashboardDataCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardDataCounts = async () => {
      try {
        const res = await axiosClient.get("/dashboard-data-counts");
        
        setDashboardDataCounts(res.data.data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || "Something went wrong");
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardDataCounts();
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  if (!dashboardDataCounts) return null;

  return (
   <section>
     <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {Object.entries(dashboardDataCounts).map(([key, value]) => (
        <div
          key={key}
          className="border border-gray-200 shadow-sm rounded-lg p-4 flex flex-col items-center justify-center bg-white"
        >
          <h3 className="text-gray-600 text-sm font-medium text-center capitalize">
            {key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())}
          </h3>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
      ))}
    </div>
    <div className="mt-8">
        <h2 className="text-2xl text-center py-5 font-bold text-gray-900 mb-4">Data Overview</h2>
        <DashboardGraph data={dashboardDataCounts} />
    </div>
    
   </section>
  );
};

export default DashboardPage;