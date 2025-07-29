import {BaseQueryFn, FetchArgs, FetchBaseQueryError} from '@reduxjs/toolkit/query';
import {fetchBaseQuery} from '@reduxjs/toolkit/query/react';

export const createBaseQuery = (
    baseUrlAdditional: string,
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
    return async (args, WebApi, extraOptions) => {
        const rawBaseQuery = fetchBaseQuery({
            baseUrl: (import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8080') + baseUrlAdditional,
            referrerPolicy: 'no-referrer',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });
        return rawBaseQuery(args, WebApi, extraOptions);
    };
};
