import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import axiosClient from "../../api/axiosClient";
import { Link } from "react-router-dom";
import { TrLoader } from "../common/TrLoader";
import { assets } from "../../assets/assets";

const DynamicTable = ({ apiUrl, renderActions, buttons, image, sync }) => {
	const [items, setItems] = useState([]);

	const [search, setSearch] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalEntries, setTotalEntries] = useState(0);
	const [loading, setLoading] = useState(true);
	const maxPageLinks = 10;

	useEffect(() => {
		fetchItems();
		// console.log({img:image});
	}, [currentPage, search, sync]);

	const fetchItems = async () => {
		setLoading(true);
		const res = await axiosClient.get(apiUrl, {
			params: {
				page: currentPage,
				search: search,
			},
		});

		setItems(res.data.items);
		setTotalPages(res.data.totalPages);
		setTotalEntries(res.data.totalEntries);
		setLoading(false);
	};

	const handleSearch = (e) => {
		setSearch(e.target.value);
		setCurrentPage(1);
	};

	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
	};

	const handleEdit = (id) => {
		// Implement edit functionality here
		// console.log(`Edit item with id: ${id}`);
	};

	// const handleLimitChange = (e) => {
	//   setLimit(Number(e.target.value));
	//   setCurrentPage(1); // Go back to the first page when limit changes
	// };

	const renderPageNumbers = () => {
		const pageNumbers = [];
		const half = Math.floor(maxPageLinks / 2);

		let start = Math.max(currentPage - half, 1);
		let end = Math.min(start + maxPageLinks - 1, totalPages);

		if (end - start + 1 < maxPageLinks) {
			start = Math.max(end - maxPageLinks + 1, 1);
		}

		for (let i = start; i <= end; i++) {
			pageNumbers.push(
				<li className='page-item' key={i}>
					<button
						className={`page-link ${
							currentPage === i
								? "bg-primary-600 text-white"
								: "bg-primary-50  text-secondary-light"
						} font-medium rounded border-0 px-2.5 py-2.5 flex items-center justify-center h-8 w-8`}
						onClick={() => handlePageChange(i)}
					>
						{i}
					</button>
				</li>
			);
		}

		return pageNumbers;
	};

	const renderCell = (item, key) => {
		if (typeof item[key] === "object" && item[key] !== null) {
			return Object.keys(item[key])?.map((subKey) => (
				<div key={subKey}>
					<strong>{subKey}:</strong> {item[key][subKey]}
				</div>
			));
		} else if (key === "image") {
			return (
				<img
					src={item[key] ? item[key] : assets.defaults}
					alt={item.name}
					className='shrink-0 me-3 rounded-lg'
					style={{
						objectFit: "contain",
						width: `${image.width}px`,
						height: `${image.height}px`,
					}}
				/>
			);
		} else if (key === "status") {
			if (item[key] === true) {
				return (
					<span className='bg-success-100  text-success-600  px-6 py-1.5 rounded-full font-medium text-sm'>
						Active
					</span>
				);
			}
			return (
				<span className='bg-danger-100  text-danger-600  px-6 py-1.5 rounded-full font-medium text-sm'>
					Inactive
				</span>
			);
		} else if (key === "blocked") {
			if (item[key] === true) {
				return (
					<span className='bg-danger-100  text-danger-600  px-6 py-1.5 rounded-full font-medium text-sm'>
						true
					</span>
				);
			}
			return (
				<span className='bg-success-100  text-success-600  px-6 py-1.5 rounded-full font-medium text-sm'>
					false
				</span>
			);
		} else if (key === "guest") {
			if (item[key] === true) {
				return (
					<span className='bg-danger-100  text-danger-600  px-6 py-1.5 rounded-full font-medium text-sm'>
						true
					</span>
				);
			}
			return (
				<span className='bg-success-100  text-success-600  px-6 py-1.5 rounded-full font-medium text-sm'>
					false
				</span>
			);
		}
		return item[key];
	};

	const fields =
		items?.length > 0
			? Object.keys(items[0])?.filter(
					(field) => field !== "_id" && field !== "__v"
			  )
			: [];
	const sirialFrom = totalEntries - maxPageLinks * (currentPage - 1);
	return (
		<>
			<div className='grid grid-cols-12'>
				<div className='col-span-12'>
					<div className='card border-0'>
						<div className='card-header flex flex-wrap items-center justify-between gap-3'>
							<div className='flex flex-wrap items-center gap-3'>
								<div className='icon-field relative min-w-[500px]'>
									<input
										type='text'
										value={search}
										onChange={handleSearch}
										className='bg-white min-w-[500px]  ps-10 border-neutral-200  rounded-lg '
										placeholder='Search'
									/>
									<span className='icon absolute top-1/2 left-0 text-lg flex'>
										<Icon icon='ion:search-outline' />
									</span>
								</div>
							</div>
							<div className='flex flex-wrap items-center gap-3'>
								{buttons &&
									buttons?.map((button, index) => (
										<Link key={index} to={button.to} className={button.class}>
											<i className={button.icon} /> {button.label}
										</Link>
									))}
							</div>
						</div>
						<div className='card-body'>
							<div className='overflow-hidden rounded-lg shadow'>
								{loading ? (
									<TrLoader />
								) : (
									<table className='table-auto w-full bg-background '>
										<thead className='bg-gray-100 '>
											<tr>
												<>
													<th className='px-4 py-3 text-center text-gray-700 '>
														SL
													</th>
													{fields?.map((field) => (
														<th
															className='px-4 py-3 text-left text-gray-700 '
															key={field}
														>
															{field.charAt(0).toUpperCase() + field.slice(1)}
														</th>
													))}
													<th className='px-4 py-3 text-center text-gray-700 '>
														Actions
													</th>
												</>
											</tr>
										</thead>
										<tbody>
											{items?.map((item, index) => (
												<tr
													key={item._id}
													className='odd:bg-white even:bg-gray-50 '
												>
													<>
														<td className='px-4 py-3 text-gray-900 '>
															{sirialFrom - index}
														</td>
														{fields?.map((key) => (
															<td
																className='px-4 py-3 text-gray-900 '
																key={key}
															>
																{renderCell(item, key)}
															</td>
														))}
														<td className='text-center text-gray-900 '>
															<div>{renderActions(item, setItems)}</div>
														</td>
													</>
												</tr>
											))}
										</tbody>
									</table>
								)}

								{/* Pagination */}
								<div className='flex flex-wrap items-center justify-between gap-2 mt-6'>
									<span>
										Showing {(currentPage - 1) * 10 + 1} to{" "}
										{Math.min(currentPage * 10, totalEntries)} of {totalEntries}{" "}
										entries
									</span>
									<ul className='pagination flex flex-wrap items-center gap-2 justify-center'>
										<li className='page-item'>
											<button
												className='page-link text-secondary-light font-medium rounded border-0 px-2.5 py-2.5 flex items-center justify-center h-8 w-8 bg-background '
												onClick={() => handlePageChange(1)}
												disabled={currentPage === 1}
											>
												First
											</button>
										</li>
										<li className='page-item'>
											<button
												className='page-link text-secondary-light font-medium rounded border-0 px-2.5 py-2.5 flex items-center justify-center h-8 w-8 bg-background '
												onClick={() =>
													handlePageChange(Math.max(currentPage - 1, 1))
												}
												disabled={currentPage === 1}
											>
												<Icon icon='ep:d-arrow-left' className='text-xl' />
											</button>
										</li>
										{renderPageNumbers()}
										<li className='page-item'>
											<button
												className='page-link text-secondary-light font-medium rounded border-0 px-2.5 py-2.5 flex items-center justify-center h-8 w-8 bg-background '
												onClick={() =>
													handlePageChange(
														Math.min(currentPage + 1, totalPages)
													)
												}
												disabled={currentPage === totalPages}
											>
												<Icon icon='ep:d-arrow-right' className='text-xl' />
											</button>
										</li>
										<li className='page-item'>
											<button
												className='page-link text-secondary-light font-medium rounded border-0 px-2.5 py-2.5 flex items-center justify-center h-8 w-8 bg-background '
												onClick={() => handlePageChange(totalPages)}
												disabled={currentPage === totalPages}
											>
												Last
											</button>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default DynamicTable;
