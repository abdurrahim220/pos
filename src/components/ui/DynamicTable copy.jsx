import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import axiosClient from "../../api/axiosClient";
import { Link } from "react-router-dom";
import { TrLoader } from "../common/TrLoader";

const DynamicTable = ({ apiUrl, renderActions }) => {
	const [items, setItems] = useState([]);
	const [search, setSearch] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalEntries, setTotalEntries] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchItems();
	}, [currentPage, search]);

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
					style={{ objectFit: "contain" }}
					src={item[key]}
					alt={item.name}
					style={{ width: "50px", height: "50px" }}
				/>
			);
		}
		return item[key];
	};

	const fields =
		items.length > 0
			? Object.keys(items[0]).filter(
					(field) => field !== "_id" && field !== "__v"
			  )
			: [];

	return (
		<>
			<div className='grid grid-cols-12'>
				<div className='col-span-12'>
					<div className='card border-0'>
						<div className='card-header flex flex-wrap items-center justify-between gap-3'>
							<div className='flex flex-wrap items-center gap-3'>
								<div className='icon-field relative'>
									<input
										type='text'
										value={search}
										onChange={handleSearch}
										className='bg-white  ps-10 border-neutral-200  rounded-lg w-auto'
										placeholder='Search'
									/>
									<span className='icon absolute top-1/2 left-0 text-lg flex'>
										<Icon icon='ion:search-outline' />
									</span>
								</div>
							</div>
							<div className='flex flex-wrap items-center gap-3'>
								<Link
									to='/admin/categories/create'
									className='btn btn-sm text-sm text-white bg-primary-600 hover:bg-primary-700 flex items-center gap-2'
								>
									<i className='ri-add-line' /> Add New
								</Link>
							</div>
						</div>
						<div className='card-body'>
							<div className='overflow-hidden rounded-lg shadow'>
								{loading ? (
									<TrLoader />
								) : (
									<table className='table-auto w-full bg-white'>
										<thead className='bg-gray-100'>
											<tr>
												<>
													<th className='px-4 py-3 text-left text-gray-700'>
														#
													</th>
													{fields?.map((field) => (
														<th
															className='px-4 py-3 text-left text-gray-700'
															key={field}
														>
															{field.charAt(0).toUpperCase() + field.slice(1)}
														</th>
													))}
													<th>Actions</th>
												</>
											</tr>
										</thead>
										<tbody>
											{items?.map((item, index) => (
												<tr key={item._id}>
													<>
														<td className='px-4 py-3'>{index + 1}</td>
														{fields?.map((key) => (
															<td className='px-4 py-3' key={key}>
																{renderCell(item, key)}
															</td>
														))}
														<td className='text-center'>
															<div>{renderActions(item._id, setItems)}</div>
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
												onClick={() =>
													handlePageChange(Math.max(currentPage - 1, 1))
												}
												disabled={currentPage === 1}
											>
												<Icon icon='ep:d-arrow-left' className='text-xl' />
											</button>
										</li>
										{[...Array(totalPages)]?.map((_, index) => (
											<li className='page-item' key={index}>
												<button
													className={`page-link ${
														currentPage === index + 1
															? "bg-primary-600 text-white"
															: "bg-primary-50  text-secondary-light"
													} font-medium rounded border-0 px-2.5 py-2.5 flex items-center justify-center h-8 w-8`}
													onClick={() => handlePageChange(index + 1)}
												>
													{index + 1}
												</button>
											</li>
										))}
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
