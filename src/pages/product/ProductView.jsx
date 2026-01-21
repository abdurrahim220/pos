import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

import Reviews from "./Reviews";
import AdminLayoutWithAuth from "../../components/layout/SidebarLayout";

const ProductView = () => {
  const [product, setProduct] = useState({});
  const params = useParams();
  const [reviews, setReviews] = useState([]);
  
  const fetchProduct = async () => {
    try {
      const response = await axiosClient.get(`/products/${params.id}`);
      setProduct(response.data.product);
    } catch (error) {
      console.log(error);
    }
  };

  // console.log( product?.images)

  useEffect(() => {
    fetchProduct();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axiosClient.get(
          `/frontend/review/${product._id}`
        );

        setReviews(response.data.reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, [product._id]);

  const profit = (product.sale_price || 0) - (product.purchase_price || 0);
  const profitMargin = ((profit / (product.sale_price || 1)) * 100).toFixed(2);
  
  const getTotalStock = (product) => {
    let stock = 0;
    product?.variations?.forEach((v) => (stock = v.stock + stock));
    return stock;
  };

  // Fix: Get stock for simple products properly
  const getSimpleProductStock = (product) => {
    // If stock is an object, extract the stock value from it
    if (product.stock && typeof product.stock === 'object') {
      return product.stock.stock || 0;
    }
    // If stock is a primitive, use it directly
    return product.stock || 0;
  };

  const OnDeleReview = async (id) => {
    try {
      await axiosClient.delete(`/frontend/review/${id}`);

      setReviews((prevReviews) =>
        prevReviews.filter((review) => review._id !== id)
      );
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  if (!product) {
    return <p>Loading...</p>;
  }
  
  return (
    <AdminLayoutWithAuth>
      <div>
        {/* Header */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-1 text-sm font-medium md:space-x-2">
            <li>
              <Link
                to="/products"
                className="text-gray-700 hover:text-blue-600"
              >
                Products
              </Link>
            </li>
            <li className="flex items-center space-x-1">
              <span className="text-gray-400">/</span>
              <span className="text-gray-500">{product.name}</span>
            </li>
          </ol>
        </nav>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Product Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <a
                  target="__blank"
                  href={`https://www.shoelicious.com.bd/product-detail/${product.slug}`}
                >
                  <h1 className="text-2xl font-bold text-gray-900 mb-1 underline">
                    {product.name}
                  </h1>
                </a>
                {/* <p className='text-sm text-gray-500'>ID: {product._id}</p> */}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    product.status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {product.status || "Draft"}
                </span>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Images Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Product Images
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {(product.images || [])?.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      style={{ objectFit: "contain" }}
                      src={image.medium?.url || "/api/placeholder/360/432"}
                      alt={`Product ${index + 1}`}
                      className="w-full h-48  object-contain rounded-lg border border-gray-200 group-hover:border-blue-500 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Product Details
              </h2>
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <dl>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-2 sm:gap-4 border-b border-gray-200">
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                      {product.type}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-2 sm:gap-4 border-b border-gray-200">
                    <dt className="text-sm font-medium text-gray-500">Price</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                      ৳{product.sale_price || 0}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-2 sm:gap-4 border-b border-gray-200">
                    <dt className="text-sm font-medium text-gray-500">
                      Purchase Price
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                      ৳{product.purchase_price || 0}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-2 sm:gap-4 border-b border-gray-200">
                    <dt className="text-sm font-medium text-gray-500">
                      Profit Margin
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                      {profitMargin}%
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-2 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Stock</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                      {product.type === "simple"
                        ? getSimpleProductStock(product) // Use the fixed function here
                        : getTotalStock(product)}{" "}
                      units
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Brand, Categories, and Tags */}
            <div className="space-y-6">
              {/* Brand */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Brand
                </h2>
                <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <img
                    style={{ objectFit: "contain" }}
                    src={
                      product.brand?.images[0]?.small?.url || "/api/placeholder/40/40"
                    }
                    alt={product.brand?.name}
                    className="w-10 h-10 rounded-full border border-gray-200"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {product.brand?.name || "No Brand"}
                  </span>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Categories
                </h2>
                <div className="space-y-2">
                  {product.category && (
                    <div
                      key={product.category._id}
                      className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
                    >
                      <img
                        style={{ objectFit: "contain" }}
                        src={
                        product.category.images[0]?.small?.url ||
                        "/api/placeholder/40/40"
                        }
                        alt={product.category.name}
                        className="w-6 h-6 rounded"
                      />
                      
                    </div>
                  )}
                  {!product.category && (
                    <p className="text-sm text-gray-500 italic">
                      No categories assigned
                    </p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(product.tags || [])?.map((tag) => (
                    <span
                      key={tag._id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      {tag.name}
                    </span>
                  ))}
                  {(!product.tags || product.tags.length === 0) && (
                    <p className="text-sm text-gray-500 italic">
                      No tags assigned
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 w-full h-fit min-h-[300px]">
            <h3 className="text-xl font-semibold ">Description</h3>

            <div
              className="mt-1 h-fit  text-gray-900 "
              dangerouslySetInnerHTML={{ __html: product?.description }}
            ></div>
          </div>

          <Reviews onDelete={OnDeleReview} reviews={reviews} />

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-500">
              <div className="mb-2 sm:mb-0">
                Created: {new Date(product.createdAt).toLocaleDateString()}
              </div>
              <div>
                Last Updated: {new Date(product.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutWithAuth>
  );
};

export default ProductView;