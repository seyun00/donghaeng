import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../api/supabaseClient';

// 찜 목록 아이템
interface Favorite {
    id: string;
    content_id: string;
    content_type_id: string;
    title: string;
    first_image: string;
}

interface FavoriteListProps {
  userId: string;
}

const FavoriteList: React.FC<FavoriteListProps> = ({ userId }) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('찜 목록 로딩 실패:', error);
      } else {
        setFavorites(data);
      }
      setLoading(false);
    };

    fetchFavorites();
  }, [userId]);

  const handleRemoveFavorite = async (favoriteId: string, title: string) => {
    if (!window.confirm(`'${title}'을(를) 찜 목록에서 삭제하시겠습니까?`)) return;

    const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

    if (error) {
        alert('삭제에 실패했습니다: ' + error.message);
    } else {
        alert('찜 목록에서 삭제되었습니다.');
        setFavorites(prev => prev.filter(item => item.id !== favoriteId));
    }
  };

  if (loading) {
    return <p>찜 목록을 불러오는 중...</p>;
  }

  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {favorites.length === 0 && <p className="col-span-full">찜한 장소가 없습니다.</p>}
      {favorites.map(fav => (
        <div key={fav.id} className="border rounded-lg shadow-sm overflow-hidden group relative">
          <Link to={`/detail/${fav.content_id}/${fav.content_type_id}`}>
            <img 
                src={fav.first_image || 'https://via.placeholder.com/300x200.png?text=No+Image'} 
                alt={fav.title}
                className="w-full h-40 object-cover"
            />
            <div className="p-4">
                <h4 className="font-semibold truncate">{fav.title}</h4>
            </div>
          </Link>
          <button 
            onClick={() => handleRemoveFavorite(fav.id, fav.title)}
            className="absolute top-2 right-2 bg-white rounded-full p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            title="찜 삭제"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default FavoriteList;