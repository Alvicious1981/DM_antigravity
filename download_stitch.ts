import fs from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'apps', 'web-client', 'src', 'components', 'stitch', 'html');
const jsonPath = 'C:\\Users\\Alvicious\\.gemini\\antigravity\\brain\\eb5f32f1-b22a-40a1-9e9e-e22a73b79402\\.system_generated\\steps\\63\\output.txt';

async function main() {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    for (const screen of data.screens) {
        const screenId = screen.name.split('/').pop();
        const url = screen.htmlCode.downloadUrl;
        console.log(`Downloading ${screen.title} (${screenId})...`);

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const text = await response.text();
            fs.writeFileSync(path.join(outDir, `${screenId}.html`), text);
            console.log(`Saved ${screenId}.html`);
        } catch (e) {
            console.error(`Failed to download ${screenId}:`, e);
        }
    }
}

main();
