import React from 'react';

interface CourseItemInfo {
  subnum: string;
  subname: string;
  subdetailoverview: string;
  subdetailimg: string;
}

interface CourseDetailProps {
  repeatInfo?: CourseItemInfo[];
}

const CourseDetail: React.FC<CourseDetailProps> = ({ repeatInfo }) => {
  if (!repeatInfo || repeatInfo.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold">여행 코스 정보</h3>
      <div className="space-y-4 mt-2">
        {repeatInfo.map((course, idx) => (
          <div key={idx} className="border rounded-lg p-4 shadow-sm">
            <h4 className="font-bold text-lg">{course.subname}</h4>
            {course.subdetailimg && (
              <img src={course.subdetailimg} alt={course.subname} className="w-full h-48 object-cover my-2 rounded-md" />
            )}
            <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: course.subdetailoverview }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetail;