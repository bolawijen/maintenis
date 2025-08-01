import { writable } from 'svelte/store';
import { DebugEntry } from '@maintenis/tilik-sdk-core';

interface DebugEntriesState {
    data: DebugEntry[];
    isLoading: boolean;
    isError: boolean;
    error: any;
}

function createDebugEntriesStore() {
    const { subscribe, set, update } = writable<DebugEntriesState>({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
    });

    async function fetchDebugEntries() {
        update(state => ({ ...state, isLoading: true, isError: false, error: null }));
        try {
            const response = await fetch('http://127.0.0.1:8080/debug/api/'); // Adjust backend URL
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            // Assuming result.data is an array of DebugEntry
            set({ data: result.data.data, isLoading: false, isError: false, error: null }); // Access result.data.data
        } catch (e) {
            console.error("Failed to fetch debug entries:", e);
            set(state => ({ ...state, isLoading: false, isError: true, error: e }));
        }
    }

    return { subscribe, fetchDebugEntries };
}

export const debugEntriesStore = createDebugEntriesStore();