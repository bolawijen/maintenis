import { Fetcher, type FetcherOptions } from "./fetcher.svelte.ts";

export type HttpFetcherOptions = FetcherOptions & {
    url: string;
    auth: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; // Tambah opsi method
    params?: Record<string, any>; // Tambah opsi params untuk URL parameters
}

class HttpFetcherError extends Error { }

export class HttpFetcher extends Fetcher {

    #cache = {}
    #options: HttpFetcherOptions

    constructor(options: HttpFetcherOptions) {
        super(options)
        this.#options = { method: 'GET', ...options } // Set default method ke GET
    }

    sortBy(key) {
        super.sort(key)
        this.fetch()
    }

    async fetch() {
        let requestBody: any = {};
        let finalCacheKey: string;

        const [preparedCacheKeyPart, createBody] = this.prepareRequest();

        if (this.#options.method !== 'GET') { // Jika bukan GET, gunakan body dari prepareRequest
            requestBody = createBody();
            finalCacheKey = preparedCacheKeyPart;
        } else {
            // Untuk GET requests, cache key adalah URL lengkap dengan params
            finalCacheKey = `${this.#options.url}?${preparedCacheKeyPart}`;
        }

        if (this.#cache[finalCacheKey]) {
            this.rows = this.#cache[finalCacheKey!];
            return
        }

        this.ready = false
        const response = await this.#request(requestBody)
        
        const total_count = response.headers.get('X-Total-Count');
        this.total_count = total_count ? parseInt(total_count, 10) : 0;

        this.prepareRows(await response.json())
        finalCacheKey && (this.#cache[finalCacheKey] = this.rows)
        return this.ready = true
    }

    async #request(body: any) {
        let url = this.#options.url;
        const headers: HeadersInit = {
            'Authorization': `Bearer ${this.#options.auth}`,
        };
        let requestBody: BodyInit | undefined;

        if (this.#options.method === 'GET') {
            if (this.#options.params) {
                const queryParams = new URLSearchParams(this.#options.params).toString();
                url = `${url}?${queryParams}`;
            }
            // Tidak ada Content-Type header untuk GET requests dengan URL params
        } else {
            headers['Content-Type'] = 'application/json';
            requestBody = JSON.stringify(body);
        }

        return fetch(url, {
            headers: headers,
            body: requestBody,
            method: this.#options.method,
        })
    }

    prepareRequest(): [string, () => any] {
        const { current, limit } = this.getPagination();
        const offset = (current - 1) * limit;
        const urlParams = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString()
        }).toString();
        return [urlParams, () => ({})];
    }

    prepareRows(data: any) {
        this.rows = data;
    }
}

export { HttpFetcher as default }