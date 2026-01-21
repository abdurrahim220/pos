import { Icon } from "@iconify/react/dist/iconify.js";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BreadCrumb from "../../../components/ui/BreadCrumb";
import axiosClient from "../../../api/axiosClient";
import { Button, Modal, Select } from "flowbite-react";
import { toast } from "react-toastify";

const CreateVarient2 = () => {
	const params = useParams();
	const loading = false;
	const [formData, setFormData] = useState([
		{
			color: "",
			size: "",
			stock: "",
			sku: "",
			price: "",
			discount: "",
			selectedImage: null, // Initialize with no image selected
		},
	]);

	const [images, setImages] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentRowIndex, setCurrentRowIndex] = useState(0);
	const [colors, setColors] = useState([]);
	const [sizes, setSizes] = useState([]);

	const handleChange = (e) => {
		const { name, value } = e.target;

		// Ensure currentRowIndex is within bounds
		if (
			currentRowIndex === null ||
			currentRowIndex < 0 ||
			currentRowIndex >= formData.length
		) {
			console.error("Invalid row index: ", currentRowIndex);
			toast.error("Please select an image first.");
			return;
		}

		const updatedFormData = [...formData];
		updatedFormData[currentRowIndex][name] = value;
		setFormData(updatedFormData);
	};

	const addVariant = () => {
		setFormData([
			...formData,
			{
				color: "",
				size: "",
				stock: "",
				sku: "",
				price: "",
				discount: "",
				selectedImage: null, // Add this to include image for the new variant
			},
		]);

		setCurrentRowIndex(formData.length); // Set currentRowIndex to the newly added row
	};

	const removeVariant = (index) => {
		const updatedFormData = formData.filter((_, i) => i !== index);
		setFormData(updatedFormData);
	};

	const handleImageSelect = (image) => {
		if (currentRowIndex !== null) {
			const updatedFormData = [...formData];
			updatedFormData[currentRowIndex].selectedImage = image; // Update selected image for the row
			setFormData(updatedFormData);
		}
		setIsModalOpen(false); // Close modal after selecting image
	};

	useEffect(() => {
		getGalleryImages();
		fetchColors();
		fetchSizes();
	}, []);

	const getGalleryImages = async () => {
		try {
			const response = await axiosClient.get(`/products/${params.id}`);
			setImages(response.data.product.images);
		} catch (error) {
			console.log(error);
		}
	};

	const fetchColors = async () => {
		try {
			const response = await axiosClient.get(`/colors/all`);
			setColors(response.data.colors);
		} catch (error) {
			console.error("Error fetching colors:", error);
		}
	};

	const fetchSizes = async () => {
		try {
			const response = await axiosClient.get(`/sizes/all`);
			setSizes(response.data.sizes);
		} catch (error) {
			console.error("Error fetching sizes:", error);
		}
	};

	const handleSubmit = async () => {
		// console.log(formData);
		// Add API call or logic to handle form submission
	};

	return (
		<>
			<div>
				<BreadCrumb name={"Create Product Varient"} />
				<div className='grid grid-cols-12'>
					<div className='col-span-12'>
						<div className='card border-0'>
							<div className='card-header flex flex-wrap items-center justify-between gap-3'>
								<div className='flex flex-wrap items-center gap-3'></div>
								<div className='flex flex-wrap items-center gap-3'>
									<Link
										to='/products'
										className='btn btn-sm text-sm text-white bg-black hover:bg-black flex items-center gap-2'
									>
										<Icon icon='mi:arrow-left' /> Back
									</Link>
								</div>
							</div>
							<div className='card-body'>
								<Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
									<Modal.Header>Select Image</Modal.Header>
									<Modal.Body>
										<h2 className='text-lg font-semibold mb-4'>Select Image</h2>
										<div className='grid grid-cols-3 gap-4'>
											{images?.map((image, index) => (
												<div
													key={index}
													className='w-24 h-24 border rounded-md overflow-hidden cursor-pointer'
													onClick={() => handleImageSelect(image)}
												>
													<img
														style={{ objectFit: "contain" }}
														src={image.small}
														alt={`image-${index}`}
														className='w-full h-full  object-contain'
													/>
												</div>
											))}
										</div>
									</Modal.Body>
								</Modal>

								{/* Variant Rows */}
								{formData?.map((data, index) => (
									<div
										key={index}
										className={`flex gap-4 items-center ${
											index > 0 ? "mt-4" : ""
										}`}
									>
										{/* Image Selector */}
										<div className='w-1/6'>
											{data.selectedImage ? (
												<img
													style={{ objectFit: "contain" }}
													src={data.selectedImage.small}
													alt={`selected-row-${index}`}
													className='h-24 w-24  object-contain border-2 border-blue-500 cursor-pointer'
													onClick={() => {
														setCurrentRowIndex(index);
														setIsModalOpen(true);
													}}
												/>
											) : (
												<div
													className='h-24 w-24 border border-gray-300 flex items-center justify-center cursor-pointer'
													onClick={() => {
														setCurrentRowIndex(index);
														setIsModalOpen(true);
													}}
												>
													<p className='text-sm text-gray-500'>No Image</p>
												</div>
											)}
										</div>

										{/* Size Selector */}
										<div className='flex flex-col w-1/5'>
											{sizes.length > 0 && (
												<select
													name='size'
													value={data.size} // Bind the correct value
													onChange={handleChange}
													className='bg-gray-50 border text-gray-900 rounded-lg p-2.5'
												>
													<option>Select Size</option>
													{sizes?.map((size, i) => (
														<option key={i} value={size._id}>
															{size.name}
														</option>
													))}
												</select>
											)}
										</div>

										{/* Color Selector */}
										<div className='flex flex-col w-1/5'>
											{colors.length > 0 && (
												<select
													name='color'
													value={data.color} // Bind the correct value
													onChange={handleChange}
													className='bg-gray-50 border text-gray-900 rounded-lg p-2.5'
												>
													<option>Select Color</option>
													{colors?.map((color, i) => (
														<option key={i} value={color._id}>
															{color.name}
														</option>
													))}
												</select>
											)}
										</div>

										{/* Stock Input */}
										<div className='flex flex-col w-1/5'>
											<input
												id='stock'
												name='stock'
												type='number'
												value={data.stock} // Bind the correct value
												onChange={handleChange}
												className='border rounded-lg px-3 py-2'
												placeholder='Stock'
											/>
										</div>

										{/* SKU Input */}
										<div className='flex flex-col w-1/5'>
											<input
												id='sku'
												name='sku'
												type='text'
												value={data.sku} // Bind the correct value
												onChange={handleChange}
												className='border rounded-lg px-3 py-2'
												placeholder='SKU'
											/>
										</div>

										{/* Price Input */}
										<div className='flex flex-col w-1/5'>
											<input
												id='price'
												name='price'
												type='number'
												value={data.price} // Bind the correct value
												onChange={handleChange}
												className='border rounded-lg px-3 py-2'
												placeholder='Price'
											/>
										</div>

										{/* Discount Input */}
										<div className='flex flex-col w-1/5'>
											<input
												id='discount'
												name='discount'
												type='number'
												value={data.discount} // Bind the correct value
												onChange={handleChange}
												className='border rounded-lg px-3 py-2'
												placeholder='Discount'
											/>
										</div>

										{/* Add/Remove Buttons */}
										<div className='ml-auto flex items-center gap-2'>
											{index === 0 ? (
												<button
													type='button'
													onClick={addVariant}
													className='px-4 py-2 btn-primary text-white rounded-md'
												>
													<i className='ri-add-line'></i>
												</button>
											) : (
												<button
													type='button'
													onClick={() => removeVariant(index)}
													className='px-4 py-2 btn-danger text-white rounded-md'
												>
													<i className='ri-delete-bin-6-line'></i>
												</button>
											)}
										</div>
									</div>
								))}
							</div>

							{/* Submit Button */}
							<div className='card-footer'>
								<button
									onClick={handleSubmit}
									className='btn btn-primary text-white'
								>
									{loading ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Processing...
										</>
									) : (
										"Submit"
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default CreateVarient2;
