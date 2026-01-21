import { useEffect, useState } from "react";
import {
  removeVariation,
  updateVariationField,
  updateVariationDefaultImage,
} from "../../../features/product/productSlice";
import ImageUploader from "../../../components/common/imageUploader";
import axiosClient from "../../../api/axiosClient";
import { useDispatch } from "react-redux";
import { Icon } from "@iconify/react";

const Variation = ({ index, variation }) => {
  const [sku, setSku] = useState(variation.sku || "");
  const [skuValid, setSkuValid] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const dispatch = useDispatch();

  // Sync validated SKU back to Redux
  useEffect(() => {
    if (!isChecking && skuValid !== null) {
      dispatch(
        updateVariationField({
          index,
          field: "sku",
          value: sku,
        })
      );
    }
  }, [skuValid, isChecking, sku, dispatch, index]);

  // Debounced SKU validation
  useEffect(() => {
    if (!sku) {
      setSkuValid(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setIsChecking(true);
        const response = await axiosClient.get(
          `/products/validate-sku?sku=${encodeURIComponent(sku)}`
        );
        setSkuValid(response.data.success);
      } catch (error) {
        console.error("SKU validation error:", error);
        setSkuValid(false);
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [sku]);

  // Handle image upload for variation
  const handleImageUpload = (links) => {
    const currentImages = variation.images || [];
    const updatedImages = [...currentImages, links];

    dispatch(
      updateVariationField({
        index,
        field: "images",
        value: updatedImages,
      })
    );
  };

  // Handle remove image from variation
  const handleRemoveImage = (imageIndex) => {
    const currentImages = variation.images || [];
    const updatedImages = currentImages.filter((_, i) => i !== imageIndex);

    dispatch(
      updateVariationField({
        index,
        field: "images",
        value: updatedImages,
      })
    );

    // If removed image was the default, clear default image
    if (
      variation.default_image &&
      variation.default_image.small?.url ===
        currentImages[imageIndex]?.small?.url
    ) {
      dispatch(
        updateVariationDefaultImage({
          index,
          image: null,
        })
      );
    }
  };

  // Handle set default image for variation
  const handleSetDefaultImage = (image) => {
    dispatch(
      updateVariationDefaultImage({
        index,
        image: image,
      })
    );
  };

  return (
    <div className="p-4 border rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
      {/* Image Gallery & Default Selection */}
      <div className="border-b pb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Variation Images
        </label>

        <div className="flex flex-wrap gap-3">
          {/* Existing Images */}
          {variation.images?.map((image, imageIndex) => (
            <div
              key={`${index}-${imageIndex}`}
              className="relative w-24 h-24 border border-gray-300 rounded-lg overflow-hidden bg-gray-50"
            >
              <button
                type="button"
                onClick={() => handleRemoveImage(imageIndex)}
                className="absolute top-1 right-1 z-10 bg-white rounded-full p-1 shadow-sm hover:bg-red-50"
              >
                <Icon
                  icon="radix-icons:cross-2"
                  className="text-sm text-red-600"
                />
              </button>

              <img
                style={{ objectFit: "contain" }}
                className="w-full h-full"
                src={
                  image?.small?.url || image?.medium?.url || image?.large?.url
                }
                alt={`variation-${index}-image-${imageIndex}`}
              />

              {/* Default Image Selection */}
              <div className="absolute bottom-1 left-1 right-1">
                <label className="flex items-center gap-1 bg-white bg-opacity-90 rounded px-1 py-0.5">
                  <input
                    type="radio"
                    name={`variation-default-${index}`}
                    checked={
                      variation.default_image?.small?.url === image?.small?.url
                    }
                    onChange={() => handleSetDefaultImage(image)}
                    className="w-3 h-3"
                  />
                  <span className="text-xs text-gray-700">Default</span>
                </label>
              </div>
            </div>
          ))}

          {/* Image Upload Button */}
          <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
            <ImageUploader
              onUploadSuccess={handleImageUpload}
              index={index}
              buttonText={
                <div className="text-center">
                  <Icon
                    icon="mdi:plus"
                    className="text-xl text-gray-500 mx-auto"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">
                    Add Image
                  </span>
                </div>
              }
            />
          </label>
        </div>

        {variation.images?.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            No images added. Add images to show for this variation.
          </p>
        )}
      </div>

      {/* Attributes Display */}
      <div className="flex flex-wrap flex-col gap-2">
        {variation.attributes?.map((attr, attrIndex) => (
          <span
            key={`${index}-${attrIndex}`}
            className="px-3 py-1 bg-gray-200 rounded-md text-base text-gray-700"
          >
            {attr.name}: {attr.value}
          </span>
        ))}
      </div>

      {/* SKU & Stock */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU
          </label>
          <input
            type="text"
            name="sku"
            value={sku}
            className="border rounded-lg px-4 py-3 w-full text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            onChange={(e) => setSku(e.target.value)}
          />
          {isChecking ? (
            <p className="text-blue-500 text-sm">Checking...</p>
          ) : skuValid === false ? (
            <p className="text-red-500 text-sm">SKU already exists</p>
          ) : skuValid === true ? (
            <p className="text-green-500 text-sm">SKU is available</p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock
          </label>
          <input
            type="text"
            name="stock"
            value={variation.stock || ""}
            className="border rounded-lg px-4 py-3 w-full text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Stock"
            onChange={(e) => {
              const val = e.target.value === "" ? null : Number(e.target.value);
              dispatch(
                updateVariationField({
                  index,
                  field: "stock",
                  value: val,
                })
              );
            }}
          />
        </div>
      </div>

      {/* Price */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purchase Price
          </label>
          <input
            type="text"
            name="purchase_price"
            value={variation.purchase_price || ""}
            onChange={(e) => {
              const val = e.target.value === "" ? null : Number(e.target.value);
              dispatch(
                updateVariationField({
                  index,
                  field: "purchase_price",
                  value: val,
                })
              );
            }}
            className="border rounded-lg px-4 py-3 w-full text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sale Price
          </label>
          <input
            type="text"
            name="sale_price"
            value={variation.sale_price || ""}
            onChange={(e) => {
              const val = e.target.value === "" ? null : Number(e.target.value);
              dispatch(
                updateVariationField({
                  index,
                  field: "sale_price",
                  value: val,
                })
              );
            }}
            className="border rounded-lg px-4 py-3 w-full text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          onChange={(e) =>
            dispatch(
              updateVariationField({
                index,
                field: "status",
                value: e.target.value,
              })
            )
          }
          value={variation.status || "active"}
          className="w-full appearance-none bg-background border border-gray-300 rounded px-3 py-2 pr-8 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-gray-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Remove Variant Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            dispatch(removeVariation(index));
          }}
          className="px-5 py-3 bg-red-600 text-white rounded-lg shadow-sm text-lg font-semibold flex items-center gap-2 hover:bg-red-700 transition-all"
        >
          <i className="ri-delete-bin-2-line text-xl"></i> Remove
        </button>
      </div>
    </div>
  );
};

export default Variation;
