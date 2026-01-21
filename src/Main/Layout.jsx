import React from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
const Layout = () => {
  return (
    <div className="">
      <Outlet />
      <ToastContainer />
    </div>
  );
};

export default Layout;
