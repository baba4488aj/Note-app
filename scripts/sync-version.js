import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url),pkg=JSON.parse(await readFile(new URL('package.json',root),'utf8'));
const rules=new URL('src/rules.js',root),server=new URL('desktop/server.cjs',root);
await writeFile(rules,(await readFile(rules,'utf8')).replace(/GAME_VERSION='[^']+'/,'GAME_VERSION=\''+pkg.version+'\''));
await writeFile(server,(await readFile(server,'utf8')).replace(/DESKTOP_VERSION='[^']+'/,'DESKTOP_VERSION=\''+pkg.version+'\''));
console.log('Synchronized game and save compatibility version '+pkg.version);
