import { Loader2 } from "lucide-react";
import React from "react";

export const TrLoader = ({ colspan }) => {
  return (
    <>
      <div className="flex justify-center items-center">
        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
        Please Wait...
      </div>
    </>
  );
};
