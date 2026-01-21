import React, { useState } from "react";
import BreadCrumb from "../../../components/ui/BreadCrumb";
import {  useDispatch, useSelector } from "react-redux";
import Variation from "./variation";
import { addVariation, updateVariations } from "../../../features/productEdit/editProductSlice";

import { toast } from "react-toastify";
export const ProductVariantForm = ({
  breadCrumbTitle = "Edit Product Variant",
}) => {
  const dispatch = useDispatch();
  const { selactedAttributes, variations } = useSelector(
    (state) => state.editProduct
  );
  const [isCustome, setIsCustom] = useState(true);
  const [selectedValues, setSelectedValues] = useState([]);

  
  const showToast = (message, type = "error") => {
   
    if (type === "error") {
      toast.error(`Error: ${message}`);
    } else {
      toast.success(`Success: ${message}`);
    }
    
    
  };

  
  const checkDuplicateVariation = (attributesToCheck) => {
    return variations.some((existingVariation) => {
      
      if (existingVariation.attributes.length !== attributesToCheck.length) {
        return false;
      }

      return attributesToCheck.every((newAttr) =>
        existingVariation.attributes.some(
          (existingAttr) =>
            existingAttr.name === newAttr.name &&
            existingAttr.value === newAttr.value
        )
      );
    });
  };

  
  const handleAttributeChange = (attributeName, value) => {
    setSelectedValues((prev) => {
      const updatedValues = prev?.map((attr) =>
        attr.name === attributeName ? { ...attr, value } : attr
      );

      
      const isExisting = prev.some((attr) => attr.name === attributeName);

      return isExisting
        ? updatedValues
        : [...prev, { name: attributeName, value }];
    });
  };

  function generateVariations(attributes) {
    const variations = [];
    
    const generateCombinations = (index, current) => {
      if (index === attributes.length) {
        variations.push({
          id: Date.now() + Math.random(),
          sku: `${Math.floor(100000000 + Math.random() * 900000000)}`,
          sale_price: null,
          purchase_price: null,
          stock: null,
          attributes: [...current],
          images: [],
          status: "active",
        });
        return;
      }

      const currentAttribute = attributes[index];
      if (currentAttribute.values && currentAttribute.values.length > 0) {
        for (const value of currentAttribute.values) {
          generateCombinations(index + 1, [
            ...current,
            { name: currentAttribute.name, value },
          ]);
        }
      }
    };

    generateCombinations(0, []);
    return variations;
  }

  const handlevariationGenarate = () => {
    if (isCustome) {
    
      const hasSelectedValues = selectedValues.some(attr => attr.value && attr.value !== '');
      
      if (!hasSelectedValues) {
        showToast("Please select at least one attribute value for custom variation");
        return;
      }

      
      const validSelectedValues = selectedValues.filter(attr => attr.value && attr.value !== '');

     
      if (checkDuplicateVariation(validSelectedValues)) {
        showToast("This attribute combination already exists! Please choose different attributes.");
        return;
      }

     
      const newVariation = {
        id: Date.now() + Math.random(),
        sku: `${Math.floor(100000000 + Math.random() * 900000000)}`,
        sale_price: null,
        purchase_price: null,
        stock: null,
        attributes: validSelectedValues,
        images: [],
        status: "active",
      };

      dispatch(addVariation(newVariation));
      showToast("Variation added successfully!", "success");
      
     
      setSelectedValues([]);
      
    } else {
      
      if (selactedAttributes.length === 0) {
        showToast("Please add attributes first to generate all variations");
        return;
      }

      const newVariations = generateVariations(selactedAttributes);
      
    
      const uniqueNewVariations = newVariations.filter(newVariation => 
        !checkDuplicateVariation(newVariation.attributes)
      );

      if (uniqueNewVariations.length === 0) {
        showToast("All possible variations already exist");
        return;
      }

      dispatch(updateVariations([...variations, ...uniqueNewVariations]));
      showToast(`${uniqueNewVariations.length} new variations added successfully!`, "success");
    }
  };

  
  const handleModeChange = (value) => {
    setIsCustom(value);
    setSelectedValues([]);
  };

  
  const getAvailableAttributeValues = (attributeName) => {
    const attribute = selactedAttributes.find(attr => attr.name === attributeName);
    return attribute?.values || [];
  };

  
  const isCurrentSelectionDuplicate = () => {
    if (!isCustome || selectedValues.length === 0) return false;
    
    const validSelectedValues = selectedValues.filter(attr => attr.value && attr.value !== '');
    return checkDuplicateVariation(validSelectedValues);
  };

  return (
    <>
      <div>
        <BreadCrumb name={breadCrumbTitle} />
        <div className='grid grid-cols-12'>
          <div className='col-span-12'>
            <div className='card border-0'>
              <div
                className='tab-pane fade variations-list active show'
                id='tabs-g'
                role='tabpanel'
                aria-labelledby='tabs-7'
              >
                
                <div className='mt-5 mx-6 pb-5'>
                  <div className='rounded-lg mb-2'>
                    <div className='flex justify-between mb-2'>
                      <h6 className='text-gray-700 font-semibold ml-4 mb-2'>
                        Add New Variations
                      </h6>
                      <div className='w-80'>
                        <select
                          value={isCustome}
                          onChange={(e) => {
                            handleModeChange(JSON.parse(e.target.value));
                          }}
                          className='form-select w-full bg-gray-200 h-12 p-1 border-gray-300 rounded-md'
                        >
                          <option value={true}>Custom variation</option>
                          <option value={false}>All possible variations</option>
                        </select>
                      </div>
                    </div>
                    {isCustome ? (
                      <div className='space-y-4'>
                        {selactedAttributes.length > 0 ? (
                          <>
                            <div className='flex gap-2 flex-wrap'>
                              {selactedAttributes?.map((attribute, i) => (
                                <div
                                  key={i}
                                  className='flex-1 min-w-[200px]'
                                >
                                  <label className="block text-sm font-medium  text-gray-700 mb-1">
                                    {attribute.name}
                                  </label>
                                  <select
                                    value={selectedValues.find(attr => attr.name === attribute.name)?.value || ''}
                                    onChange={(e) =>
                                      handleAttributeChange(
                                        attribute.name,
                                        e.target.value
                                      )
                                    }
                                    className='form-select w-full border-gray-300  bg-gray-200 p-2 rounded-md'
                                  >
                                    <option value=''>Select {attribute.name}</option>
                                    {getAvailableAttributeValues(attribute.name)?.map((value, j) => (
                                      <option key={j + "l"} value={value}>
                                        {value}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                            
                            {/* Duplicate Warning */}
                            {isCurrentSelectionDuplicate() && (
                              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                <div className="flex items-center">
                                  <i className="ri-error-warning-line mr-2"></i>
                                  <span>This attribute combination already exists!</span>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No attributes selected. Please add attributes in the Attributes tab first.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 rounded-md">
                        <p className="text-sm text-yellow-700">
                          This will generate all possible combinations of the selected attributes. 
                          Existing variations will be preserved. Duplicates will be automatically filtered out.
                        </p>
                        {variations.length > 0 && (
                          <p className="text-sm text-yellow-600 mt-2">
                            Currently have {variations.length} variations. New unique variations will be added.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className='flex flex-wrap mt-5 justify-end items-center'>
                    <div className='flex items-center space-x-3'>
                      <button
                        type='button'
                        onClick={handlevariationGenarate}
                        disabled={
                          selactedAttributes.length === 0 || 
                          (isCustome && isCurrentSelectionDuplicate())
                        }
                        className='px-4 py-2 btn-primary text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed'
                      >
                        <i className='ri-add-line'></i>{" "}
                        {isCustome ? "Add Custom Variation" : "Generate All Variations"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className='mt-0 mx-6 pb-0 text-gray-700 hidden'>
                  <p>
                    Variations found which don't have price. Empty price
                    variations will not be visible to customers.
                  </p>
                </div>
                <div className='drag_and_drop variation-item-lists'>
                  Variations List Here
                </div>
              </div>

              <div className='p-6 shadow-md rounded-lg bg-white'>
                <div className="flex justify-between items-center mb-3">
                  <h6 className='text-gray-700 font-semibold'>
                    Total Variations ({variations.length})
                  </h6>
                  {variations.length > 0 && (
                    <span className="text-sm text-gray-500">
                      {variations.length} variation(s) created
                    </span>
                  )}
                </div>

                <div className='space-y-4'>
                  {variations.length > 0 ? (
                    variations?.map((variation, index) => (
                      <Variation
                        key={variation.id || variation._id || index}
                        index={index}
                        variation={variation}
                      />
                    ))
                  ) : (
                    <p className='text-gray-500 text-center py-6 text-lg'>
                      No variations available. Add some variations using the controls above.
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