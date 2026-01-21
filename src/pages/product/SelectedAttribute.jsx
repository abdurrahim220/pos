/* eslint-disable react/prop-types */
import React from "react";
import  { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../../api/axiosClient";
import MultiSelect from "../../components/ui/MultiSelect";

import { updateFormData } from "../../features/product/productSlice"; // ✅ import slice actions
import SizeGuideDropdown from "./sizeguideDropdown";

const SelectedAttribute = ({ attributeId, handleDeleteAttributeId }) => {
	const dispatch = useDispatch();
	const [attribute, setAttribute] = useState({});
	const [loading, setLoading] = useState(true);
	// ✅ Get from slice
	const formData = useSelector((state) => state.product.formData);
	const isSizeAttr = useMemo(
		() => (attribute?.name || "").toLowerCase().includes("size"),
		[attribute?.name]
	);

	// ✅ Fetch attribute from API
	const getAttribute = async () => {
		setLoading(true);
		try {
			const res = await axiosClient.get(`attributes/${attributeId}`);
			const a = res?.data?.attribute || {};
			setAttribute(a);
		} catch (error) {
			console.log("Error fetching attribute:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getAttribute();
	}, [attributeId]);

	// if (loading) return <div className='p-4'>Loading attribute...</div>;

	// ✅ Transform values for MultiSelect
	const transformedAttValues =
		attribute?.values?.map((item) => ({ value: item, label: `${item}` })) || [];

	return (
		<div className='border border-gray-200 rounded mt-2'>
			{/* Header */}
			<div className='flex items-center justify-between bg-gray-50 px-4 py-2 border-b'>
				<div className='flex items-center gap-2'>
					<span className='font-medium'>{attribute?.name || "Attribute"}</span>
				</div>
				<button
					onClick={() => handleDeleteAttributeId(attributeId, attribute.name)}
					className='text-red-500 hover:text-red-600 text-sm'
				>
					Delete
				</button>
			</div>

			{/* Body */}
			<div className='p-4'>
				{/* MultiSelect */}
				<div className='mb-4'>
					<div className='text-sm text-gray-700 mb-2'>Values:</div>
					<MultiSelect
						formData={formData}
						setFormData={(data) => dispatch(updateFormData(data))}
						options={transformedAttValues}
						atrribute={attribute}
					/>
				</div>
			</div>

			{/* Size Guide Dropdown */}
			{isSizeAttr && <SizeGuideDropdown />}
		</div>
	);
};

export default SelectedAttribute;
