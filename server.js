import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
http.createServer(async (req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root+path.sep) || pathname.split('/').some(p=>p.startsWith('.'))) {res.writeHead(403);res.end();return;}
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream'});res.end(data);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(Number(process.env.PORT)||5173,'0.0.0.0',()=>console.log('Lumenwild running on port '+(process.env.PORT||5173)));
