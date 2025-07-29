import {debugSlice} from './Context';
import {debugApi} from './Debug';
import {persistReducer} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const debugSliceConfig = {
    key: debugSlice.name,
    version: 1,
    whitelist: ['entry'],
    storage,
};

export const reducers = {
    [debugSlice.name]: persistReducer(debugSliceConfig, debugSlice.reducer),
    [debugApi.reducerPath]: debugApi.reducer,
};
export const middlewares = [debugApi.middleware];
