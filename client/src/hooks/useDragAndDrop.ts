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

    try {
      const updatePromises = reorderedDaySpots.map((spot, index) =>
        supabase
          .from('plan_spots')
          .update({ visit_order: index })
          .eq('id', spot.id) 
      );

      const results = await Promise.all(updatePromises);

      const firstError = results.find(res => res.error);
      if (firstError) throw firstError.error;


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
      alert(`순서 변경 실패: ${error.message}`);
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