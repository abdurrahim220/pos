import { createSlice } from "@reduxjs/toolkit";

const itialState = {
  activeTab: "General",
  categories: [],
  attributes: [],
  brands: [],
  sizeGuides: [],
  tags: [],
  selectedTags: [],
  selectedValues: [],
  type: "simple",
  variations: [],
  selactedAttributeIds: [],
  selactedAttributes: [],
  defaultAttributes: [],
  formData: {
    name: "",
    category: "",
    description: "",
    sizeGuide: "",
    purchase_price: null,
    sale_price: null,
    sku: null,
    stock: null,
    images: [],
    video_link: "",
    brand: "",
    vendor: "",
    tags: [],
    status: "Draft",
    warranty: false,
  },
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState: itialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setType: (state, action) => {
      if (state.activeTab === "General" && action.payload === "variable") {
        state.type = action.payload;
        state.activeTab = "Inventory";
        state.selactedAttributes = [];
      } else if (
        state.activeTab === "Variations" &&
        action.payload === "simple"
      ) {
        state.activeTab = "General";
        state.type = action.payload;
        state.selactedAttributes = [];
      } else {
        state.type = action.payload;
        state.selactedAttributes = [];
      }
    },
    setDefaultAttribute: (state, action) => {
      const { attributeId, value } = action.payload;
      const existingIndex = state.defaultAttributes.findIndex(
        (attr) => attr._id === attributeId
      );

      if (existingIndex !== -1) {
        state.defaultAttributes[existingIndex].value = value;
      } else {
        // Find the attribute from selected attributes
        const attribute = state.selactedAttributes.find(
          (attr) => attr._id === attributeId
        );
        if (attribute) {
          state.defaultAttributes.push({
            _id: attributeId,
            name: attribute.name,
            value: value,
          });
        }
      }
    },
    removeDefaultAttribute: (state, action) => {
      state.defaultAttributes = state.defaultAttributes.filter(
        (attr) => attr._id !== action.payload
      );
    },

    // NEW: Clear all default attributes
    clearDefaultAttributes: (state) => {
      state.defaultAttributes = [];
    },

    // NEW: Update when attributes change
    updateDefaultAttributesOnAttributeChange: (state) => {
      // Remove default attributes that are no longer in selected attributes
      state.defaultAttributes = state.defaultAttributes.filter((defaultAttr) =>
        state.selactedAttributes.some((attr) => attr._id === defaultAttr._id)
      );
    },

    setSelactedAttributeIds: (state, action) => {
      state.selactedAttributeIds = action.payload;
    },

    // 🔹 Update formData with any field (text or table)
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },

    // 🔹 Specific reducer to update table data
    setSpecTable: (state, action) => {
      state.formData.specTable = action.payload;
    },

    // 🔹 Add a row to the table
    addSpecRow: (state) => {
      state.formData.specTable.push([]);
    },

    // 🔹 Update a cell in the table
    updateSpecCell: (state, action) => {
      const { rowIndex, colIndex, value } = action.payload;
      if (!state.formData.specTable[rowIndex]) {
        state.formData.specTable[rowIndex] = [];
      }
      state.formData.specTable[rowIndex][colIndex] = value;
    },

    // 🔹 Remove a row
    removeSpecRow: (state, action) => {
      state.formData.specTable.splice(action.payload, 1);
    },

    // ✅ existing reducers (same as before)...
    updateDatas: (state, action) => {
      state[action.payload.name] = action.payload.value;
    },
    addImage: (state, action) => {
      state.formData.images.push(action.payload);
    },
    removeImage: (state, action) => {
      state.formData.images = state.formData.images.filter(
        (_, index) => index !== action.payload
      );
    },
    updateVariations: (state, action) => {
      state.variations = action.payload;
    },
    addVariation: (state, action) => {
      const newVariation = action.payload;
      const exists = state.variations.some((variation) =>
        variation.attributes.every(
          (attr, index) =>
            attr.name === newVariation[index]?.name &&
            attr.value === newVariation[index]?.value
        )
      );
      if (!exists) {
        state.variations.push(newVariation);
      }
    },
    removeVariation: (state, action) => {
      state.variations = state.variations.filter(
        (_, i) => i !== action.payload
      );
    },
    updateVariationField: (state, action) => {
      const { index, field, value } = action.payload;
      state.variations[index][field] = value;
    },
    addSelectedTagValue: (state, action) => {
      const exists = state.selectedTags.some(
        (tag) => tag.name === action.payload.name
      );
      if (!exists) {
        state.selectedTags.push(action.payload);
      }
    },
    removeSelectedTagValue: (state, action) => {
      state.selectedTags = state.selectedTags.filter(
        (tag) => tag.name !== action.payload.name
      );
    },
    addSelectedAttributeValue: (state, action) => {
      const { _id, name, value } = action.payload;
      if (!_id) return;
      const indx = state.selactedAttributes.findIndex(
        (atrr) => atrr.name === name
      );
      if (state.selactedAttributes[indx]) {
        if (!state.selactedAttributes[indx].values.includes(value)) {
          if (state.type === "simple") {
            state.selactedAttributes[indx].values = value;
          } else {
            state.selactedAttributes[indx].values.push(value);
          }
        }
      } else {
        if (state.type === "simple") {
          state.selactedAttributes.push({ _id, name: name, values: value });
        } else {
          state.selactedAttributes.push({ _id, name: name, values: [value] });
        }
      }
    },
    updateAttributes: (state, action) => {
      state.attributes = action.payload;
    },
    updateSelectedAttributes: (state, action) => {
      const index = state.selactedAttributes.findIndex(
        (attribute) => attribute.name === action.payload.name
      );
      if (index !== -1) {
        state.selactedAttributes[index] = action.payload;
      } else {
        state.selactedAttributes.push(action.payload);
      }
    },
    removeSelectedAttributeValue: (state, action) => {
      const { name, value } = action.payload;
      const indx = state.selactedAttributes.findIndex(
        (atrr) => atrr.name === name
      );
      if (indx !== -1) {
        const attribute = state.selactedAttributes[indx];
        if (state.type === "simple") {
          attribute.values = "";
        } else {
          if (attribute.values.includes(value)) {
            attribute.values = attribute.values.filter((v) => v !== value);
          }
        }
      }
    },
	updateVariationDefaultImage: (state, action) => {
      const { index, image } = action.payload;
      if (!state.variations[index]) return;

      state.variations[index].default_image = image;
    },
    removeSelectedAttribute: (state, action) => {
      state.selactedAttributes = state.selactedAttributes.filter(
        (atrribute) => atrribute.name !== action.payload
      );
    },
    setSelectedValues: (state, action) => {
      state.selectedValues = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setInnitialState: (state) => {
      Object.assign(state, itialState);
    },
  },
});

export const {
  setInnitialState,
  setActiveTab,
  setType,
  setSelactedAttributeIds,
  updateFormData,
  updateDatas,
  addImage,
  removeImage,
  addSelectedTagValue,
  removeSelectedTagValue,
  addSelectedAttributeValue,
  updateSelectedAttributes,
  removeSelectedAttribute,
  removeSelectedAttributeValue,
  updateAttributes,
  setSelectedValues,
  updateVariations,
  updateVariationField,
  addVariation,
  removeVariation,
  setLoading,
  setError,
  clearError,
  setDefaultAttribute,
  removeDefaultAttribute,
  clearDefaultAttributes,
  updateDefaultAttributesOnAttributeChange,
  updateVariationDefaultImage
} = productSlice.actions;

export default productSlice.reducer;
