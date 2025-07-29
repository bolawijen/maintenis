import {FilePresent} from '@mui/icons-material';
import {
    Alert,
    AlertTitle,
    Link,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import Box from '@mui/material/Box';
import {parseFilePathWithLineAnchor} from '@maintenis/tilik-sdk/Helper/filePathParser';
import {JsonRenderer} from '@yiisoft/yii-dev-panel/Module/Debug/Component/JsonRenderer';
import React from 'react';

type Level = 'error' | 'info' | 'debug' | 'warn';
type LogEntry = {
    context: object;
    level: Level;
    line: string;
    message: string;
    time: number;
};
type LogPanelProps = {
    data: LogEntry[];
};

const getLogLevelStyles = (level: Level) => {
    switch (level) {
        case 'debug':
            return { backgroundColor: 'transparent', color: 'rgb(54, 96, 146)' };
        case 'info':
            return { backgroundColor: 'transparent', color: 'rgb(0, 125, 60)' };
        case 'warn':
            return { backgroundColor: 'transparent', color: 'rgb(225, 125, 50)' };
        case 'error':
            return { backgroundColor: 'transparent', color: 'rgb(240, 0, 0)' };
        default:
            return {};
    }
};

export const LogPanel = ({data}: LogPanelProps) => {
    if (!data || data.length === 0) {
        return (
            <Box m={2}>
                <Alert severity="info">
                    <AlertTitle>No logs found during the process</AlertTitle>
                </Alert>
            </Box>
        );
    }
    return (
        <TableContainer component={Paper}>
            <Table sx={{minWidth: 650}} aria-label="log table">
                <TableHead>
                    <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Level</TableCell>
                        <TableCell>Message</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((entry, index) => (
                        <TableRow
                            key={index}
                            sx={{
                                backgroundColor: getLogLevelStyles(entry.level).backgroundColor,
                                '&:last-child td, &:last-child th': {border: 0}
                            }}
                        >
                            <TableCell component="th" scope="row" sx={{ color: getLogLevelStyles(entry.level).color }}>
                                {new Date(entry.time).toLocaleString()}
                            </TableCell>
                            <TableCell sx={{ color: getLogLevelStyles(entry.level).color }}>{entry.level}</TableCell>
                            <TableCell sx={{ color: getLogLevelStyles(entry.level).color }}>{entry.message}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
