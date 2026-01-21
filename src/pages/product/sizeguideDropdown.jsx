/* eslint-disable react/prop-types */
import React from "react";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useDispatch, useSelector } from "react-redux";
import { updateFormData } from "../../features/product/productSlice"; // your slice

export default function SizeGuideDropdown() {
	const dispatch = useDispatch();
	const formData = useSelector((state) => state.product.formData);

	const [sizeGuides, setSizeGuides] = useState([]);
	const [loading, setLoading] = useState(true);

	// Fetch all size guides
	const fetchSizeGuides = async () => {
		setLoading(true);
		try {
			const res = await axiosClient.get("/frontend/size-guides"); // your API
			setSizeGuides(res.data || []);
		} catch (error) {
			console.error("Error fetching size guides:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSizeGuides();
	}, []);

	const handleSelect = (e) => {
		const selectedId = e.target.value;
		const selectedGuide = sizeGuides.find((sg) => sg._id === selectedId);

		dispatch(
			updateFormData({
				...formData,
				sizeGuide: selectedGuide?._id || null,
				sizeGuideText: selectedGuide?.description || "",
				specTable: selectedGuide?.specTable || [[]],
			})
		);
	};

	if (loading) return <div>Loading size guides...</div>;

	return (
		<div className='mb-4'>
			<label className='text-sm font-medium text-gray-800 mb-1 block'>
				Select Size Guide
			</label>
			<select
				value={formData.sizeGuide || ""}
				onChange={handleSelect}
				className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-200'
			>
				<option value=''>-- Choose Size Guide --</option>
				{sizeGuides.map((sg) => (
					<option key={sg._id} value={sg._id}>
						{sg.name}
					</option>
				))}
			</select>
		</div>
	);
}
