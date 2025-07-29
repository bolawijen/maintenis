import {GridColDef, GridRenderCellParams, GridValidRowModel} from '@mui/x-data-grid';
import {FilterInput} from '@maintenis/tilik-sdk/Component/Form/FilterInput';
import {FullScreenCircularProgress} from '@maintenis/tilik-sdk/Component/FullScreenCircularProgress';
import {DataTable} from '@maintenis/tilik-sdk/Component/Grid';
import {JsonRenderer} from '@maintenis/tilik-sdk/Component/JsonRenderer';
import {regexpQuote} from '@maintenis/tilik-sdk/Helper/regexpQuote';
import {useGetParametersQuery} from '@yiisoft/yii-dev-panel/Module/Inspector/API/Inspector';
import {useCallback, useMemo} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useBreadcrumbs} from '@yiisoft/yii-dev-panel/Application/Context/BreadcrumbsContext';

const columns: GridColDef[] = [
    {field: '0', headerName: 'Name', width: 130},
    // { field: 'value', headerName: 'Value', width: 130 },
    {
        field: '1',
        headerName: 'Value',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => <JsonRenderer key={params.id} value={params.value} />,
    },
];

export const ParametersPage = () => {
    const {data, isLoading} = useGetParametersQuery();
    const [searchParams, setSearchParams] = useSearchParams();
    const searchString = searchParams.get('filter') || '';

    const rows = useMemo(() => {
        const isArray = Array.isArray(data);
        let rows = Object.entries(data || ([] as any));
        rows = rows.map((el) => ({0: el[0], 1: isArray ? Object.assign({}, el[1]) : el[1]})) as any;
        return rows;
    }, [data]);

    const filteredRows = useMemo(() => {
        const regExp = new RegExp(regexpQuote(searchString), 'i');
        return rows.filter((object) => object[0].match(regExp));
    }, [rows, searchString]);

    const onChangeHandler = useCallback(async (value: string) => {
        setSearchParams({filter: value});
    }, []);

    useBreadcrumbs(() => ['Inspector', 'Parameters']);

    if (isLoading) {
        return <FullScreenCircularProgress />;
    }

    return (
        <>
            <FilterInput value={searchString} onChange={onChangeHandler} />
            <div style={{width: '100%'}}>
                <DataTable rows={filteredRows as GridValidRowModel[]} getRowId={(row) => row[0]} columns={columns} />
            </div>
        </>
    );
};
