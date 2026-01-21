import React from "react";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import CategoryTreeSelect from "../../components/common/CategoryTreeSelect";
import ProductDataCard from "./ProductDataCard";
import MultiImageUpload from "../../components/ui/MultiImageUpload";
import ReactQuill from "react-quill-new";

import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import {
  setEditProduct,
  updateFormData,
  setLoading,
  updateDatas,
  setError,
  setInnitialState,
} from "../../features/productEdit/editProductSlice.js";

import TagMultiSelect from "../../components/ui/TagMultiselectFroEditproduct";
import AdminLayoutWithAuth from "../../components/layout/SidebarLayout.jsx";
import Loading from "../../components/Loading.jsx";

const EditProduct = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const [initialproduct, setInitialProduct] = useState();
  const {
    formData,
    type,
    categories,
    attributes,
    selectedTags,
    selactedAttributes,
    default_attributes,
    brands,
    branches, // [NEW]
    tags,
    loading,
    variations,
  } = useSelector((state) => {
    // console.log("eee", state.editProduct);

    return state.editProduct;
  });

  const navigate = useNavigate();
  const handleDescriptionChange = (value) => {
    dispatch(updateFormData({ description: value }));
  };
  const fetchData = async (endpoint, action, name) => {
    dispatch(setLoading(true));

    try {
      const res = await axiosClient.get(endpoint);

      dispatch(
        action({
          name: name,
          value: name === "vendors" ? res?.data?.data : res?.data,
        }),
      );
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    } finally {
      dispatch(setLoading(false));
    }
  };
  const fetchProduct = async () => {
    dispatch(setLoading(true));

    try {
      const res = await axiosClient.get(`/products/${productId}`);
      const product = res.data.product;

      // console.log("product", product);
      setInitialProduct(product);
      dispatch(setEditProduct(product));
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
    dispatch(setLoading(false));
  };
  useEffect(() => {
    fetchProduct();

    fetchData("/categories/all", updateDatas, "categories");
    fetchData("/attributes/all", updateDatas, "attributes");
    fetchData("/brands/all", updateDatas, "brands");
    fetchData("/branches", updateDatas, "branches"); // [NEW]
    fetchData("/tags/all", updateDatas, "tags");
  }, [productId]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    dispatch(
      updateFormData({ [name]: type === "number" ? Number(value) : value }),
    );
  };

  const handleSubmit = async () => {
    try {
      if (!productId) {
        toast.error("Product ID is missing");
        return;
      }
      if (type !== "simple" && variations.length === 0) {
        return toast.error("Variable Product must have a least one variation!");
      }
      const isInvalidMainPrice =
        Number(formData.purchase_price) > Number(formData.sale_price);

      const isInvalidVariation = variations?.some(
        (v) => Number(v.purchase_price) > Number(v.sale_price),
      );

      const isinvaide =
        type === "simple" ? isInvalidMainPrice : isInvalidVariation;
      if (isinvaide) {
        // Handle the invalid case, e.g. show an error message
        toast.error("Sale price must be greater than  purchase price.");
        return;
      }
      const formattedVariations =
        variations?.map((v) => ({
          sku: v.sku,
          sale_price: v.sale_price,
          purchase_price: v.purchase_price,
          stock: v.stock,
          branchStocks: v.branchStocks || [],
          attributes: v.attributes?.map((a) => ({
            name: a.name,
            value: a.value,
          })),
          images: v.images,
          status: v.status,
          default_image: v.default_image,
        })) || [];

      const payload = {
        ...formData,
        type,
        tags: selectedTags?.map((tag) => tag._id || tag) || [],
        attributes:
          selactedAttributes?.map((a) => ({
            _id: a._id,
            name: a.name || "",
            values: a.values || [],
          })) || [],
        variations: formattedVariations,
        default_attributes: default_attributes || [],
      };

      const response = await axiosClient.put(
        `/products/${productId}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response?.data?.success) {
        dispatch(setInnitialState());
        toast.success(response.data.message);
        navigate("/products");
      } else {
        toast.error(response?.data?.message || "Product update failed");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to update product";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    }
  };

  if (loading) return <Loading />;

  return (
    <AdminLayoutWithAuth>
      <div className="flex w-full min-h-screen bg-gray-50">
        {/* Left Panel - 60% */}
        <div className="w-4/6 p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Product Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product name"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <CategoryTreeSelect
                  setFormData={(data) => dispatch(updateFormData(data))}
                  formData={formData}
                  categories={categories}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  className="bg-white"
                  modules={{
                    clipboard: {
                      matchVisual: false, // Ensures formatting is retained
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <ProductDataCard
            setFormData={(data) => dispatch(updateFormData(data))}
            formData={formData}
            Allattributes={attributes}
            product={initialproduct}
          />

          {/* //video and photos */}
          <div className="p-4 bg-background shadow-md rounded-lg w-full max-w-4xl mt-3">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">
                Product Photos & Videos
              </h2>
              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <svg
                    className="w-4 h-4 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Image Upload */}
              {/* <ProductImageUpload setImages={addImage} /> */}
              <MultiImageUpload
                setFormData={(data) => dispatch(updateFormData(data))}
                formData={formData}
              />
              {/* Video Upload */}
              <div className=" space-y-4">
                {/* Video Upload */}
                <div className="flex justify-center items-center gap-8">
                  <label className="w-24 text-gray-700">Video Link</label>
                  <div className="flex-1 space-y-3">
                    {/* Upload Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="video_link"
                        value={formData.video_link}
                        onChange={handleInputChange}
                        placeholder="Enter your video url"
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center items-center gap-5">
                  <label className="block text-sm font-medium text-gray-700">
                    Purchase Price (BDT)
                  </label>
                  <input
                    type="number"
                    name="default_price"
                    value={formData.default_price}
                    onChange={handleInputChange}
                    placeholder="Default Price"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - 40% */}
        <div className="w-2/6 p-6 ">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b border-gray-200">
              <h2 className="text-base font-medium text-gray-800">
                Additional Info
              </h2>
            </div>

            <div className="p-2 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm text-gray-700">Brand</label>
                <select
                  name="brand"
                  onChange={handleInputChange}
                  value={formData.brand}
                  className="w-full appearance-none bg-background border border-gray-300 rounded px-3 py-2 pr-8 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-gray-500"
                >
                  <option value="">Select an option</option>
                  {brands &&
                    brands.length > 0 &&
                    brands?.map((brand, i) => (
                      <option value={brand._id} key={i}>
                        {brand.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-700">Branch</label>
                <select
                  name="branch"
                  onChange={handleInputChange}
                  value={formData.branch}
                  className="w-full appearance-none bg-background border border-gray-300 rounded px-3 py-2 pr-8 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-gray-500"
                >
                  <option value="">Select an option</option>
                  {branches &&
                    branches.length > 0 &&
                    branches?.map((branch, i) => (
                      <option value={branch._id} key={i}>
                        {branch.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-700">Tags</label>
                <TagMultiSelect tags={tags} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-gray-700">Warranty</label>
                <select
                  onChange={handleInputChange}
                  name="warranty"
                  value={formData.warranty}
                  className="w-full appearance-none bg-background border border-gray-300 rounded px-3 py-2 pr-8 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-gray-500"
                >
                  <option value={false}>No warranty</option>
                  <option value={true}>With warranty</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-gray-700">Status</label>
                <select
                  onChange={handleInputChange}
                  name="status"
                  value={formData.status}
                  className="w-full appearance-none bg-background border border-gray-300 rounded px-3 py-2 pr-8 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-gray-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>
          <div className="max-w-4xl mt-2 p-4 bg-background rounded-lg shadow-sm border border-gray-200">
            <button
              className="w-full px-4 py-3 bg-gray-800 text-white text-base font-medium rounded-md
                   hover:bg-gray-700 
                   focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                   active:bg-gray-900
                   transition-colors duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              onClick={handleSubmit}
            >
              {loading.saveLoading ? "Loading..." : "Save Product"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayoutWithAuth>
  );
};

export default EditProduct;
