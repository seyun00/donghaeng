// /src/hooks/useDragAndDrop.ts

import { useState } from 'react';
import supabase from '../api/supabaseClient';
// [수정됨] Spot 타입을 PlanSpotItem에서 import하여 일관성을 유지합니다.
import { Spot } from '../components/PlanSpotItem';

export function useDragAndDrop(spots: Spot[], setSpots: React.Dispatch<React.SetStateAction<Spot[]>>) {
  // 드래그 상태 관리를 훅 내부로 이동
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleDragStart = (spotId: string) => {
    setDraggedItemId(spotId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault(); // 드롭을 허용하기 위해 필수
  };

  const handleDrop = async (droppedOnItemId: string) => {
    if (!draggedItemId || draggedItemId === droppedOnItemId) {
      // 드래그가 시작되지 않았거나 같은 위치에 드롭된 경우 무시
      setDraggedItemId(null);
      return;
    }

    const oldIndex = spots.findIndex(s => s.id === draggedItemId);
    const newIndex = spots.findIndex(s => s.id === droppedOnItemId);

    // 순서가 변경된 새로운 배열 생성
    const newOrderedSpots = [...spots];
    const [draggedItem] = newOrderedSpots.splice(oldIndex, 1);
    newOrderedSpots.splice(newIndex, 0, draggedItem);
    
    // 1. UI 즉시 업데이트 (부모 컴포넌트의 state 변경)
    setSpots(newOrderedSpots);

    // 2. DB 업데이트
    const updates = newOrderedSpots.map((spot, index) => ({
      id: spot.id,
      visit_order: index, // visit_order를 새로운 순서로 업데이트
    }));

    const { error } = await supabase.from('plan_spots').upsert(updates);
    if (error) {
      console.error("순서 업데이트 실패:", error);
      setSpots(spots); // 실패 시 원래 순서로 복구
    }
    
    // 드래그 상태 초기화
    setDraggedItemId(null);
  };

  const handleDragEnd = () => {
    // 드래그가 취소되는 등 정상적으로 drop되지 않았을 때를 위해 상태 초기화
    setDraggedItemId(null);
  };

  // 컴포넌트에서 사용할 상태와 핸들러들을 반환
  return {
    draggedItemId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
}