import {middlewares, reducers} from '@maintenis/tilik-sdk/API/Debug/api';
import {ModuleInterface} from '@maintenis/tilik-sdk/Types/Module.types';
import {routes} from '@yiisoft/yii-dev-panel/Module/Debug/router';

export const DebugModule: ModuleInterface = {
    routes: routes,
    reducers: reducers,
    middlewares: middlewares,
    standaloneModule: false,
};
