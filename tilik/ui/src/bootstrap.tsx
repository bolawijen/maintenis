import '@yiisoft/yii-dev-panel/wdyr';

import App from '@yiisoft/yii-dev-panel/App';
import '@yiisoft/yii-dev-panel/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {Config} from '@maintenis/tilik-sdk/Config';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {createStore} from './store';

let queryParams: {toolbar?: '0' | string} = {toolbar: '1'};
try {
    queryParams = Object.fromEntries(new URLSearchParams(location.search));
} catch (e) {
    console.error('Error while parsing query params: ', e);
}

(function YiiDevPanelWidget(scope) {
    scope.init = function () {
        const container = document.getElementById(this.config.containerId) as HTMLElement;
        const {store, persistor} = createStore();

        const root = ReactDOM.createRoot(container);
        root.render(
            <React.StrictMode>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <App config={this.config.options} />
                    </PersistGate>
                </Provider>
            </React.StrictMode>,
        );
    };
    scope.init();
})(
    (window['YiiDevPanelWidget'] ??= {
        config: {
            containerId: 'root',
            options: {
                modules: {
                    toolbar: queryParams?.toolbar !== '0',
                },
                router: {
                    basename: '',
                    useHashRouter: Config.appEnv === 'github',
                },
                backend: {
                    baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8080',
                    favoriteUrls: [],
                    usePreferredUrl: false,
                },
                env: Config.appEnv,
            },
        },
    }),
);