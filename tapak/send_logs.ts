async function sendLog(logEntry: string) {
    const response = await fetch('http://localhost:8081/debug/api/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: logEntry,
    });
    if (!response.ok) {
        console.error(`Failed to send log: ${response.statusText}`);
    } else {
        console.log(`Log sent: ${logEntry.substring(0, 50)}...`);
    }
}

async function sendTenLogs() {
    const logs = [
        { message: 'Log message 1', level: 'info', category: 'application' },
        { message: 'Log message 2', level: 'warn', category: 'application' },
        { message: 'Log message 3', level: 'error', category: 'application' },
        { message: 'Log message 4', level: 'debug', category: 'application' },
        { message: 'Log message 5', level: 'info', category: 'request' },
        { message: 'Log message 6', level: 'warn', category: 'request' },
        { message: 'Log message 7', level: 'error', category: 'request' },
        { message: 'Log message 8', level: 'debug', category: 'request' },
        { message: 'Log message 9', level: 'info', category: 'database' },
        { message: 'Log message 10', level: 'warn', category: 'database' },
    ];

    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        const formattedLog = `${timestamp} [${log.level}][${log.category}] ${log.message}`;
        await sendLog(formattedLog);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }
}

sendTenLogs();
