/* eslint-disable react/prop-types */
import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../../api/axiosClient";
import MultiSelect from "../../components/ui/MultiSelectForEditProduct";
import { updateFormData } from "../../features/productEdit/editProductSlice";

const SelectedAttribute = ({ attributeId, handleDeleteAttributeId }) => {
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.editProduct.formData);

  const [attribute, setAttribute] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ size guide dropdown state
  const [allSizeGuides, setAllSizeGuides] = useState([]);
  const selectedSizeGuideId = formData?.sizeGuide || "";

  // detect size attr
  const isSizeAttr = useMemo(
    () => (attribute?.name || "").toLowerCase().includes("size"),
    [attribute?.name]
  );

  // fetch attribute
  const getAttribute = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`attributes/${attributeId}`);
      setAttribute(res?.data?.attribute || {});
    } catch (error) {
      console.log("Error fetching attribute:", error);
    } finally {
      setLoading(false);
    }
  };

  // fetch all size guides (only once)
  const getAllSizeGuides = async () => {
    try {
      const res = await axiosClient.get("/frontend/size-guides");
      setAllSizeGuides(res.data || []);
    } catch (error) {
      console.error("Failed to fetch size guides", error);
    }
  };

  useEffect(() => {
    getAttribute();
    getAllSizeGuides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributeId]);

  if (loading) return <div className="p-4">Loading attribute...</div>;

  const transformedAttValues =
    attribute?.values?.map((item) => ({ value: item, label: `${item}` })) || [];

  return (
    <div className="border border-gray-200 rounded mt-2">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <span className="font-medium">{attribute?.name || "Attribute"}</span>
        </div>
        <button
          onClick={() => handleDeleteAttributeId(attributeId, attribute.name)}
          className="text-red-500 hover:text-red-600 text-sm"
        >
          Delete
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* MultiSelect */}
        <div className="mb-4">
          <div className="text-sm text-gray-700 mb-2">Values:</div>
          <MultiSelect
            formData={formData}
            setFormData={(data) => dispatch(updateFormData(data))}
            options={transformedAttValues}
            atrribute={attribute}
          />
        </div>

        {/* Size Guide Dropdown */}
        {isSizeAttr && (
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-800 mb-1">
              Select Size Guide
            </label>
            <select
              value={selectedSizeGuideId}
              onChange={(e) =>
                dispatch(updateFormData({ sizeGuide: e.target.value }))
              }
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">-- No Size Guide --</option>
              {allSizeGuides.map((guide) => (
                <option key={guide._id} value={guide._id}>
                  {guide.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectedAttribute;
