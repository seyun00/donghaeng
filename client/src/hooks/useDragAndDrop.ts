// /src/hooks/useDragAndDrop.ts

import { useState } from 'react';
import supabase from '../api/supabaseClient';
import { Spot } from '../components/PlanSpotItem';

export function useDragAndDrop(spots: Spot[], setSpots: React.Dispatch<React.SetStateAction<Spot[]>>) {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleDragStart = (spotId: string) => {
    setDraggedItemId(spotId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
  };

  // [수정됨] DB에 먼저 저장하고, 성공 시에만 화면을 업데이트하는 방식으로 변경
  const handleDrop = async (droppedOnItemId: string) => {
    if (!draggedItemId || draggedItemId === droppedOnItemId) {
      setDraggedItemId(null);
      return;
    }

    const draggedItem = spots.find(s => s.id === draggedItemId);
    const droppedOnItem = spots.find(s => s.id === droppedOnItemId);

    if (!draggedItem || !droppedOnItem || draggedItem.visit_day !== droppedOnItem.visit_day) {
      setDraggedItemId(null);
      return;
    }

    const currentDay = draggedItem.visit_day;
    const spotsForCurrentDay = spots.filter(s => s.visit_day === currentDay);
    const spotsForOtherDays = spots.filter(s => s.visit_day !== currentDay);

    const oldIndex = spotsForCurrentDay.findIndex(s => s.id === draggedItemId);
    const newIndex = spotsForCurrentDay.findIndex(s => s.id === droppedOnItemId);
    
    const reorderedDaySpots = [...spotsForCurrentDay];
    const [movedItem] = reorderedDaySpots.splice(oldIndex, 1);
    reorderedDaySpots.splice(newIndex, 0, movedItem);

    // 1. DB에 업데이트할 데이터를 먼저 준비
    const updates = reorderedDaySpots.map((spot, index) => ({
      id: spot.id,
      visit_order: index,
    }));

    try {
      // 2. DB에 변경된 순서를 먼저 저장 (await로 완료까지 기다림)
      const { error } = await supabase.from('plan_spots').upsert(updates);
      if (error) throw error; // 에러가 발생하면 catch 블록으로 이동

      // 3. DB 저장이 성공했을 때만 화면(state)을 업데이트
      const newFullSpotsList = [...spotsForOtherDays, ...reorderedDaySpots].sort((a, b) => {
          if (a.visit_day === b.visit_day) {
              const aOrder = reorderedDaySpots.findIndex(s => s.id === a.id);
              const bOrder = reorderedDaySpots.findIndex(s => s.id === b.id);
              return aOrder - bOrder;
          }
          return a.visit_day - b.visit_day;
      });
      setSpots(newFullSpotsList);

    } catch (error: any) {
      console.error("순서 업데이트 실패:", error);
      alert(`순서 변경에 실패했습니다: ${error.message}`);
      // DB 저장이 실패했으므로 화면은 변경하지 않음
    } finally {
      setDraggedItemId(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

  return {
    draggedItemId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
}