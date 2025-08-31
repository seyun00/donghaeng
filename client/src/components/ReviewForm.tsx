// /src/components/ReviewForm.tsx

import React, { useState } from 'react';

interface ReviewFormProps {
  onSubmit: (rating: number, content: string) => Promise<void>;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length === 0) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }
    setIsSubmitting(true);
    await onSubmit(rating, content);
    setContent('');
    setRating(5);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <h4 className="font-semibold mb-2">리뷰 작성하기</h4>
      <div className="flex items-center mb-2">
        <span className="mr-2">별점:</span>
        <div className="text-2xl cursor-pointer">
          {[1, 2, 3, 4, 5].map(star => (
            <span 
              key={star} 
              className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="리뷰 내용을 입력하세요..."
        className="w-full p-2 border rounded-md"
        rows={4}
      />
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="mt-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
      >
        {isSubmitting ? '등록 중...' : '리뷰 등록'}
      </button>
    </form>
  );
};

export default ReviewForm;