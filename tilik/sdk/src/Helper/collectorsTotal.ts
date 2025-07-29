import {DebugEntry} from '../API/Debug/Debug';
import {CollectorsMap} from './collectors';

export const getCollectedCountByCollector = (collector: CollectorsMap, data: DebugEntry): number | undefined => {
    if (!data.summary) {
        return 0;
    }
    switch (collector) {
        case CollectorsMap.Asset:
            return Number(data.summary[CollectorsMap.Asset]?.bundles?.total ?? 0);
        case CollectorsMap.Database:
            return Number(data.summary[CollectorsMap.Database]?.queries?.total ?? 0) + Number(data.summary[CollectorsMap.Database]?.transactions?.total ?? 0);
        case CollectorsMap.Exception:
            return Object.values(data.summary[CollectorsMap.Exception] ?? []).length > 0 ? 1 : 0;
        case CollectorsMap.Event:
            return Number(data.summary[CollectorsMap.Event]?.total ?? 0);
        case CollectorsMap.Log:
            return Number(data.summary[CollectorsMap.Log]?.total ?? 0);
        case CollectorsMap.Service:
            return Number(data.summary[CollectorsMap.Service]?.total ?? 0);
        case CollectorsMap.VarDumper:
            return Number(data.summary[CollectorsMap.VarDumper]?.total ?? 0);
        case CollectorsMap.Validator:
            return Number(data.summary[CollectorsMap.Validator]?.total ?? 0);
        case CollectorsMap.Middleware:
            return Number(data.summary[CollectorsMap.Middleware]?.total ?? 0);
        case CollectorsMap.Queue:
            return (
                Number(data.summary[CollectorsMap.Queue]?.countPushes ?? 0) +
                Number(data.summary[CollectorsMap.Queue]?.countStatuses ?? 0) +
                Number(data.summary[CollectorsMap.Queue]?.countProcessingMessages ?? 0)
            );
        case CollectorsMap.HttpClient:
            return Number(data.summary[CollectorsMap.HttpClient]?.count ?? 0);
        case CollectorsMap.HttpStream:
            return Number(data.summary[CollectorsMap.HttpStream]?.streams.length ?? 0);
        case CollectorsMap.Mailer:
            return Number(data.summary[CollectorsMap.Mailer]?.total ?? 0);
        case CollectorsMap.FilesystemStream:
            return Object.values(data.summary[CollectorsMap.FilesystemStream]?.streams ?? []).reduce((acc, value) => acc + value, 0);
        case CollectorsMap.ConsoleAppInfo:
            return 0;
        case CollectorsMap.Timeline:
            return Number(data.summary[CollectorsMap.Timeline]?.total ?? 0);
        default:
            return undefined;
    }
};
