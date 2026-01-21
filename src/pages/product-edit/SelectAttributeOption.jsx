import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import MultiSelect from "../../components/ui/MultiSelect";

const SelectedAttribute = ({ attributeId }) => {
	const [attribute, setAttributes] = useState({});
	const [selectedOptions, setSelectedOptions] = useState([]);
	const [loading, setLoading] = useState(true);

	const handleSelectChange = (event) => {
		const selectedValue = event.target.value;
		const selectedObj = options.find((opt) => opt.value === selectedValue);

		if (selectedObj && !selectedOptions.includes(selectedObj)) {
			setSelectedOptions([...selectedOptions, selectedObj]);
		}
	};

	const removeOption = (valueToRemove) => {
		setSelectedOptions(
			selectedOptions.filter((opt) => opt.value !== valueToRemove)
		);
	};

	const getAttribute = async () => {
		setLoading(true);
		try {
			const res = await axiosClient.get(`attributes/${attributeId}`);
			setAttributes(res.data.attribute);
			setSelectedOptions(res.data.attribute.values);
			setLoading(false);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		getAttribute();
	}, []);

	if (loading) return "Loading...";

	const transformedAttValues = attribute.values?.map((item, index) => ({
		value: item,
		label: `${item}`,
	}));

	return (
		<div>
			<div className='border border-gray-200 rounded mt-2'>
				<div className='flex items-center justify-between bg-gray-50 px-4 py-2 border-b'>
					<div className='flex items-center gap-2'>
						<span className='font-medium'>{attribute.name}</span>
					</div>
				</div>

				<div className='p-4'>
					<div className='mb-4'>
						<div className='text-sm text-gray-700 mb-2'>Values:</div>
					</div>

					{loading ? (
						"Loading..."
					) : (
						<div className='w-full max-w-sm'>
							{/* Multi-Select Dropdown (Flowbite-Styled) */}
							<div className='relative'>
								<select
									onChange={handleSelectChange}
									className='w-full border border-gray-300 rounded-md px-3 py-2 bg-background focus:ring-2 focus:ring-blue-500'
								>
									<option value=''>Select an option</option>
									{options?.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>
						</div>
					)}

					{/* <div className="flex items-center gap-2">
            <button
              //   onClick={handleSelectAll}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
            >
              Select all
            </button>
            <button
              //   onClick={handleSelectNone}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
            >
              Select none
            </button>
          </div> */}
				</div>
			</div>
		</div>
	);
};

export default SelectedAttribute;
