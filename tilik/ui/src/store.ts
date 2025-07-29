import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {setupListeners} from '@reduxjs/toolkit/query';
import {
    middlewares as ApplicationMiddlewares,
} from '@maintenis/tilik-sdk/API/Application/api';
import {middlewares as DebugMiddlewares, reducers as DebugReducers} from '@maintenis/tilik-sdk/API/Debug/api';
import {middlewares as FramesMiddlewares, reducers as FramesReducers} from '@yiisoft/yii-dev-panel/Module/Frames/api';
import {middlewares as GiiMiddlewares, reducers as GiiReducers} from '@yiisoft/yii-dev-panel/Module/Gii/api';
import {
    middlewares as InspectorMiddlewares,
    reducers as InspectorReducers,
} from '@yiisoft/yii-dev-panel/Module/Inspector/api';
import {
    middlewares as OpenApiMiddlewares,
    reducers as OpenApiReducers,
} from '@yiisoft/yii-dev-panel/Module/OpenApi/api';
import {NotificationsSlice} from '@maintenis/tilik-sdk/Component/Notifications';
import {ApplicationSlice} from '@maintenis/tilik-sdk/API/Application/ApplicationContext';
// import {middlewares as ToolbarApiMiddlewares, reducers as ToolbarApiReducers} from './Module/Toolbar/api';
import {errorNotificationMiddleware} from '@maintenis/tilik-sdk/API/errorNotificationMiddleware';
import {TypedUseSelectorHook, useSelector} from 'react-redux';
import {FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistStore, persistReducer} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import type {PreloadedState} from '@reduxjs/toolkit';


// TODO: get reducers and middlewares from modules.ts
const combinedReducers = combineReducers({
    application: ApplicationSlice.reducer,
    notifications: NotificationsSlice.reducer,
    ...InspectorReducers,
    ...DebugReducers,
    ...GiiReducers,
    ...OpenApiReducers,
    ...FramesReducers,
    // ...ToolbarApiReducers,
});

const rootPersistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['application', 'notifications'], // Whitelist the slices you want to persist
};

const persistedReducer = persistReducer(rootPersistConfig, combinedReducers);

export const createStore = (preloadedState?: PreloadedState<RootState>) => {
    const store = configureStore({
        reducer: persistedReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
                },
            })
                // .concat(consoleLogActionsMiddleware)
                .concat([
                    ...ApplicationMiddlewares,
                    ...InspectorMiddlewares,
                    ...DebugMiddlewares,
                    ...(Array.isArray(GiiMiddlewares) ? GiiMiddlewares : []),
                    ...OpenApiMiddlewares,
                    ...FramesMiddlewares,
                    // ...ToolbarApiReducers,
                    errorNotificationMiddleware,
                ]),
        devTools: import.meta.env.DEV,
        preloadedState,
    });
    setupListeners(store.dispatch);

    const persistor = persistStore(store);

    return {store, persistor};
};

export type RootState = ReturnType<typeof rootReducer>;
type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore['store']['dispatch'];
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export {useAppSelector as useSelector};