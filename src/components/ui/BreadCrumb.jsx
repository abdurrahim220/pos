import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";

const BreadCrumb = ({ name }) => {
	return (
		<div>
			<div className='flex flex-wrap items-center justify-between gap-2 mb-6'>
				<h6 className='font-semibold mb-0 '>{name}</h6>
				<ul className='flex items-center gap-[6px]'>
					<li className='font-medium'>
						<Link
							to='/'
							className='flex items-center gap-2 hover:text-primary-600 '
						>
							<Icon
								icon='solar:home-smile-angle-outline'
								className='icon text-lg'
							/>
							Dashboard
						</Link>
					</li>
					<li className=''>-</li>
					<li className='font-medium '>{name}</li>
				</ul>
			</div>
		</div>
	);
};

export default BreadCrumb;
