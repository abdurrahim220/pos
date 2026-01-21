import React from 'react'
import {
	addSelectedTagValue,
	removeSelectedTagValue,
} from "../../features/product/productSlice";
import { useDispatch, useSelector } from "react-redux";

const TagMultiSelect = ({ tags }) => {
	const { selectedTags } = useSelector((state) => state.product);

	const dispatch = useDispatch();
	const handleSelectChange = (event) => {
		const selectedValue = event.target.value;

		const indx = tags.findIndex((tag) => tag._id === selectedValue);

		dispatch(addSelectedTagValue(tags[indx]));
	};

	const removeOption = (valueToRemove) => {
		dispatch(removeSelectedTagValue(valueToRemove));
	};

	return (
		<div className='w-full max-w-sm'>
			{/* Multi-Select Dropdown (Flowbite-Styled) */}
			<div className='relative'>
				<select
					onChange={(e) => handleSelectChange(e)}
					className='w-full border border-gray-300 rounded-md px-3 py-2 bg-background focus:ring-2 focus:ring-blue-500'
				>
					<option value=''>Select an option</option>
					{tags?.map((option) => (
						<option key={option._id} value={option._id}>
							{option.name}
						</option>
					))}
				</select>
			</div>

			{/* Selected Items */}
			<div className='mt-3 flex flex-wrap gap-2'>
				{selectedTags &&
					selectedTags?.map((option) => (
						<div
							key={option.name}
							className='flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full text-sm'
						>
							{option.name}
							<button
								onClick={() => removeOption(option)}
								className='text-gray-500 hover:text-red-500'
							>
								✕
							</button>
						</div>
					))}
			</div>
		</div>
	);
};

export default TagMultiSelect;
