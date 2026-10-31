import {readFile} from 'node:fs/promises';
import {GAME_VERSION} from '../src/rules.js';
const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
if(pkg.version!==GAME_VERSION)throw new Error('Package and game versions differ. Run npm run sync-version.');
if(process.env.GITHUB_REF_TYPE==='tag'&&process.env.GITHUB_REF_NAME!=='v'+pkg.version)throw new Error('The release tag must be v'+pkg.version+'.');
const feed=JSON.parse(await readFile(new URL('../desktop/release-config.json',import.meta.url),'utf8'));
const expected=feed.owner+'/'+feed.repo;
if(process.env.GITHUB_REPOSITORY&&expected!==process.env.GITHUB_REPOSITORY)throw new Error('Update desktop/release-config.json to use the publishing repository before releasing.');
console.log('Release configuration validated for '+pkg.version);
