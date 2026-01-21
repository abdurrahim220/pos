import React, { useState } from "react";

const ColorVariantsForm = () => {
	const [colorVariants, setColorVariants] = useState([]);
	const [newVariant, setNewVariant] = useState({
		color: "",
		code: "",
		image: null,
		preview: null, // For image preview
	});

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewVariant({ ...newVariant, [name]: value });
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setNewVariant({
				...newVariant,
				image: file,
				preview: URL.createObjectURL(file),
			});
		}
	};

	const addColorVariant = () => {
		if (newVariant.color && newVariant.code && newVariant.image) {
			setColorVariants([...colorVariants, newVariant]);
			setNewVariant({ color: "", code: "", image: null, preview: null });
		}
	};

	const removeVariant = (index) => {
		const updatedVariants = [...colorVariants];
		updatedVariants.splice(index, 1);
		setColorVariants(updatedVariants);
	};

	return (
		<>
			{/* Form for adding a new variant */}
			<div className='grid grid-cols-12 gap-4 mb-6'>
				<div className='col-span-4'>
					<label className='block text-sm font-medium mb-1'>Color Name</label>
					<input
						type='text'
						name='color'
						value={newVariant.color}
						onChange={handleInputChange}
						placeholder='e.g., Red'
						className='form-control w-full px-3 py-2 border rounded-lg bg-gray-50   focus:outline-none'
					/>
				</div>
				<div className='col-span-4'>
					<label className='block text-sm font-medium mb-1'>Color Code</label>
					<input
						type='text'
						name='code'
						value={newVariant.code}
						onChange={handleInputChange}
						placeholder='e.g., #FF0000'
						className='form-control w-full px-3 py-2 border rounded-lg bg-gray-50   focus:outline-none'
					/>
				</div>
				<div className='col-span-4'>
					<label className='block text-sm font-medium mb-1'>Image</label>
					<input
						type='file'
						accept='image/*'
						onChange={handleFileChange}
						className='block w-full text-sm text-gray-500  file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-neutral-700 file:text-gray-700 dark:file:text-white hover:file:bg-gray-200 dark:hover:file:bg-neutral-600'
					/>
				</div>
				<div className='col-span-12'>
					<button
						type='button'
						onClick={addColorVariant}
						className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none disabled:opacity-50'
						disabled={
							!newVariant.color || !newVariant.code || !newVariant.image
						}
					>
						Add Variant
					</button>
				</div>
			</div>

			{/* Preview of color variants */}
			<div className='grid grid-cols-12 gap-4'>
				{colorVariants?.map((variant, index) => (
					<div
						key={index}
						className='col-span-3 bg-gray-50  p-4 rounded-lg shadow-md flex flex-col items-center'
					>
						<img
							style={{ objectFit: "contain" }}
							src={variant.preview}
							alt={variant.color}
							className='w-24 h-24  object-contain rounded-lg mb-3'
						/>
						<p className='text-sm font-medium'>{variant.color}</p>
						<p className='text-xs text-gray-500 '>{variant.code}</p>
						<button
							type='button'
							onClick={() => removeVariant(index)}
							className='mt-3 px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700'
						>
							Remove
						</button>
					</div>
				))}
			</div>
		</>
	);
};

export default ColorVariantsForm;
