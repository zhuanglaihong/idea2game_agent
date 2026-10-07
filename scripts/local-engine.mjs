import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
const run=promisify(execFile);
export function buildArguments(engine,project,preset='Web'){
 if(engine==='unity')return ['-batchmode','-quit','-projectPath',project,'-executeMethod','GameBuild.Web','-logFile',path.join(project,'build.log')];
 if(engine==='godot')return ['--headless','--path',project,'--export-release',preset,path.join(project,'Build','Web','index.html')];
 throw Error('Only unity and godot are configured local engines');
}
export async function execute(config,engine,action='probe'){
 const executable=config.engines?.[engine];if(!executable)throw Error(`Configure engines.${engine} with an absolute executable path`);
 if(!path.isAbsolute(executable)||(await fs.stat(executable)).isDirectory())throw Error('Engine executable path must be an absolute file path');
 if(action==='probe'){const result=await run(executable,engine==='unity'?['-version']:['--version'],{timeout:30000,maxBuffer:1024*1024});return {engine,action,output:result.stdout||result.stderr};}
 if(action!=='build')throw Error('Action must be probe or build');
 const workspace=await fs.realpath(config.workspace);const project=await fs.realpath(config.project);const relative=path.relative(workspace,project);
 if(relative.startsWith('..')||path.isAbsolute(relative))throw Error('Project must be inside the configured workspace');
 const required=engine==='unity'?'Assets/Editor/GameBuild.cs':'project.godot';await fs.access(path.join(project,required));
 if(engine==='godot'){await fs.access(path.join(project,'export_presets.cfg'));await fs.mkdir(path.join(project,'Build','Web'),{recursive:true});}
 const result=await run(executable,buildArguments(engine,project,config.preset),{cwd:project,timeout:config.timeoutMs||600000,maxBuffer:8*1024*1024});
 await fs.access(path.join(project,'Build','Web','index.html'));
 return {engine,action,outputDirectory:path.join(project,'Build','Web'),output:result.stdout||result.stderr};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const [file,engine,action]=process.argv.slice(2);if(!file)throw Error('Usage: node scripts/local-engine.mjs config.json unity|godot probe|build');console.log(JSON.stringify(await execute(JSON.parse(await fs.readFile(file,'utf8')),engine,action),null,2));}
 catch(error){console.error(error.message);process.exitCode=1;}
}
