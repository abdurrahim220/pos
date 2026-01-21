import React, { useState, useEffect } from "react";

const MultiSelectComponent = ({
	options,
	selectedValues,
	onChange,
	placeholder,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredOptions, setFilteredOptions] = useState(options.slice(0, 5)); // Initially load 5 options
	const [allOptions, setAllOptions] = useState(options); // Store all options

	// Handle toggle of dropdown
	const toggleDropdown = () => setIsOpen(!isOpen);

	// Handle change of selected option
	const handleSelect = (option) => {
		if (selectedValues.includes(option._id)) {
			onChange(selectedValues.filter((value) => value !== option._id)); // Deselect
		} else {
			onChange([...selectedValues, option._id]); // Select
		}
	};

	// Handle search input change
	const handleSearch = (event) => {
		const query = event.target.value;
		setSearchQuery(query);
		// Filter options based on search query
		setFilteredOptions(
			allOptions
				.filter((option) =>
					option.name.toLowerCase().includes(query.toLowerCase())
				)
				.slice(0, 5) // Limit results to 5 matching options
		);
	};

	useEffect(() => {
		// Reset filtered options when search query is cleared
		if (!searchQuery) {
			setFilteredOptions(allOptions.slice(0, 5));
		}
	}, [searchQuery, allOptions]);

	return (
		<div className='relative'>
			<button
				className='w-full text-left p-3 border rounded-lg bg-background   text-black focus:outline-none'
				onClick={toggleDropdown}
			>
				{selectedValues.length === 0
					? placeholder
					: `${selectedValues.length} selected`}
			</button>

			{isOpen && (
				<div className='absolute z-10 w-full mt-1 bg-background  border rounded-lg shadow-lg max-h-60 overflow-y-auto'>
					{/* Search input */}
					<div className='p-2'>
						<input
							type='text'
							value={searchQuery}
							onChange={handleSearch}
							placeholder='Search...'
							className='w-full p-2 border rounded-lg bg-gray-100   text-black focus:outline-none'
						/>
					</div>

					{/* Option list */}
					<ul className='divide-y divide-gray-200 dark:divide-gray-700'>
						{filteredOptions.length > 0 ? (
							filteredOptions?.map((option) => (
								<li
									key={option._id}
									className='p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600'
									onClick={() => handleSelect(option)}
								>
									<div className='flex items-center'>
										<input
											type='checkbox'
											checked={selectedValues.includes(option._id)}
											onChange={() => handleSelect(option)}
											className='mr-2'
										/>

										<span
											className={
												selectedValues.includes(option._id) ? "font-bold" : ""
											}
										>
											{option.name}
										</span>
									</div>
								</li>
							))
						) : (
							<li className='p-2 text-gray-500 '>No options found</li>
						)}
					</ul>
				</div>
			)}
		</div>
	);
};

export default MultiSelectComponent;
