import React from "react";

const Loading = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="flex space-x-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="w-4 h-4 bg-linear-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"
              style={{ animationDelay: `${item * 0.2}s` }}
            ></div>
          ))}
        </div>
        <div className="text-center">
          <div className="text-gray-700 font-semibold mb-2">
            Preparing your content
          </div>
          <div className="text-sm text-gray-500">
            This will just take a moment
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;