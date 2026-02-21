import react from '@vitejs/plugin-react-swc';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            'components': path.resolve(__dirname, 'src/components'),
            'hook': path.resolve(__dirname, 'src/hook'),
            'utils': path.resolve(__dirname, 'src/utils')
        },
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
});
