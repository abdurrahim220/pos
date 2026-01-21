import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeDefaultAttribute, setDefaultAttribute } from '../../features/product/productSlice';

const DefaultAttributeSelector = () => {
  const dispatch = useDispatch();
  const { selactedAttributes, defaultAttributes } = useSelector((state) => state.product);

  const handleDefaultAttributeChange = (attributeId, value) => {
    if (value) {
      // Remove any existing default attribute first, then set the new one
      if (defaultAttributes.length > 0) {
        dispatch(removeDefaultAttribute(defaultAttributes[0]._id));
      }
      dispatch(setDefaultAttribute({ attributeId, value }));
    } else {
      dispatch(removeDefaultAttribute(attributeId));
    }
  };

  const getCurrentDefaultAttributeId = () => {
    return defaultAttributes.length > 0 ? defaultAttributes[0]._id : null;
  };

  if (selactedAttributes.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Default Attributes</h3>
      <p className="text-sm text-gray-600 mb-3">
        Set default values that will be pre-selected for customers (Only one attribute can be set as default)
      </p>
      
      <div className="space-y-3">
        {selactedAttributes.map((attribute) => (
          <div key={attribute._id} className="flex items-center justify-between p-2 border rounded">
            <label className="font-medium text-sm">{attribute.name}</label>
            <select
              value={
                attribute._id === getCurrentDefaultAttributeId() 
                  ? defaultAttributes.find(da => da._id === attribute._id)?.value || ''
                  : ''
              }
              onChange={(e) => handleDefaultAttributeChange(attribute._id, e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="">Select default value</option>
              {Array.isArray(attribute.values) ? (
                attribute.values.map((value, index) => (
                  <option key={index} value={value}>
                    {value}
                  </option>
                ))
              ) : (
                <option value={attribute.values}>{attribute.values}</option>
              )}
            </select>
          </div>
        ))}
      </div>

      {defaultAttributes.length > 0 && (
        <div className="mt-3 p-2 bg-blue-50 rounded">
          <h4 className="font-medium text-sm mb-1">Selected Default:</h4>
          {defaultAttributes.map((attr) => (
            <div key={attr._id} className="text-xs text-gray-700">
              {attr.name}: {attr.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DefaultAttributeSelector;