import {middlewares, reducers} from '@maintenis/tilik-sdk/API/Application/api';
import {ModuleInterface} from '@maintenis/tilik-sdk/Types/Module.types';
import {routes} from '@yiisoft/yii-dev-panel/Application/router';

export const ApplicationModule: ModuleInterface = {
    routes: routes,
    reducers: reducers,
    middlewares: middlewares,
    standaloneModule: false,
};
