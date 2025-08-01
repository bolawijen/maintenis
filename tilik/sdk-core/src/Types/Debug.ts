import {CollectorsMap} from "../Helper/collectors";

export type HTTPMethod = 'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT';

export type DebugEntry = {
    id: string;
    collectors: string[];
    summary: {
        [key in CollectorsMap]: {
            total: number;
            valid: number;
            invalid: number;
            countPushes: number;
            countStatuses: number;
            countProcessingMessages: number;
            count: number;
            totalTime: number;
            read?: number;
            write?: number;
            mkdir?: number;
            php: {
                version: string;
            };
            request: {
                startTime: number;
                processingTime: number;
                url: string;
                path: string;
                query: string;
                method: HTTPMethod;
                isAjax: boolean;
                userIp: string;
            };
            memory: {
                peakUsage: number;
            };
            exitCode: number;
            class: string;
            input: string;
            name: string;
            response: {
                statusCode: number;
            };
            matchTime: number;
            pattern: string;
            arguments: string;
            host: string;
            uri: string;
            action: string | string[];
            middlewares: any[];
            bundles: {
                total: number;
            };
            message: string;
            line: string;
            file: string;
            code: string;
            queries: {
                error: number;
                total: number;
            };
            transactions: {
                error: number;
                total: number;
            };
            streams: [];
            [key: string]: any
        };
    }
};
