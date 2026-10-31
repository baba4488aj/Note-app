import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {deflateRawSync} from 'node:zlib';
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'desktop-build','Lumenwild');
await mkdir(out,{recursive:true});
execFileSync(process.execPath,[path.join(root,'scripts','standalone.js'),path.join(out,'Lumenwild.html')],{stdio:'inherit'});
for(const name of ['server.cjs','Start-Lumenwild.cmd','README.txt']){const source=path.join(root,'desktop',name),target=path.join(out,name);if(name.endsWith('.cmd'))await writeFile(target,(await readFile(source,'utf8')).replace(/\r?\n/g,'\r\n'));else await copyFile(source,target);}
// A small dependency-free ZIP writer: all output is generated game/launcher content.
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(data){let value=0xffffffff;for(const b of data)value=crcTable[(value^b)&255]^(value>>>8);return (value^0xffffffff)>>>0;}
let offset=0;const local=[],central=[];
for(const name of ['Lumenwild.html','server.cjs','Start-Lumenwild.cmd','README.txt']){
 const filename=Buffer.from('Lumenwild/'+name),data=await readFile(path.join(out,name)),packed=deflateRawSync(data),crc=crc32(data),head=Buffer.alloc(30);
 head.writeUInt32LE(0x04034b50,0);head.writeUInt16LE(20,4);head.writeUInt16LE(0x800,6);head.writeUInt16LE(8,8);head.writeUInt16LE(33,12);head.writeUInt32LE(crc,14);head.writeUInt32LE(packed.length,18);head.writeUInt32LE(data.length,22);head.writeUInt16LE(filename.length,26);
 local.push(head,filename,packed);const entry=Buffer.alloc(46);entry.writeUInt32LE(0x02014b50,0);entry.writeUInt16LE(20,4);entry.writeUInt16LE(20,6);entry.writeUInt16LE(0x800,8);entry.writeUInt16LE(8,10);entry.writeUInt16LE(33,14);entry.writeUInt32LE(crc,16);entry.writeUInt32LE(packed.length,20);entry.writeUInt32LE(data.length,24);entry.writeUInt16LE(filename.length,28);entry.writeUInt32LE(offset,42);central.push(entry,filename);offset+=head.length+filename.length+packed.length;
}
const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(4,8);end.writeUInt16LE(4,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
const destination=process.argv[2]||path.join(root,'Lumenwild-Desktop-Windows.zip');await writeFile(destination,Buffer.concat([...local,directory,end]));console.log('Created Windows desktop launcher: '+destination);
