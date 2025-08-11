// Favorites Utility
const FAVORITES_KEY = 'hitthecity_favorites';

// Get all favorites from localStorage
export const getFavorites = () => {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

// Add act to favorites
export const addToFavorites = (act) => {
  try {
    const favorites = getFavorites();
    const actId = act.id || `${act.name}_${act.stage_name}_${act.time}`;
    
    if (!favorites.find(fav => fav.id === actId)) {
      const newFavorite = {
        id: actId,
        name: act.name,
        stage_name: act.stage_name,
        time: act.time,
        date: act.date,
        added_at: new Date().toISOString()
      };
      
      favorites.push(newFavorite);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

// Remove act from favorites
export const removeFromFavorites = (act) => {
  try {
    const favorites = getFavorites();
    const actId = act.id || `${act.name}_${act.stage_name}_${act.time}`;
    
    const updatedFavorites = favorites.filter(fav => fav.id !== actId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

// Check if act is favorited
export const isFavorited = (act) => {
  try {
    const favorites = getFavorites();
    const actId = act.id || `${act.name}_${act.stage_name}_${act.time}`;
    return favorites.some(fav => fav.id === actId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Toggle favorite status
export const toggleFavorite = (act) => {
  if (isFavorited(act)) {
    return removeFromFavorites(act);
  } else {
    return addToFavorites(act);
  }
};
