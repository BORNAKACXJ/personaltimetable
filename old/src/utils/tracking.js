// GTM Tracking Utility
export const trackEvent = (eventName, parameters = {}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...parameters
    });
  }
};

// Track day selection
export const trackDayClick = (dayName, dayDate, dayId) => {
  trackEvent('day_click', {
    day_name: dayName,
    day_date: dayDate,
    day_id: dayId,
    event_category: 'navigation',
    event_label: `Day: ${dayName}`
  });
};

// Track act popup open
export const trackActPopup = (actName, stageName, actTime, actId, stageId, artistId) => {
  trackEvent('act_popup_open', {
    act_name: actName,
    stage_name: stageName,
    act_time: actTime,
    act_id: actId,
    stage_id: stageId,
    artist_id: artistId,
    event_category: 'engagement',
    event_label: `Act: ${actName}`
  });
};

// Track favorite action
export const trackFavorite = (actName, stageName, isFavorite, actId, stageId, artistId) => {
  trackEvent('act_favorite', {
    act_name: actName,
    stage_name: stageName,
    favorite_action: isFavorite ? 'add' : 'remove',
    act_id: actId,
    stage_id: stageId,
    artist_id: artistId,
    event_category: 'engagement',
    event_label: `Favorite ${isFavorite ? 'Add' : 'Remove'}: ${actName}`
  });
};

// Track view change
export const trackViewChange = (viewType) => {
  trackEvent('view_change', {
    view_type: viewType,
    event_category: 'navigation',
    event_label: `View: ${viewType}`
  });
};

// Track page view
export const trackPageView = (pageName) => {
  trackEvent('page_view', {
    page_name: pageName,
    event_category: 'navigation'
  });
};
