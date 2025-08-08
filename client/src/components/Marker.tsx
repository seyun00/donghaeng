import React from 'react';
// 컴포넌트가 받을 props의 타입을 정의
interface NumberedMarkerProps {
  number: number;
}

const NumberedMarker: React.FC<NumberedMarkerProps> = ({ number }) => {
  const markerStyle: React.CSSProperties = {
    position: 'relative',
    width: 30,
    height: 30,
    borderRadius: '50%',
    backgroundColor: '#ff6347', 
    border: '2px solid #fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    cursor: 'pointer',
  };

  return (
    <div style={markerStyle}>
      {number}
    </div>
  );
};

export default NumberedMarker;