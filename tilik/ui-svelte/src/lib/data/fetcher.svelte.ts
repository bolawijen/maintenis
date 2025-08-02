export type FetcherOptions = {
    sort?: string;
}

export { Fetcher as default }

export class Fetcher {

    #sort
    rows = $state([])
    ready = $state()
    total_count = $state(0)
    #pagination = { current: 1, limit: 30 }; // New private pagination property

    constructor(options: FetcherOptions = {}) {
        this.#sort = { columns: {} }
        options.sort && this.sort(options.sort)
    }

    setPage(page: number, perPage: number) {
        this.#pagination.current = page;
        this.#pagination.limit = perPage;
        this.fetch();
    }

    getPagination() {
        return { current: this.#pagination.current, limit: this.#pagination.limit, offset: (this.#pagination.current - 1) * this.#pagination.limit };
    }

    sort(sort) {
        let [key, order] = sort.split(' ')
        if (this.#sort.key === key) {
            this.#sort.columns[key] = this.#sort.columns[key] === 'asc' ? 'desc' : 'asc';
        } else {
            this.#sort.columns[key] = 'asc';
            this.#sort.key = key
        }
        if (order) {
            this.#sort.columns[key] = order;
        }
        else {
            order = this.#sort.columns[key]
        }
        if (!['asc', 'desc'].includes(order)) {
            order = this.#sort.columns[key] = 'asc';
        }
        return [key, order]
    }

    getSort() {
        const key = this.#sort.key
        return [key, this.#sort.columns[key]]
    }

    fetch(...args: any[]): Promise<any> {
        throw new Error('fetch() method not implemented')
    }
}