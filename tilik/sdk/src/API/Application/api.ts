import {ApplicationSlice} from './ApplicationContext';
import {NotificationsSlice} from '../../Component/Notifications';
import {persistReducer} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {createStateSyncMiddleware, withReduxStateSync} from 'redux-state-sync';

const applicationSliceConfig = {
    key: ApplicationSlice.name,
    version: 1,
    storage,
};
const notificationsSliceConfig = {
    key: NotificationsSlice.name,
    version: 1,
    storage,
};

export const reducers = {
    [ApplicationSlice.name]: ApplicationSlice.reducer,
};
export const middlewares = [
];
