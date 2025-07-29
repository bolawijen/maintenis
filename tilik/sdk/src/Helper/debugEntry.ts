import {DebugEntry} from '../API/Debug/Debug';
import {CollectorsMap} from "./collectors";

export function isDebugEntryAboutConsole(entry: DebugEntry): boolean {
    return entry && !!entry.summary && CollectorsMap.Command in entry.summary;
}

export function isDebugEntryAboutWeb(entry: DebugEntry): boolean {
    return entry && !!entry.summary && CollectorsMap.WebAppInfo in entry.summary;
}
