import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import errorReducer from "../features/error/errorSlice";
import loadingReducer from "../features/loading/loadingSlice";
import productReducer from "../features/product/productSlice";
import editProductReducer from "../features/productEdit/editProductSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from  "redux-persist/lib/storage";


const authPersistConfig =   {
	key:   "auth",
	storage,
};

const productPersistConfig = {
	key: "product",
	storage,
};
const editProductPersistConfig = {
	key: "editProduct",
	storage,
};
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedProductReducer = persistReducer(
	productPersistConfig,
	productReducer
);
const persistedEditProductReducer = persistReducer(
	editProductPersistConfig,
	editProductReducer
);

export const store = configureStore({
	reducer: {
		auth: persistedAuthReducer,
		error: errorReducer,
		loading: loadingReducer,
		product: persistedProductReducer,
		editProduct: persistedEditProductReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
			},
		}),
});

export const persistor = persistStore(store);