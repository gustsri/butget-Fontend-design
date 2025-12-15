import React from 'react';

export default function RevenueHeader({ year }: { year: number }) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-lg font-bold text-gray-800">คณะเทคโนโลยีสารสนเทศ</h1>
      <h2 className="text-md font-medium text-gray-700">ประมาณการรายรับเงินรายได้</h2>
      <h3 className="text-md font-medium text-gray-700">ประจำปีงบประมาณ {year}</h3>
    </div>
  );
}