const fs = require('fs');
const path = require('path');
const download = require('download');

const script = async () => {
    const ressources = fs.readFileSync('ressources.md', {encoding: 'utf8'});
    const urls = ressources.split('\n').map(l => l.trim()).filter(l => l.length);
    for (const url of urls) {
        const dir = path.dirname(url.replace('https://workadventure.github.io/startup/', './'));
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        await download(url, dir);
        console.log(`${url} downloaded to ${dir}`);
    }
};
script().then();
