import {ModuleInterface} from '@maintenis/tilik-sdk/Types/Module.types';
import {middlewares, reducers} from '@yiisoft/yii-dev-panel/Module/OpenApi/api';
import {routes} from '@yiisoft/yii-dev-panel/Module/OpenApi/router';

export const OpenApiModule: ModuleInterface = {
    routes: routes,
    reducers: reducers,
    middlewares: middlewares,
    standaloneModule: false,
};
