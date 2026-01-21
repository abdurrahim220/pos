import React from 'react'
import { FaUser } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";

const Reviews = ({ reviews, onDelete }) => {
	return (
		<div className='bg-white p-6 rounded-xl   mx-auto'>
			<h3 className='text-xl font-semibold mb-4'>
				Customer Reviews ({reviews.length})
			</h3>
			{!reviews || reviews.length === 0 ? (
				<p className='text-gray-500'>No reviews yet.</p>
			) : (
				<ul className='space-y-4'>
					{reviews?.map((review) => (
						<li
							key={review._id}
							className='border p-4 rounded-lg shadow-sm flex justify-between items-center'
						>
							<div>
								<div className='flex items-center space-x-3'>
									{review.user.image ? (
										<img
											style={{ objectFit: "contain" }}
											src={review.user.image}
											alt={review.user.name}
											className='w-10 h-10 rounded-full border'
										/>
									) : (
										<FaUser className='w-10 h-10 p-2 border rounded-full text-gray-400' />
									)}
									<strong className='text-gray-700'>{review.user.name}</strong>
								</div>
								<p className='mt-2 text-yellow-500'>
									Rating: {review.rating} ⭐
								</p>
								<p className='text-gray-700'>{review.review}</p>
							</div>
							<button
								onClick={() => onDelete(review._id)}
								className='text-red-500 hover:text-red-700 transition'
							>
								<FaTrash className='w-5 h-5' />
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default Reviews;
