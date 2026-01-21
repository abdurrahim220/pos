import { useState } from "react";

const NewVarient = ({ galleryImages, onVariantsChange }) => {
	const [colorVariants, setColorVariants] = useState([]);
	const [newVariant, setNewVariant] = useState({
		color: "",
		code: "",
		image: null,
	});

	const addColorVariant = () => {
		if (newVariant.color && newVariant.code && newVariant.image) {
			const updatedVariants = [...colorVariants, newVariant];
			setColorVariants(updatedVariants);
			setNewVariant({ color: "", code: "", image: null });

			// Notify the parent component
			onVariantsChange(updatedVariants);
		}
	};

	const removeVariant = (index) => {
		const updatedVariants = [...colorVariants];
		updatedVariants.splice(index, 1);
		setColorVariants(updatedVariants);

		// Notify the parent component
		onVariantsChange(updatedVariants);
	};

	const selectImage = (url) => {
		setNewVariant({ ...newVariant, image: url });
	};

	return (
		<div className='space-y-4'>
			<div className='grid grid-cols-3 gap-4'>
				<input
					type='text'
					value={newVariant.color}
					onChange={(e) =>
						setNewVariant({ ...newVariant, color: e.target.value })
					}
					placeholder='Color Name'
					className='form-control'
				/>
				<input
					type='text'
					value={newVariant.code}
					onChange={(e) =>
						setNewVariant({ ...newVariant, code: e.target.value })
					}
					placeholder='Color Code'
					className='form-control'
				/>
			</div>

			{/* Gallery for selecting image */}
			<div className='grid grid-cols-3 gap-2'>
				{galleryImages?.map((item, index) => (
					<div
						key={index}
						className={`p-2 border rounded-lg cursor-pointer ${
							newVariant.image === item.url
								? "border-blue-500"
								: "border-gray-300"
						}`}
						onClick={() => selectImage(item.url)}
					>
						<img
							style={{ objectFit: "contain" }}
							src={item.url}
							alt='Gallery'
							className='w-full h-24  object-contain'
						/>
					</div>
				))}
			</div>

			<button onClick={addColorVariant} className='btn btn-primary mt-4'>
				Add Variant
			</button>

			{/* List of added variants */}
			<ul className='mt-4'>
				{colorVariants?.map((variant, index) => (
					<li
						key={index}
						className='flex items-center justify-between border-b py-2'
					>
						<div className='flex items-center space-x-4'>
							<div
								className='h-6 w-6 rounded-full'
								style={{ backgroundColor: variant.code }}
							></div>
							<span>{variant.color}</span>
							<img
								style={{ objectFit: "contain" }}
								src={variant.image}
								alt='Variant'
								className='h-10 w-10 rounded  object-contain'
							/>
						</div>
						<button
							onClick={() => removeVariant(index)}
							className='text-red-500'
						>
							Remove
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default NewVarient;
