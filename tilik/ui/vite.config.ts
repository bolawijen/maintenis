import react from '@vitejs/plugin-react';
import {defineConfig, loadEnv} from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import path from 'path';

const sharedModules = ['react', 'react-dom', 'react-redux', 'react-router', 'react-router-dom', 'redux-persist'];
export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    return {
        define: {
            '__BACKEND_URL__': JSON.stringify(env.VITE_BACKEND_URL || 'http://127.0.0.1:8080'),
            'import.meta.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL),
        },
    server: {
        open: false,
        port: 5000,
        fs: {
            allow: ['.'],
        },
        watch: {
            include: ['src/**/*.tsx'],
            ignored: [
                '!**/node_modules/@maintenis/tilik-sdk/**',
                '!**/node_modules/@yiisoft/yii-dev-toolbar/**',
            ],
        },
    },
    resolve: {
        alias: {
            // Needed for `useSelector` tracking in wdyr.tsx: https://github.com/welldone-software/why-did-you-render/issues/85
            'react-redux': 'react-redux/dist/react-redux.js',
            '@maintenis/tilik-sdk': path.resolve(__dirname, '../sdk/dist'),
            
            '@yiisoft/yii-dev-panel': path.resolve(__dirname, './src'),
        },
    },
    plugins: [
        react({
            // jsxImportSource: '@welldone-software/why-did-you-render',
        }),
        svgrPlugin(),
    ],
    base: process.env.VITE_ENV === 'github' ? 'https://yiisoft.github.io/yii-dev-panel/' : './',
    build: {
        rollupOptions: {
            output: {
                assetFileNames: 'bundle.css',
                entryFileNames: 'bundle.js',
            },
            external: ['@maintenis/tilik-sdk',  '@mui/x-tree-view', 'src/service-worker.ts'],
        },
        minify: false,
        outDir: 'dist',
        target: 'esnext',
    },
    };
});