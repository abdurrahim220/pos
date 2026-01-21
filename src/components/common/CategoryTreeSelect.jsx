import React from "react";
import { useState, useEffect } from "react";

const CategoryTreeSelect = ({ categories, formData, setFormData }) => {
	const [categoryTree, setCategoryTree] = useState([]);

	// Function to build category tree from flat list
	const buildCategoryTree = (categories) => {
		const categoryMap = new Map();
		categories.forEach((category) =>
			categoryMap.set(category._id, { ...category, children: [] })
		);

		const tree = [];
		categories.forEach((category) => {
			if (category.parent_id) {
				categoryMap
					.get(category.parent_id)
					?.children.push(categoryMap.get(category._id));
			} else {
				tree.push(categoryMap.get(category._id));
			}
		});

		return tree;
	};

	useEffect(() => {
		setCategoryTree(buildCategoryTree(categories));
	}, [categories]);

	// Function to render categories as nested options
	const renderOptions = (categoryList, prefix = "") => {
		return categoryList?.map((category) => (
			<React.Fragment key={category._id}>
				<option value={category._id}>
					{prefix}
					{category.name}
				</option>
				{category.children.length > 0 &&
					renderOptions(category.children, `${prefix}— `)}
			</React.Fragment>
		));
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ [name]: value });
	};
	return (
		<select
			name='category'
			onChange={handleChange}
			className='border rounded p-2 w-full'
			value={formData.category}
		>
			<option value=''>Select Category</option>
			{renderOptions(categoryTree)}
		</select>
	);
};

export default CategoryTreeSelect;
