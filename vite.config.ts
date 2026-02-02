import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const REPO_NAME = 'slot-demo-0';

export default defineConfig(({ command }) => {
    const isBuild = command === 'build';

    return {
        plugins: [
            react({
                babel: {
                    plugins: [['babel-plugin-react-compiler']],
                },
            }),
        ],
        base: isBuild ? `/${REPO_NAME}/` : '/',
    };
});
