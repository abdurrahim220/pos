import React from "react";
import BreadCrumb from "../../../components/ui/BreadCrumb";
import { FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import {
  addVariation,
  updateVariations,
} from "../../../features/product/productSlice";

import Variation from "./variation";

export const ProductVariantForm = ({
  breadCrumbTitle = "Create Product Variant",
}) => {
  const dispatch = useDispatch();
  const { selactedAttributes, variations } = useSelector(
    (state) => state.product
  );
  const [isCustome, setIsCustom] = useState(true);
  const [selectedValues, setSelectedValues] = useState([]);

  const handleAttributeChange = (attributeName, value) => {
    setSelectedValues((prev) => {
      const updatedValues = prev?.map((attr) =>
        attr.name === attributeName ? { ...attr, value } : attr
      );

      const isExisting = prev.some((attr) => attr.name === attributeName);

      const vvv = isExisting
        ? updatedValues
        : [...updatedValues, { name: attributeName, value }];

      return isExisting
        ? updatedValues
        : [...updatedValues, { name: attributeName, value }];
    });
  };

  function generateVariations(attributes) {
    const generateCombinations = (index, current) => {
      if (index === attributes.length) {
        variations.push({
          id: Date.now() + Math.random(),
          sku: `${Math.floor(100000000 + Math.random() * 900000000)}`,
          sale_price: null,
          purchase_price: null,
          stock: null,
          attributes: current,
          images: [],
          status: "active",
        });
        return;
      }

      for (const value of attributes[index].values) {
        generateCombinations(index + 1, [
          ...current,
          { name: attributes[index].name, value },
        ]);
      }
    };

    const variations = [];
    generateCombinations(0, []);
    return variations;
  }

  const handlevariationGenarate = () => {
    if (isCustome) {
      dispatch(
        addVariation({
          id: Date.now() + Math.random(),
          sku: `${Math.floor(100000000 + Math.random() * 900000000)}`,
          sale_price: null,
          purchase_price: null,
          stock: null,
          attributes: selectedValues,
          images: [],
          status: "active",
        })
      );
    } else {
      const variations = generateVariations(selactedAttributes);

      dispatch(updateVariations(variations));
    }
  };

  return (
    <>
      <div>
        <BreadCrumb name={breadCrumbTitle} />
        <div className="grid grid-cols-12">
          <div className="col-span-12">
            <div className="card border-0">
              <div
                className="tab-pane fade variations-list active show"
                id="tabs-g"
                role="tabpanel"
                aria-labelledby="tabs-7"
              >
                <div className="mt-5 mx-6 pb-5">
                  <div className="rounded-lg mb-2">
                    <div className="flex justify-between mb-2">
                      <h6 className="text-gray-800 text-lg font-semibold mb-2">
                        Default Form Values
                      </h6>
                      <div className="w-80">
                        <select
                          onChange={(e) => {
                            setIsCustom(JSON.parse(e.target.value));
                          }}
                          className="p-2 w-full border-gray-300 rounded-md border"
                        >
                          <option value={true}>Custom variation</option>
                          <option value={false}>All possible variations</option>
                        </select>
                      </div>
                    </div>
                    {isCustome ? (
                      <div className="flex  gap-2">
                        {selactedAttributes.length > 0 &&
                          selactedAttributes?.map((attribute, i) => (
                            <div
                              key={i}
                              className="flex flex-wrap gap-4 w-full"
                            >
                              <select
                                onChange={(e) =>
                                  handleAttributeChange(
                                    attribute.name,
                                    e.target.value
                                  )
                                }
                                className="border p-2 w-full border-gray-300 rounded-md"
                              >
                                <option value="">Any {attribute.name}</option>
                                {attribute.values &&
                                  typeof attribute.values !== "string" &&
                                  attribute.values?.map((value, j) => (
                                    <option key={j + "l"} value={value}>
                                      {value}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                  <div className="flex flex-wrap mt-5 justify-end items-center">
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={handlevariationGenarate}
                        className="px-6 py-2 text-black bg-blue-400 rounded-md"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-0 mx-6 pb-0 text-gray-700 hidden">
                  <p>
                    Variations found which don't have price. Empty price
                    variations will not be visible to customers.
                  </p>
                </div>
                <div className="drag_and_drop variation-item-lists">
                  Variations List Here
                </div>
              </div>

              <div className="p-6 shadow-md rounded-lg bg-white">
                <h6 className="text-gray-700 font-semibold mb-3">
                  Total Variations ({variations.length})
                </h6>

                <div className="space-y-4">
                  {variations.length > 0 ? (
                    variations?.map((variation, index) => (
                      <Variation
                        key={variation.id}
                        index={index}
                        variation={variation}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-6 text-lg">
                      No variations generated.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
