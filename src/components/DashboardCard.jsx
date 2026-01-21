import React from "react";

const DashboardCard = ({ title, value, increase, icon: Icon, bgColor }) => {
  return (
    <div className="bg-background shadow-md rounded-lg p-4 border border-gray-200 flex items-center gap-4">
      <Icon size={24} color={bgColor} />

      <div>
        <h6 className="text-lg font-medium">{title}</h6>
        <p className="text-2xl font-bold">{value}</p>
        {increase !== undefined && (
          <p
            className={`text-sm ${
              increase >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {increase >= 0 ? `+${increase}` : increase}
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
