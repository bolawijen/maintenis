import {ErrorFallback} from '@maintenis/tilik-sdk/Component/ErrorFallback';
import {RouterOptionsContextProvider} from '@maintenis/tilik-sdk/Component/RouterOptions';
import {DefaultThemeProvider} from '@maintenis/tilik-sdk/Component/Theme/DefaultTheme';
import '@yiisoft/yii-dev-panel/App.css';
import {modules} from '@yiisoft/yii-dev-panel/modules';
import {createRouter} from '@yiisoft/yii-dev-panel/router';
import {createStore} from '@yiisoft/yii-dev-panel/store';
import {ErrorBoundary} from 'react-error-boundary';
import {Provider} from 'react-redux';
import {RouterProvider} from 'react-router-dom';
import React, {useEffect} from 'react';
import {PersistGate} from 'redux-persist/integration/react';
import {CrossWindowEventType, dispatchWindowEvent} from '@maintenis/tilik-sdk/Helper/dispatchWindowEvent';
import {changeBaseUrl} from '@maintenis/tilik-sdk/API/Application/ApplicationContext';
import {BreadcrumbsContextProvider} from '@yiisoft/yii-dev-panel/Application/Context/BreadcrumbsContext';

type AppProps = {
    config: {
        modules: {
            toolbar: boolean;
        };
        router: {
            basename: string;
            useHashRouter: boolean;
        };
        backend: {
            baseUrl: string;
            favoriteUrls: string;
            usePreferredUrl: boolean;
        };
    };
};
export default function App({config}: AppProps) {
    const router = createRouter(modules, config.router, config.modules);
    const {store, persistor} = createStore({
        application: {
            baseUrl: config.backend.baseUrl,
            preferredPageSize: 0,
            toolbarOpen: false,
            favoriteUrls: Array.isArray(config.backend.favoriteUrls) ? config.backend.favoriteUrls : [],
            iframeHeight: 0,
            _persist: { version: -1, rehydrated: false },
        },
    });

    

    useEffect(() => {
        if (config.backend.usePreferredUrl) {
            store.dispatch(changeBaseUrl(config.backend.baseUrl));
        }
    }, []);

    useEffect(() => {
        dispatchWindowEvent(window.parent, 'panel.loaded', true);

        const listener = (event: MessageEvent) => {
            const data = event.data;

            if ('event' in data) {
                switch (data.event as CrossWindowEventType) {
                    case 'router.navigate':
                        router.navigate(data.value);
                        break;
                }
            }
        };

        window.addEventListener('message', listener);

        return () => {
            window?.removeEventListener('message', listener);
        };
    }, []);

    return (
        <RouterOptionsContextProvider baseUrl="" openLinksInNewWindow={false}>
            <Provider store={store}>
                <PersistGate persistor={persistor}>
                    <DefaultThemeProvider>
                        <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[window.location.pathname]}>
                            <BreadcrumbsContextProvider>
                                <RouterProvider router={router} />
                            </BreadcrumbsContextProvider>
                        </ErrorBoundary>
                    </DefaultThemeProvider>
                </PersistGate>
            </Provider>
        </RouterOptionsContextProvider>
    );
}
