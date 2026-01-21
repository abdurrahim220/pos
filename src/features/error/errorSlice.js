// redux/slices/errorSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  errors: {}, // Store individual field errors and general errors
};

const errorSlice = createSlice({
  name: 'errorSlice',
  initialState,
  reducers: {
    setFieldError(state, action) {
      state.errors =action.payload;
    },
    setGeneralError(state, action) {
      state.errors.general = action.payload; 
    },
    clearFieldError(state, action) {
      const field = action.payload;
      delete state.errors[field];
    },
    clearAllErrors(state) {
      state.errors = {}; 
    },
  },
});

export const { setFieldError, setGeneralError, clearFieldError, clearAllErrors } = errorSlice.actions;

export default errorSlice.reducer;
