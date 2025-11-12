import { configureStore } from '@reduxjs/toolkit';
import promotionsReducer from '../features/promotions/promotionSlice';
import statisticsReducer from '../features/statistics/statisticsSlice';

export const store = configureStore({
  reducer: {
    promotions: promotionsReducer,
    statistics: statisticsReducer,
  },
});

export default store;