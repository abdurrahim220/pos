import React, { useState } from "react";
import {
	addSelectedAttributeValue,
	removeSelectedAttributeValue,
} from "../../features/product/productSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
const MultiSelect = ({ atrribute, options, formData, setFormData }) => {
	const { selactedAttributes, type } = useSelector((state) => state.product);
	const [selectedOptions, setSelectedOptions] = useState(
		type === "simple" ? "" : []
	);
	const dispatch = useDispatch();
	const handleSelectChange = (event) => {
		const selectedValue = event.target.value;
		dispatch(
			addSelectedAttributeValue({
				_id: atrribute._id,
				name: atrribute?.name,
				value: selectedValue,
			})
		);
	};
	// console.log("sel", typeof selectedOptions);

	const removeOption = (valueToRemove) => {
		// setSelectedOptions(
		// 	selectedOptions.filter((opt) => opt.value !== valueToRemove)
		// );
		dispatch(
			removeSelectedAttributeValue({
				name: atrribute.name,
				value: valueToRemove,
			})
		);
	};

	useEffect(() => {
		if (!selactedAttributes || !atrribute) return;

		const tsAttributeIndex = selactedAttributes.findIndex(
			(sa) => sa.name === atrribute.name
		);

		if (selactedAttributes[tsAttributeIndex]) {
			setSelectedOptions(selactedAttributes[tsAttributeIndex].values);
		}
	}, [selactedAttributes, atrribute]);

	return (
		<div className='w-full max-w-sm'>
			{/* Multi-Select Dropdown (Flowbite-Styled) */}
			<div className='relative'>
				<select
					onChange={(e) => handleSelectChange(e)}
					className='w-full border border-gray-300 rounded-md px-3 py-2 bg-background focus:ring-2 focus:ring-blue-500'
				>
					<option value=''>Select an option</option>
					{options &&
						options.length > 0 &&
						options?.map((option) => (
							<option key={option.value} value={option.value}>
								{option.value}
							</option>
						))}
				</select>
			</div>

			{/* Selected Items */}
			<div className='mt-3 flex flex-wrap gap-2'>
				{type === "simple" ? (
					<>
						{selectedOptions && selectedOptions !== "" && (
							<div className='flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full text-sm'>
								{selectedOptions}
								<button
									onClick={() => removeOption(selectedOptions)}
									className='text-gray-500 hover:text-red-500'
								>
									✕
								</button>
							</div>
						)}
					</>
				) : (
					<>
						{selectedOptions &&
							selectedOptions !== "" &&
							typeof selectedOptions !== "string" &&
							selectedOptions.length > 0 &&
							selectedOptions?.map((option) => (
								<div
									key={option}
									className='flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full text-sm'
								>
									{option}
									<button
										onClick={() => removeOption(option)}
										className='text-gray-500 hover:text-red-500'
									>
										✕
									</button>
								</div>
							))}
					</>
				)}
			</div>
		</div>
	);
};

export default MultiSelect;
