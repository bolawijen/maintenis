import {Box} from '@mui/material';
import {Outlet} from 'react-router';
import {useSelector} from '@yiisoft/yii-dev-panel/store';
import {CollectorsMap} from '@maintenis/tilik-sdk/Helper/collectors';
import {DumpPage} from '@yiisoft/yii-dev-panel/Module/Debug/Pages/DumpPage';
import {LogPanel} from '@yiisoft/yii-dev-panel/Module/Debug/Component/Panel/LogPanel';
import {EventPanel} from '@yiisoft/yii-dev-panel/Module/Debug/Component/Panel/EventPanel';
import {MailerPanel} from '@yiisoft/yii-dev-panel/Module/Debug/Component/Panel/MailerPanel';
import {DatabasePanel} from '@yiisoft/yii-dev-panel/Module/Debug/Component/Panel/DatabasePanel';
import {ExceptionPanel} from '@yiisoft/yii-dev-panel/Module/Debug/Component/Panel/ExceptionPanel';
import {FilesystemPanel} from '@yiisoft/yii-dev-panel/Module/Debug/Component/Panel/FilesystemPanel';
import {MiddlewarePanel} from '@yiisoft/yii-dev-panel/Module/Debug/Component/Panel/MiddlewarePanel';
import {VarDumperPanel} from '@yiisoft/yii-dev-panel/Module/Debug/Component/Panel/VarDumperPanel';
import {ServicesPanel} from '@yiisoft/yii-dev-panel/Module/Debug/Component/Panel/ServicesPanel';
import {TimelinePanel} from '@yiisoft/yii-dev-panel/Module/Debug/Component/Panel/TimelinePanel';
import {RequestPanel} from '@yiisoft/yii-dev-panel/Module/Debug/Component/Panel/RequestPanel';
import ModuleLoader from '@yiisoft/yii-dev-panel/Application/Pages/RemoteComponent';
import * as React from 'react';

type CollectorDataProps = {
    collectorData: any;
    selectedCollector: string;
};

export function CollectorData({collectorData, selectedCollector}: CollectorDataProps) {
    const baseUrl = useSelector((state) => state.application.baseUrl) as string;
    const pages: {[name: string]: (data: any) => JSX.Element} = {
        [CollectorsMap.Mailer]: (data: any) => <MailerPanel data={data} />,
        [CollectorsMap.Service]: (data: any) => <ServicesPanel data={data} />,
        [CollectorsMap.Timeline]: (data: any) => <TimelinePanel data={data} />,
        [CollectorsMap.Log]: (data: any) => <LogPanel data={data} />,
        [CollectorsMap.Database]: (data: any) => <DatabasePanel data={data} />,
        [CollectorsMap.FilesystemStream]: (data: any) => <FilesystemPanel data={data} />,
        [CollectorsMap.Request]: (data: any) => <RequestPanel data={data} />,
        [CollectorsMap.Middleware]: (data: any) => <MiddlewarePanel {...data} />,
        [CollectorsMap.Event]: (data: any) => <EventPanel events={data} />,
        [CollectorsMap.Exception]: (data: any) => <ExceptionPanel exceptions={data} />,
        [CollectorsMap.VarDumper]: (data: any) => <VarDumperPanel data={data} />,
        default: (data: any) => {
            if (typeof data === 'object' && data.__isPanelRemote__) {
                return (
                    <React.Suspense fallback={`Loading`}>
                        <ModuleLoader
                            url={baseUrl + data.url}
                            module={data.module}
                            scope={data.scope}
                            props={{data: data.data}}
                        />
                    </React.Suspense>
                );
            }
            if (typeof data === 'string') {
                try {
                    JSON.parse(data);
                } catch (e) {
                    if (e instanceof SyntaxError) {
                        return <Box dangerouslySetInnerHTML={{__html: data}} />;
                    }
                }
            }
            return <DumpPage data={data} />;
        },
    };

    if (selectedCollector === '') {
        return <Outlet />;
    }

    const renderPage = selectedCollector in pages ? pages[selectedCollector] : pages.default;

    return renderPage(collectorData);
}
