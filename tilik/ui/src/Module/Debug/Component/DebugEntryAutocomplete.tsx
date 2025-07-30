import Autocomplete from '@mui/material/Autocomplete';
import {DebugEntry} from '@maintenis/tilik-sdk/API/Debug/Debug';
import {Chip, Stack, TextField, Typography} from '@mui/material';
import {ReactJSXElement} from '@emotion/react/types/jsx-namespace';
import {useDebugEntry} from '@maintenis/tilik-sdk/API/Debug/Context';
import {isDebugEntryAboutConsole, isDebugEntryAboutWeb} from '@maintenis/tilik-sdk/Helper/debugEntry';
import {buttonColorHttp} from '@maintenis/tilik-sdk/Helper/buttonColor';
import {CollectorsMap} from '@maintenis/tilik-sdk/Helper/collectors';
import {formatDate} from '@maintenis/tilik-sdk/Helper/formatDate';
import {HTMLAttributes, useCallback} from 'react';


type DebugEntryAutocompleteProps = {
    data: DebugEntry[] | undefined;
    onChange: (data: DebugEntry | null) => void;
};

export const DebugEntryAutocomplete = ({data, onChange}: DebugEntryAutocompleteProps) => {
    const debugEntry = useDebugEntry();

    const renderLabel = useCallback((entry: DebugEntry): string => {
        if (isDebugEntryAboutConsole(entry)) {
            return [
                entry.summary[CollectorsMap.Command]?.exitCode === 0 ? '[OK]' : '[ERROR]',
                entry.summary[CollectorsMap.Command]?.input,
            ]
                .filter(Boolean)
                .join(' ');
        }
        if (isDebugEntryAboutWeb(entry)) {
            return [
                '[' + entry.summary[CollectorsMap.Request]?.response.statusCode + ']',
                entry.summary[CollectorsMap.Request]?.request.method,
                entry.summary[CollectorsMap.Request]?.request.path,
            ].join(' ');
        }
        return entry.id;
    }, []);
    const renderOptions = useCallback(
        (props: HTMLAttributes<HTMLElement>, entry: DebugEntry): ReactJSXElement => (
            <Stack
                {...props}
                key={entry.id}
                component="li"
                direction="row"
                spacing={2}
                sx={{'& > img': {mr: 2, flexShrink: 0}}}
            >
                {isDebugEntryAboutWeb(entry) && (
                    <>
                        <Typography component="span" sx={{flex: 1}}>
                            <Chip
                                sx={{borderRadius: '5px 5px', margin: '0 2px'}}
                                label={`${entry.summary[CollectorsMap.Request]?.response.statusCode} ${
                                    entry.summary[CollectorsMap.Request]?.request.method
                                }`}
                                color={buttonColorHttp(entry.summary[CollectorsMap.Request]?.statusCode)}
                            />
                            <span style={{margin: '0 2px'}}>{entry.summary[CollectorsMap.Request]?.request.path}</span>
                        </Typography>
                        <Typography component="span" sx={{margin: '0 auto'}}>
                            <span>{formatDate(entry.summary[CollectorsMap.WebAppInfo]?.request.startTime)}</span>
                        </Typography>
                    </>
                )}
                {isDebugEntryAboutConsole(entry) && (
                    <>
                        <Typography component="span" sx={{flex: 1}}>
                            {entry.summary[CollectorsMap.Command]?.exitCode === 0 ? (
                                <Chip label="OK" color={'success'} sx={{borderRadius: '5px 5px', margin: '0 2px'}} />
                            ) : (
                                <Chip
                                    label={`CODE: ${entry.summary[CollectorsMap.Command]?.exitCode ?? 'Unknown'}`}
                                    color={'error'}
                                    sx={{borderRadius: '5px 5px', margin: '0 2px'}}
                                />
                            )}
                            <span style={{margin: '0 2px'}}>{entry.summary[CollectorsMap.Command]?.input ?? 'Unknown'}</span>
                        </Typography>
                        <Typography component="span" sx={{margin: '0 auto'}}>
                            <span>{formatDate(entry.summary[CollectorsMap.ConsoleAppInfo].request.startTime)}</span>
                        </Typography>
                    </>
                )}
            </Stack>
        ),
        [],
    );

    return (
        <Autocomplete
            value={debugEntry}
            options={(data || []) as DebugEntry[]}
            getOptionLabel={renderLabel}
            renderOption={renderOptions}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => <TextField {...params} label="Record" />}
            onChange={(event, value) => {
                if (typeof value === 'object') {
                    onChange(value);
                } else {
                    onChange(null);
                }
            }}
            sx={{my: 1}}
        />
    );
};
