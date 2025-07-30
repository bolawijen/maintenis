import * as React from 'react';
import Switch from '@mui/material/Switch';
import clipboardCopy from 'clipboard-copy';
import EmptyDebugData from './EmptyDebugData';
import ListIcon from '@mui/icons-material/List';
import MailIcon from '@mui/icons-material/Mail';
import InboxIcon from '@mui/icons-material/Inbox';
import ReplayIcon from '@mui/icons-material/Replay';
import untry from '@maintenis/tilik-sdk/Helper/untry';
import FormControlLabel from '@mui/material/FormControlLabel';
import {
    Box,
    Alert,
    Stack,
    Button,
    Tooltip,
    AlertTitle,
    LinearProgress,
    CircularProgress,
} from '@mui/material';
import {
    debugApi,
    DebugEntry,
    useLazyGetDebugQuery,
    useLazyGetCollectorInfoQuery,
} from '@maintenis/tilik-sdk/API/Debug/Debug';
import {InfoBox} from '@maintenis/tilik-sdk/Component/InfoBox';
import {CollectorsMap} from '@maintenis/tilik-sdk/Helper/collectors';
import {Check, Error, HelpOutline, Refresh} from '@mui/icons-material';
import {ErrorFallback} from '@maintenis/tilik-sdk/Component/ErrorFallback';
import {isDebugEntryAboutWeb} from '@maintenis/tilik-sdk/Helper/debugEntry';
import {LinkProps, MenuPanel} from '@maintenis/tilik-sdk/Component/MenuPanel';
import {changeEntryAction, useDebugEntry} from '@maintenis/tilik-sdk/API/Debug/Context';
import {changeAutoLatest} from '@maintenis/tilik-sdk/API/Application/ApplicationContext';
import {getCollectedCountByCollector} from '@maintenis/tilik-sdk/Helper/collectorsTotal';
import {DebugEntryAutocomplete} from '@yiisoft/yii-dev-panel/Module/Debug/Component/DebugEntryAutocomplete';
import {EventMessage, EventTypesEnum, useServerSentEvents} from '@maintenis/tilik-sdk/Component/useServerSentEvents';
import {useDoRequestMutation, usePostCurlBuildMutation} from '@yiisoft/yii-dev-panel/Module/Inspector/API/Inspector';
import {FullScreenCircularProgress} from '@maintenis/tilik-sdk/Component/FullScreenCircularProgress';
import {useBreadcrumbs} from '@yiisoft/yii-dev-panel/Application/Context/BreadcrumbsContext';
import {CollectorData} from '@yiisoft/yii-dev-panel/Module/Debug/Component/CollectorData';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useSelector} from '@yiisoft/yii-dev-panel/store';
import {ErrorBoundary} from 'react-error-boundary';
import {useSearchParams} from 'react-router-dom';
import {useDispatch} from 'react-redux';


function HttpRequestError({error}: {error: any}) {
    console.error(error);
    return (
        <Box m={2}>
            <Alert severity="error">
                <AlertTitle>Something went wrong:</AlertTitle>
                <pre>{error?.toString() || 'unknown'}</pre>
            </Alert>
        </Box>
    );
}

const NoCollectorsInfoBox = React.memo(() => {
    return (
        <InfoBox
            title="No one collector is chosen"
            text="Select a collector from the left side panel to see more options"
            severity="info"
            icon={<HelpOutline />}
        />
    );
});

const EmptyCollectorsInfoBox = React.memo(() => (
    <InfoBox
        title="Collectors are empty"
        text="Looks like debugger was inactive or it did not have any active collectors during the request"
        severity="info"
        icon={<HelpOutline />}
    />
));

const weights = {
    [CollectorsMap.Request]: 1,
    [CollectorsMap.Log]: 2,
    [CollectorsMap.Database]: 3,
    [CollectorsMap.Event]: 4,
    [CollectorsMap.Timeline]: 5,
    [CollectorsMap.VarDumper]: 6,
};


type LogEntry = {};

export const Layout = () => {
    const dispatch = useDispatch();
    const debugEntry = useDebugEntry();
    const autoLatest = useSelector((state) => state.application.autoLatest);
    const backendUrl = useSelector((state) => state.application.baseUrl) as string;
    const [searchParams, setSearchParams] = useSearchParams();
    const [getDebugQuery, getDebugQueryInfo] = useLazyGetDebugQuery();
    const [selectedCollector, setSelectedCollector] = useState<string>(() => searchParams.get('collector') || '');
    const [collectorData, setCollectorData] = useState<any>(undefined);
    const [collectorInfo, collectorQueryInfo] = useLazyGetCollectorInfoQuery();
    const [postCurlBuildInfo, postCurlBuildQueryInfo] = usePostCurlBuildMutation();

    const onRefreshHandler = useCallback(() => {
        getDebugQuery();
    }, [getDebugQuery]);
    useEffect(onRefreshHandler, [onRefreshHandler]);

    useEffect(() => {
        if (getDebugQueryInfo.isSuccess && getDebugQueryInfo.data && getDebugQueryInfo.data.length) {
            if (autoLatest) {
                changeEntry(getDebugQueryInfo.data[0]);
                return;
            }
            if (!searchParams.has('debugEntry')) {
                changeEntry(getDebugQueryInfo.data[0]);
                return;
            }
            const entry = getDebugQueryInfo.data.find((entry) => entry.id === searchParams.get('debugEntry'));
            if (!entry) {
                changeEntry(getDebugQueryInfo.data[0]);
            }
        }
    }, [getDebugQueryInfo.isSuccess, getDebugQueryInfo.data, searchParams, autoLatest]);

    const clearCollectorAndData = () => {
        searchParams.delete('collector');
        setSelectedCollector('');
        setCollectorData(null);
    };

    useEffect(() => {
        const collector = searchParams.get('collector') || '';
        if (collector.trim() === '') {
            clearCollectorAndData();
            return;
        }
        if (!debugEntry) {
            return;
        }
        (async function() {
            const [{data, isError}, err] = await untry(collectorInfo({id: debugEntry.id, collector}));
            if (err) {
                clearCollectorAndData();
                return;
            }
            if (isError) {
                clearCollectorAndData();
                changeEntry(null);
                return;
            }
            setSelectedCollector(collector);
            setCollectorData(data);
        })();
    }, [searchParams, debugEntry]);

    useEffect(() => {
        if (debugEntry) {
            setSearchParams((params) => {
                params.set('debugEntry', debugEntry.id);
                return params;
            });
        } else {
            setSearchParams({});
        }
    }, [debugEntry, setSearchParams]);

    const changeEntry = (entry: DebugEntry | null) => {
        if (entry) {
            dispatch(changeEntryAction(entry));
            return;
        }
        dispatch(changeEntryAction(null));
    };
    const collectorName = useMemo(() => selectedCollector, [selectedCollector]);

    const links: LinkProps[] = useMemo(
        () => !debugEntry || !debugEntry.collectors
            ? [] : debugEntry.collectors
                .map((collector, index) => ({
                    name: collector,
                    text: collector,
                    icon: index % 2 === 0 ? <InboxIcon /> : <MailIcon />,
                    href: `/debug?collector=${collector}&debugEntry=${debugEntry.id}`,
                    badge: getCollectedCountByCollector(collector as CollectorsMap, debugEntry),
                }))
                .sort((a, b) => {
                    const weightA = weights[a.name] ?? null;
                    const weightB = weights[b.name] ?? null;

                    if (weightA !== null && weightB !== null) {
                        return weightA - weightB;
                    }
                    if (weightA !== null) {
                        return -1;
                    }
                    if (weightB !== null) {
                        return 1;
                    }
                    return a.name.localeCompare(b.name);
                }),
        [debugEntry],
    );

    const [doRequest, doRequestInfo] = useDoRequestMutation();
    const repeatRequestHandler = useCallback(async () => {
        if (!debugEntry) {
            return;
        }
        try {
            await doRequest({id: debugEntry.id});
        } catch (e) {
            console.error(e);
        }
        getDebugQuery();
    }, [debugEntry]);
    const copyCurlHandler = useCallback(async () => {
        if (!debugEntry) {
            return;
        }
        const result = await postCurlBuildInfo(debugEntry.id);
        if ('error' in result) {
            console.error(result.error);
            return;
        }
        clipboardCopy(result.data.command);
    }, [debugEntry]);
    const onEntryChangeHandler = useCallback(changeEntry, [changeEntry]);

    const onLogUpdatesHandler = useCallback(
        async (message: EventMessage) => {
            if (message.type === EventTypesEnum.LogUpdated
                && selectedCollector === CollectorsMap.Log
                && message.payload
                && debugEntry
            ) {
                setCollectorData((data) => [message.payload, ...data]);
            }
        },
        [debugEntry, selectedCollector, dispatch],
    );

    useServerSentEvents(backendUrl, onLogUpdatesHandler, autoLatest);

    const autoLatestHandler = () => {
        const newAutoLatestState = !autoLatest;
        dispatch(changeAutoLatest(newAutoLatestState));
        if (newAutoLatestState) {
            onRefreshHandler();
        }
    };

    useBreadcrumbs(() => ['Debug', collectorName]);

    if (getDebugQueryInfo.isLoading) {
        return <FullScreenCircularProgress />;
    }

    if (getDebugQueryInfo.data && getDebugQueryInfo.data.length === 0) {
        return <EmptyDebugData />;
    }

    return (
        <>
            <DebugEntryAutocomplete data={getDebugQueryInfo.data} onChange={onEntryChangeHandler} />
            <Stack direction="row" spacing={1}>
                <Tooltip title="List">
                    <span>
                        <Button href="/debug/list" startIcon={<ListIcon />}>
                            List
                        </Button>
                    </span>
                </Tooltip>
                <Tooltip title="Refresh the list">
                    <span>
                        <Button
                            onClick={onRefreshHandler}
                            disabled={getDebugQueryInfo.isFetching}
                            startIcon={<Refresh />}
                            endIcon={getDebugQueryInfo.isFetching ? <CircularProgress size={24} color="info" /> : null}
                        >
                            Refresh
                        </Button>
                    </span>
                </Tooltip>
                <Tooltip title="Runs the request again">
                    <span>
                        <Button
                            onClick={repeatRequestHandler}
                            disabled={!debugEntry || doRequestInfo.isLoading || getDebugQueryInfo.isFetching}
                            startIcon={<ReplayIcon />}
                            endIcon={
                                doRequestInfo.isLoading ? (
                                    <CircularProgress size={24} color="info" />
                                ) : doRequestInfo.isUninitialized ? null : doRequestInfo.isSuccess ? (
                                    <Check color="success" />
                                ) : (
                                    <Error color="error" />
                                )
                            }
                        >
                            Repeat Request
                        </Button>
                    </span>
                </Tooltip>
                {debugEntry && isDebugEntryAboutWeb(debugEntry) && (
                    <Tooltip title="Copies the request cURL interpretation">
                        <span>
                            <Button
                                onClick={copyCurlHandler}
                                disabled={!debugEntry || postCurlBuildQueryInfo.isLoading}
                                endIcon={
                                    postCurlBuildQueryInfo.isLoading ? (
                                        <CircularProgress size={24} color="info" />
                                    ) : postCurlBuildQueryInfo.isUninitialized ? null : postCurlBuildQueryInfo.isSuccess ? (
                                        <Check color="success" />
                                    ) : (
                                        <Error color="error" />
                                    )
                                }
                            >
                                Copy cURL
                            </Button>
                        </span>
                    </Tooltip>
                )}
                {/*TODO add documentation and description how it work and how add it to php-fpm / road-runner*/}
                <Tooltip title="Switches to the latest debug entry automatically (delay 1s). Needs server-sent events suppport.">
                    <span>
                        <FormControlLabel
                            control={<Switch checked={autoLatest} value={autoLatest} onChange={autoLatestHandler} />}
                            label="Latest auto"
                        />
                    </span>
                </Tooltip>
            </Stack>

            {links.length === 0 ? (
                <EmptyCollectorsInfoBox />
            ) : (
                <MenuPanel links={links} open={!selectedCollector} activeLink={selectedCollector}>
                    {selectedCollector ? (
                        <>
                            {collectorQueryInfo.isFetching && <LinearProgress />}
                            {collectorQueryInfo.isError && (
                                <HttpRequestError
                                    error={
                                        (collectorQueryInfo.error as any)?.error || (collectorQueryInfo.error as any)
                                    }
                                />
                            )}
                            {collectorQueryInfo.isSuccess && (
                                <ErrorBoundary
                                    FallbackComponent={ErrorFallback}
                                    resetKeys={[window.location.pathname, window.location.search, debugEntry]}
                                >
                                    <CollectorData
                                        selectedCollector={selectedCollector}
                                        collectorData={collectorData}
                                    />
                                </ErrorBoundary>
                            )}
                        </>
                    ) : (
                        <NoCollectorsInfoBox />
                    )}
                </MenuPanel>
            )}
        </>
    );
};
