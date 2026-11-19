// Check offline references and deterministic packaging in an isolated temporary copy.
import assert from 'node:assert/strict';
import { cpSync, existsSync, lstatSync, mkdtempSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { buildDossier, readGameTree, htmlFacts, sourceImports } from '../vendor/makefun-game.ts';
const root=resolve(import.meta.dirname,'..'),game=join(root,'game');
const caps={text_max_bytes:163840,screenshots:{max:4,max_bytes:262144},game_max_files:993,game_max_bytes:50331648,game_path_max_bytes:1000};
const tree=readGameTree(game,caps);assert(tree.count<=993&&tree.totalBytes<=50331648);
assert(lstatSync(join(game,'index.html')).size<=1048576);
const html=readFileSync(join(game,'index.html'),'utf8'),facts=htmlFacts(html);
const refs=[...facts.scripts.filter(s=>s.src).map(s=>['index.html',s.src]),...facts.links.map(l=>['index.html',l.href])];
const forbidden=new RegExp('https?' + ':/{2}|/{2}cdn|@import\\s+url','i');
for(const file of tree.files){
  const source=readFileSync(join(game,file.path),'utf8');assert(!forbidden.test(source),`external URL in ${file.path}`);
  if(file.path.endsWith('.js')){
    const parsed=spawnSync(process.execPath,['--check',join(game,file.path)],{encoding:'utf8'});assert.equal(parsed.status,0,parsed.stderr);
    refs.push(...sourceImports(source).map(ref=>[file.path,ref]));
  }
}
for(const [from,ref] of refs){const target=resolve(game,dirname(from),ref);assert(target.startsWith(game+'/')&&existsSync(target)&&lstatSync(target).isFile(),`invalid reference ${from}: ${ref}`);}
const scratch=mkdtempSync(join(tmpdir(),'sundown-package-'));
for(const path of ['game','vendor','main.ts'])cpSync(join(root,path),join(scratch,path),{recursive:true});
mkdirSync(join(scratch,'screenshots'));
const run=(out)=>spawnSync(process.execPath,[join(scratch,'main.ts')],{env:{...process.env,MAKEFUN_OUTPUT_DIR:out},encoding:'utf8'});
const absent=run(join(scratch,'without-images'));assert.notEqual(absent.status,0);assert(absent.stderr.includes('holds no image'));
const fixtureDir=process.argv[2];assert(fixtureDir,'pass a fixture screenshot directory (kit starter/screenshots)');
cpSync(resolve(fixtureDir),join(scratch,'screenshots'),{recursive:true});
const shots=readdirSync(join(scratch,'screenshots')).filter(n=>!n.startsWith('.'));assert(shots.length>=3&&shots.length<=4);
const outputs=['first','second'].map(n=>join(scratch,n));
for(const output of outputs){const result=run(output);assert.equal(result.status,0,result.stderr);assert.deepEqual(readFileSync(join(output,'dossier.json')),Buffer.from(buildDossier(output,caps)));for(const f of tree.files)assert.deepEqual(readFileSync(join(output,'game',f.path)),readFileSync(join(game,f.path)));assert.equal(readdirSync(join(output,'screenshots')).length,shots.length);}
function walk(dir,prefix=''){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name),prefix+e.name+'/'):[prefix+e.name]);}
for(const file of walk(outputs[0]))assert.deepEqual(readFileSync(join(outputs[0],file)),readFileSync(join(outputs[1],file)),`nondeterministic ${file}`);
assert.equal(readFileSync(join(root,'LICENSE'),'utf8').split('\n')[0],'SPDX-License-Identifier: MIT');
console.log(JSON.stringify({files:tree.files.map(f=>({path:f.path,bytes:f.bytes})),entries:tree.count,gameBytes:tree.totalBytes,indexBytes:lstatSync(join(game,'index.html')).size,references:refs.length,symlinks:0,packaging:'PASS: 2 identical runs, all copied game bytes match, dossier rebuild identical',fixtureImages:shots.length,emptyScreenshots:'expected vendor rejection; production screenshots intentionally deferred',temporaryFixture:scratch},null,2));
