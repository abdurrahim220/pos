import React from "react";

import { Link } from "react-router-dom";

import ProductTable from "./ProductTable.jsx";
import BreadCrumb from "../../components/ui/BreadCrumb.jsx";
import AdminLayoutWithAuth from "../../components/layout/SidebarLayout.jsx";

const ProductList = () => {
  return (
    <AdminLayoutWithAuth>
      <div className="">
        <div className="">
          <BreadCrumb name={"Product List"} />

          <div className=" flex items-center justify-end mb-4">
            <Link
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-md"
              to="/products/create"
            >
              Add New
            </Link>
          </div>

          <div className="overflow-hidden rounded-lg shadow">
            <ProductTable />
          </div>
        </div>
      </div>
    </AdminLayoutWithAuth>
  );
};

export default ProductList;
