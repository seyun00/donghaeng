// /src/components/ReviewList.tsx

import React from 'react';

export interface Review {
  id: string;
  created_at: string;
  user_id: string;
  content_id: string;
  content_type_id: string;
  rating: number;
  content: string;
  userinfo?: { 
    nickname: string;
    profile_url: string;
  };
}

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  if (reviews.length === 0) {
    return <p className="text-gray-500">아직 작성된 리뷰가 없습니다.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <div key={review.id} className="border-b pb-4">
          <div className="flex items-center mb-2">
            <span className="font-semibold">{review.userinfo?.nickname || '익명'}</span>
            <span className="text-yellow-500 ml-2">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
          </div>
          <p className="text-gray-700">{review.content}</p>
          <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;