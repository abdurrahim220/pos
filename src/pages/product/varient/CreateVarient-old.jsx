import { Icon } from "@iconify/react/dist/iconify.js";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BreadCrumb from "../../../components/ui/BreadCrumb";
import axiosClient from "../../../api/axiosClient";
import { Button, Modal, Select } from "flowbite-react";
import SearchableSelect from "../../../components/ui/SearchableSelect";
import { toast } from "react-toastify";

const CreateVarient = () => {
	const params = useParams();

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

		if (
			currentRowIndex === null ||
			currentRowIndex < 0 ||
			currentRowIndex >= formData.length
		) {
			toast.error("Please select an image first.");
			return;
		}

		const updatedFormData = [...formData];
		updatedFormData[currentRowIndex][name] = value;
		setFormData(updatedFormData);

		// console.log(currentRowIndex);
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
				selectedImage: null,
			},
		]);

		setCurrentRowIndex(formData.length); // Set currentRowIndex to the newly added row
	};

	const removeVariant = (index) => {
		const updatedFormData = formData.filter((_, i) => i !== index);
		setFormData(updatedFormData);
		if (currentRowIndex >= index) {
			setCurrentRowIndex(null); // Reset currentRowIndex if the removed index was the current one or higher
		}
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
			console.error("Error fetching gallery images:", error);
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
		const isAnyKeyEmpty = formData.some((product) => {
			return Object.values(product).some((value) => {
				if (typeof value === "object" && value !== null) {
					// Nested object check korbo
					return Object.values(value).some((nestedValue) => !nestedValue);
				}
				return !value; // Jodi value empty hoy
			});
		});

		if (isAnyKeyEmpty) {
			console.log("Kono product e kono key empty ache.");
		} else {
			console.log("Shob product e shob key full ache.");
		}
		// console.log(formData);
		// Add your submit logic here
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

								{formData?.map((data, index) => (
									<div
										key={index}
										className={`flex gap-4 items-center ${
											index > 0 ? "mt-4" : ""
										}`}
									>
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

										<div className='flex flex-col w-1/5'>
											{sizes.length > 0 ? (
												<select
													name='size'
													value={data.size}
													onChange={handleChange}
													className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
												>
													<option>Select Size</option>
													{sizes?.map((size, index) => (
														<option key={index} value={size._id}>
															{size.name}
														</option>
													))}
												</select>
											) : (
												"Loading sizes..."
											)}
										</div>

										<div className='flex flex-col w-1/5'>
											{colors.length > 0 ? (
												<select
													name='color'
													value={data.color}
													onChange={handleChange}
													className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
												>
													<option>Select Color</option>
													{colors?.map((color, index) => (
														<option key={index} value={color._id}>
															{color.name}
														</option>
													))}
												</select>
											) : (
												"Loading colors..."
											)}
										</div>

										<div className='flex flex-col w-1/5'>
											<input
												id='stock'
												name='stock'
												type='number'
												value={data.stock}
												onChange={(e) => {
													setCurrentRowIndex(index);
													handleChange(e);
												}}
												className='border rounded-lg px-3 py-2'
												placeholder='Stock'
											/>
										</div>

										<div className='flex flex-col w-1/5'>
											<input
												id='sku'
												name='sku'
												type='text'
												value={data.sku}
												onChange={(e) => {
													setCurrentRowIndex(index);
													handleChange(e);
												}}
												className='border rounded-lg px-3 py-2'
												placeholder='SKU'
											/>
										</div>

										<div className='flex flex-col w-1/5'>
											<input
												id='price'
												name='price'
												type='number'
												value={data.price}
												onChange={(e) => {
													setCurrentRowIndex(index);
													handleChange(e);
												}}
												className='border rounded-lg px-3 py-2'
												placeholder='Price'
											/>
										</div>

										<div className='flex flex-col w-1/5'>
											<input
												id='discount'
												name='discount'
												type='number'
												value={data.discount}
												onChange={(e) => {
													setCurrentRowIndex(index);
													handleChange(e);
												}}
												className='border rounded-lg px-3 py-2'
												placeholder='Discount'
											/>
										</div>

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
													className='px-4 py-2 bg-red-600 text-white rounded-md'
												>
													<i className='ri-delete-bin-2-line'></i>
												</button>
											)}
										</div>
									</div>
								))}

								<div className='mt-4'>
									<button
										type='submit'
										className='bg-primary-600 text-white px-6 py-2'
										onClick={handleSubmit}
									>
										Save Variant
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default CreateVarient;
