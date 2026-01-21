import React, { useEffect, useState } from "react";
import SelectedAttribute from "./SelectedAttribute";
import ParentComponent from "./varient/CreateVarient";
import { useDispatch, useSelector } from "react-redux";
import {
	setType,
	setSelactedAttributeIds,
	setSelectedValues,
	removeSelectedAttribute,
	setActiveTab,
} from "../../features/productEdit/editProductSlice";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

const ProductDataCard = ({ Allattributes, setFormData, product }) => {
	const { type, selectedValues, activeTab, formData, selactedAttributeIds } =
		useSelector((state) => state.editProduct);
	const dispatch = useDispatch();

	const [sku, setSku] = useState(formData.sku || "");
	const [skuValid, setSkuValid] = useState(null); // null = no validation yet
	const [isChecking, setIsChecking] = useState(false);
	const currentsku = product?.sku || "";
	const tabs =
		type === "simple"
			? ["General", "Inventory", "Attributes"]
			: ["Inventory", "Attributes", "Variations"];
	useEffect(() => {
		if (isChecking || !skuValid) return;
		setFormData({ sku: sku });
	}, [skuValid, isChecking]);
	useEffect(() => {
		if (!sku) return;

		const delayDebounce = setTimeout(async () => {
			try {
				setIsChecking(true);
				const response = await axiosClient.get(
					`/products/validate-sku?sku=${sku}`
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
	useEffect(() => {
		setSku(formData.sku);
	}, [formData.sku]);
	//attributes

	const handleAttrSelect = (event) => {
		const id = event.target.value;
		// Avoid adding duplicate IDs
		dispatch(
			setSelactedAttributeIds(
				selactedAttributeIds.includes(id)
					? selactedAttributeIds
					: [...selactedAttributeIds, id]
			)
		);
	};
	const handleDeleteAttributeId = (id, name) => {
		dispatch(
			setSelactedAttributeIds(selactedAttributeIds.filter((aid) => aid !== id))
		);
		dispatch(removeSelectedAttribute(name));
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;

		setFormData({ [name]: value });
	};

	return (
		<div className='p-4 bg-background shadow-md rounded-lg w-full max-w-4xl mt-3'>
			{/* Header */}
			<div className='flex justify-between items-center mb-4'>
				<div>
					<label className='inline-flex items-center'></label>
					<label className='inline-flex items-center ml-4'></label>
				</div>
				<select
					value={type}
					onChange={(e) => dispatch(setType(e.target.value))}
					className='border rounded px-3 py-2'
					disabled
				>
					<option value='simple'>Simple Product</option>
					<option value='variable'>Variable Product</option>
				</select>
			</div>

			{/* Tabs */}
			<div className='border-b mb-4'>
				<ul className='flex space-x-4'>
					{tabs?.map((tab) => (
						<li
							key={tab}
							className={`cursor-pointer py-2 px-4 ${
								activeTab === tab
									? "border-b-2 border-yellow-500 text-yellow-500"
									: "text-gray-700"
							}`}
							onClick={() => dispatch(setActiveTab(tab))}
						>
							{tab}
						</li>
					))}
				</ul>
			</div>

			
			<div>
				{activeTab === "General" && (
					<div>
						<div className='grid grid-cols-2 gap-4 mb-4 p-2'>
							<div>
								<label className='block text-sm font-medium text-gray-700'>
									Purchase Price (BDT)
								</label>
								<input
									type='text'
									name='purchase_price'
									value={formData.purchase_price}
									onChange={handleInputChange}
									placeholder='Price'
									className='w-full border border-gray-300 rounded px-3 py-2'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-700'>
									Sale Price (BDT)
								</label>
								<input
									type='text'
									name='sale_price'
									value={formData.sale_price}
									onChange={handleInputChange}
									placeholder='Sale Price'
									className='w-full border border-gray-300 rounded px-3 py-2'
								/>
							</div>
						</div>
					</div>
				)}

				{activeTab === "Inventory" && (
					<>
						{type === "simple" ? (
							<div className='grid grid-cols-2 gap-4 mb-4 p-2'>
								{/* SKU Field */}
								<div className='mb-4'>
									<div className='flex justify-between items-center '>
										<label className='block text-sm font-medium text-gray-700'>
											SKU
										</label>
									</div>
									<input
										type='text'
										placeholder='SKU'
										name='sku'
										value={sku}
										required
										disabled
										onChange={(e) => setSku(e.target.value)}
										className='w-full border border-gray-300 rounded px-3 py-2'
									/>
								</div>

								
							</div>
						) : (
							<div className='mt-4'>
								<h3 className='text-lg font-semibold mb-2'>Variations</h3>
								<div className='border border-gray-300 rounded p-2'>
									{product?.variations.length > 0 ? (
										<table className='w-full border-collapse border border-gray-300'>
											<thead>
												<tr className='bg-gray-100'>
													<th className='border p-2 text-left'>SKU</th>

													<th className='border p-2 text-left'>Attributes</th>
												</tr>
											</thead>
											<tbody>
												{product?.variations?.map((variation, index) => (
													<tr key={index} className='border'>
														<td className='border p-2'>{variation.sku}</td>

														<td className='border p-2'>
															{variation.attributes?.map((attr, idx) => (
																<div key={idx} className='text-sm'>
																	<strong>{attr.name}:</strong> {attr.value}
																</div>
															))}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									) : (
										<p className='text-gray-500 text-sm'>
											No variations available.
										</p>
									)}
								</div>
							</div>
						)}
					</>
				)}

				{activeTab === "Attributes" && (
					<div>
						<div className='max-w-4xl mx-auto p-4'>
							{/* Top Bar */}
							<div className='flex items-center gap-2 mb-4'>
								<div className='relative w-48'>
									<select
										onChange={handleAttrSelect}
										className='w-full appearance-none border border-gray-300 rounded px-3 py-2 bg-background focus:outline-none focus:border-blue-500'
									>
										<option>Select Attribute</option>

										{Allattributes &&
											Allattributes?.map((attr, i) => (
												<option key={`${attr._id}-${i}`} value={attr._id}>
													{attr.name}
												</option>
											))}
									</select>
								</div>
							</div>

							{/* Attr Section */}
							{selactedAttributeIds &&
								selactedAttributeIds?.map((attrId, i) => (
									<SelectedAttribute
										key={i}
										attributeId={attrId}
										formData={formData}
										setFormData={setFormData}
										handleDeleteAttributeId={handleDeleteAttributeId}
									/>
								))}
						</div>
					</div>
				)}

				{activeTab === "Variations" && (
					<ParentComponent selectedAttr={selactedAttributeIds} />
				)}
			</div>
		</div>
	);
};

export default ProductDataCard;
