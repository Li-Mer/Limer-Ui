import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import dts from "vite-plugin-dts"
import { readdirSync } from 'fs';
import { filter, map } from 'lodash-es';
import { get } from 'http';

const COMP_NAMES = [
    "Alert",
    "Button",
    "Collapse",
    "Dropdown",
    "Form",
    "Icon",
    "Input",
    "Loading",
    "Message",
    "MessageBox",
    "Notification",
    "Overlay",
    "Popconfirm",
    "Select",
    "Switch",
    "Tooltip",
    "Upload",
] as const;

function getDirecttoriesSync(path: string) { 
    const entries = readdirSync(path, { withFileTypes: true });
    return map(
        filter(entries, (entry:any) => entry.isDirectory()),
        (entry:any) => entry.name
    )
}

export default defineConfig({
    plugins: [vue() as any, dts({
        tsconfigPath: "../../tsconfig.build.json",
        outDir: "dist/types",
    })],
    build: {
        outDir: 'dist/es',
        lib: { 
            entry: resolve(__dirname, './index.ts'),
            name: 'LimerUi',
            fileName: "index",
            formats: ['es']
        },
        rollupOptions: {
            external: [
                'vue',
                "@fortawesome/fontawesome-svg-core",
                "@fortawesome/free-solid-svg-icons",
                "@fortawesome/vue-fontawesome",
                "@popperjs/core",
                "async-validator",
            ],
            output: {
                assetFileNames: (assetInfo : any) => {
                    if (assetInfo.name === 'style.css') return 'index.css';
                    return assetInfo.name as string;
                },
                manualChunks(id) {
                    if (id.includes("node_modules")) return "vendor";

                    if (id.includes("/packages/hooks")) return "hooks";

                    if (
                        id.includes("/packages/utils") ||
                        id.includes("plugin-vue:export-helper")
                    )
                        return "utils";
                    
                    for (const compName of getDirecttoriesSync('../components')) { 
                        if (id.includes(`/packages/components/${compName}`)) { 
                            return compName
                        }
                    }
                }
            }
        }
    }
})