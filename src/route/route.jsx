import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "../Main/Layout";
import ErrorPage from "../components/ErrorPage";
import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login";
import POS from "../pages/Sales/Sales";
import AdminBarcodesPrint from "../pages/BrCodePrint/BrCodePrint";
import AdminQrCodesPrint from "../pages/QrCodePrint/QrCodePrint";
import ProductList from "../pages/product/ProductList";
import CreateProduct from "../pages/product/CreateProduct";
import EditProduct from "../pages/product-edit/editProduct";
import ProductView from "../pages/product/ProductView";
import Purchases from "../pages/Purchase/page";
import Return from "../pages/Purchase/Return";
import Add from "../pages/Purchase/Add";
import StockList from "../pages/stock/stockList";
import SaleAnalytic from "../pages/Sale Analytic/SaleAnalytic";

const route = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/auth/login",
        element: <Login />,
      },
      {
        path: "/sales",
        element: <POS />,
      },
      {
        path: "/sale-analysis",
        element: <SaleAnalytic />,
      },
      {
        path: "/br-codes",
        element: <AdminBarcodesPrint />,
      },
      {
        path: "/qr-codes",
        element: <AdminQrCodesPrint />,
      },
      {
        path: "/products",
        element: <ProductList />,
      },
      {
        path: "/stock",
        element: <StockList />,
      },
      {
        path: "/products/create",
        element: <CreateProduct />,
      },
      {
        path: "/products/:id",
        element: <ProductView />,
      },
      {
        path: "/products/:productId/edit",
        element: <EditProduct />,
      },
      {
        path: "/purchases/list",
        element: <Purchases />,
      },
      {
        path: "/purchases/add",
        element: <Add />,
      },
      {
        path: "/purchases/return",
        element: <Return />,
      },
    ],
  },
]);

export default route;
