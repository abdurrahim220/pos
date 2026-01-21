import React, { useState } from "react";
import { FiSearch } from "react-icons/fi"; // Using a search icon from react-icons

const SearchableSelect = ({ options, onSelect }) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [showSearchIcon, setShowSearchIcon] = useState(false);

	// Filter the options based on the search term
	const filteredOptions = options.filter((option) =>
		option.label.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Toggle the search icon visibility on input click
	const handleInputClick = () => {
		setShowSearchIcon(true);
	};

	return (
		<div className='relative inline-block text-left'>
			{/* Search Input */}
			<div className='relative'>
				<input
					type='text'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					onClick={handleInputClick} // Show search icon when clicked
					className='block w-full p-2 border border-gray-300 rounded-md pl-10'
					placeholder='Search...'
				/>

				{/* Search Icon */}
				{!showSearchIcon && (
					<FiSearch
						className='absolute left-2 top-2 text-gray-500'
						style={{ height: "20px", width: "20px" }}
					/>
				)}
			</div>

			{/* Native Select Dropdown */}
			<select
				className='block w-full p-2 mt-2 border border-gray-300 rounded-md'
				onChange={(e) => onSelect(e.target.value)} // Handle selection
			>
				{filteredOptions.length > 0 ? (
					filteredOptions?.map((option, index) => (
						<option key={index} value={option.value}>
							{option.label}
						</option>
					))
				) : (
					<option disabled>No results found</option>
				)}
			</select>
		</div>
	);
};

export default SearchableSelect;
