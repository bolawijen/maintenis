import TerminalIcon from '@mui/icons-material/Terminal';
import {DebugEntry} from '../API/Debug/Debug';
import {DebugChip} from './DebugChip';
import {buttonColorConsole, buttonColorHttp} from '../Helper/buttonColor';
import {isDebugEntryAboutConsole, isDebugEntryAboutWeb} from '../Helper/debugEntry';
import {CollectorsMap} from "../Helper/collectors";

type DebugChipProps = {
    entry: DebugEntry;
};
export const DebugEntryChip = ({entry}: DebugChipProps) => {
    if (isDebugEntryAboutConsole(entry)) {
        return (
            <DebugChip
                icon={<TerminalIcon />}
                label={entry.summary[CollectorsMap.Command]?.exitCode}
                color={buttonColorConsole(Number(entry.summary[CollectorsMap.Command]?.exitCode))}
            />
        );
    }
    if (isDebugEntryAboutWeb(entry)) {
        return (
            <DebugChip
                label={[entry.summary[CollectorsMap.Request]?.response?.statusCode, entry.summary[CollectorsMap.Request].request.method].join(' ')}
                color={buttonColorHttp(entry.summary[CollectorsMap.Request].response?.statusCode)}
            />
        );
    }
    return null;
};
