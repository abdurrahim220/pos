import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeTab: "General",
  categories: [],
  attributes: [],
  brands: [],
  vendors: [],
  branches: [],
  tags: [],
  selectedTags: [],
  selectedValues: [],
  type: "simple",
  variations: [],
  selactedAttributeIds: [],
  selactedAttributes: [],
  default_attributes: [],
  formData: {
    name: "",
    category: "",
    description: "",
    purchase_price: null,
    sale_price: null,
    sku: "",
    stock: null,
    default_image: {},
    images: [],
    video_link: "",
    brand: "",
    branch: "",
    vendor: "",
    tags: [],
    warranty: false,
    status: "Draft",
    sizeGuide: null, // { [attributeId]: string }
  },
  loading: false,
  error: null,
};

const editProductSlice = createSlice({
  name: "editProduct",
  initialState,
  reducers: {
    setEditProduct: (state, action) => {
      const product = action.payload;

      state.formData = {
        name: product?.name || "",
        category: product?.category?._id || "",
        description: product?.description || "",
        purchase_price: product?.purchase_price || 0,
        sale_price: product?.sale_price || 0,
        sku: product?.sku || "",
        stock:
          product?.type === "simple"
            ? product?.stock?.stock || 0
            : product?.stock || 0,
        branchStocks:
          product?.type === "simple"
            ? product?.stock?.branchStocks || []
            : product?.branchStocks || [],
        images: product?.images || [],
        default_image: product?.default_image || {},
        default_price: product?.default_price || 0,
        video_link: product?.video_link || "",
        brand: product?.brand?._id || product?.brand || "",
        branch: product?.branch?._id || product?.branch || "",
        vendor: product?.vendor?._id || product?.vendor || "",
        tags: product?.tags?.length ? product?.tags.map((tag) => tag._id) : [],
        status: product?.status || "Draft",
        warranty: product?.warranty || false,
        sizeGuide: product?.sizeGuide || null,
      };

      state.selectedTags = product?.tags || [];
      state.selectedValues = [];
      state.type = product?.type || "simple";
      state.activeTab = product?.type === "simple" ? "General" : "Inventory";
      state.variations = product?.variations || [];
      if (product?.type === "variable" && product?.variations) {
        state.variations = product.variations.map((variation, index) => {
          const stockInfo = Array.isArray(product?.stock)
            ? product.stock.find((s) => s.sku === variation.sku)
            : null;

          return {
            ...variation,
            // Add stock from the stock array if available
            stock: stockInfo?.stock || variation.stock || 0,
            branchStocks:
              stockInfo?.branchStocks || variation.branchStocks || [],
            stockSummaryId: stockInfo?.stockSummaryId || null,
          };
        });
      } else {
        state.variations = product?.variations || [];
      }
      state.selactedAttributeIds = product?.attributes?.map((a) => a._id) || [];
      state.selactedAttributes =
        product?.attributes?.map((a) => ({
          _id: a._id,
          name: a.name || "",
          values: a.values || [],
        })) || [];
      state.default_attributes = product?.default_attributes || [];
    },

    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },

    setType: (state, action) => {
      state.type = action.payload;
      state.selactedAttributes = [];
    },
    setDefaultAttributes: (state, action) => {
      const { attributeId, value } = action.payload;
      // console.log("setDefaultAttributes", attributeId, value);
      const existingIndex = state.default_attributes.findIndex(
        (attr) => attr._id === attributeId,
      );

      if (existingIndex !== -1) {
        state.default_attributes[existingIndex].value = value;
      } else {
        const attribute = state.selactedAttributes.find(
          (attr) => attr._id === attributeId,
        );
        if (attribute) {
          state.default_attributes.push({
            _id: attributeId,
            name: attribute.name,
            value: value,
          });
        }
      }
    },
    removeDefaultAttribute: (state, action) => {
      state.default_attributes = state.default_attributes.filter(
        (attr) => attr._id !== action.payload,
      );
    },
    clearDefaultAttributes: (state) => {
      state.default_attributes = [];
    },
    updateDefaultAttributesOnAttributeChange: (state) => {
      state.default_attributes = state.default_attributes.filter(
        (defaultAttr) =>
          state.selactedAttributes.some((attr) => attr._id === defaultAttr._id),
      );
    },

    setSelactedAttributeIds: (state, action) => {
      state.selactedAttributeIds = action.payload;
    },

    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    updateDatas: (state, action) => {
      state[action.payload.name] = action.payload.value;
    },
    addImage: (state, action) => {
      state.formData.images.push(action.payload);
    },

    removeImage: (state, action) => {
      state.formData.images = state.formData.images.filter(
        (_, index) => index !== action.payload,
      );
    },

    addSelectedTagValue: (state, action) => {
      if (!state.selectedTags.some((tag) => tag.name === action.payload.name)) {
        state.selectedTags.push(action.payload);
      }
    },

    removeSelectedTagValue: (state, action) => {
      state.selectedTags = state.selectedTags.filter(
        (tag) => tag.name !== action.payload.name,
      );
    },

    addSelectedAttributeValue: (state, action) => {
      const { _id, name, value } = action.payload;
      if (!_id) return;

      const indx = state.selactedAttributes.findIndex((a) => a.name === name);

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
          state.selactedAttributes.push({ _id, name, values: value });
        } else {
          state.selactedAttributes.push({ _id, name, values: [value] });
        }
      }
    },

    updateSelectedAttributes: (state, action) => {
      const index = state.selactedAttributes.findIndex(
        (attr) => attr.name === action.payload.name,
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
        (attr) => attr.name === name,
      );

      if (indx !== -1) {
        const attribute = state.selactedAttributes[indx];
        if (state.type === "simple") {
          attribute.values = "";
        } else {
          attribute.values = attribute.values.filter((v) => v !== value);
        }
      }
    },

    removeSelectedAttribute: (state, action) => {
      state.selactedAttributes = state.selactedAttributes.filter(
        (attr) => attr.name !== action.payload,
      );
    },

    setSelectedValues: (state, action) => {
      state.selectedValues = action.payload;
    },

    updateVariations: (state, action) => {
      state.variations = action.payload;
    },
    updateVariationDefaultImage: (state, action) => {
      const { index, image } = action.payload;
      if (!state.variations[index]) return;

      state.variations[index].default_image = image;
    },
    addVariation: (state, action) => {
      const newVariation = {
        ...action.payload,
        images: [],
        default_image: null,
      };
      const exists = state.variations.some((variation) =>
        variation.attributes.every(
          (attr, index) =>
            attr.name === newVariation[index]?.name &&
            attr.value === newVariation[index]?.value,
        ),
      );
      if (!exists) state.variations.push(newVariation);
    },

    removeVariation: (state, action) => {
      state.variations = state.variations.filter(
        (_, i) => i !== action.payload,
      );
    },

    updateVariationField: (state, action) => {
      const { index, field, value } = action.payload;
      state.variations[index][field] = value;
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
      Object.assign(state, initialState);
    },
  },
});

export const {
  setInnitialState,
  setEditProduct,
  setActiveTab,
  setType,
  setSelactedAttributeIds,
  updateFormData,
  addImage,
  removeImage,
  addSelectedTagValue,
  removeSelectedTagValue,
  addSelectedAttributeValue,
  updateSelectedAttributes,
  removeSelectedAttribute,
  removeSelectedAttributeValue,
  setSelectedValues,
  updateVariations,
  addVariation,
  removeVariation,
  updateVariationField,
  loading,
  updateDatas,
  setLoading,
  setError,
  clearError,
  setDefaultAttributes,
  removeDefaultAttribute,
  clearDefaultAttributes,
  updateDefaultAttributesOnAttributeChange,
  updateVariationDefaultImage,
} = editProductSlice.actions;

export default editProductSlice.reducer;
