import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { ref } from 'vue';
let timer,unmount,updates=0;
const modules={};
function load(name){if(modules[name])return modules[name];const mod={exports:{}};const code=ts.transpileModule(fs.readFileSync(`src/demo/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{exports:mod.exports,require:n=>n==='vue'?{ref,onUnmounted:cb=>unmount=cb}:load(n.replace('./','')),setInterval:fn=>(timer=fn,1),clearInterval:()=>timer=undefined});modules[name]=mod.exports;return mod.exports;}
const r=load('useReplay').useReplay(()=>updates++),scripts=load('replayScripts').replayScripts;
r.begin('zombies','专业射击需求');assert.equal(r.stage.value,0);assert.equal(r.messages.value[0].text,'专业射击需求');assert.equal(r.messages.value[1].text,'');timer();assert(r.messages.value[1].text.length>0);
r.paused.value=true;const frozen=r.messages.value[1].text;for(let i=0;i<20;i++)timer();assert.equal(r.messages.value[1].text,frozen);r.paused.value=false;
const reached=new Set();for(let i=0;i<6000&&r.running.value;i++){timer();reached.add(r.stage.value);}assert.equal(r.running.value,false);assert.equal(r.stage.value,5);for(const stage of [1,2,3,4,5])assert(reached.has(stage));assert.equal(r.messages.value.length,6);for(let i=0;i<5;i++)assert.equal(r.messages.value[i+1].text,scripts.zombies[i].text);r.finish();assert.equal(r.messages.value.length,6);
r.begin('history','转刀');timer();r.begin('tiles','三消');assert.equal(r.messages.value.length,2);assert.equal(r.messages.value[0].text,'三消');r.finish();assert.equal(r.stage.value,5);assert(r.messages.value[5].text.includes('三张配对'));r.begin('history','重播');unmount();assert.equal(timer,undefined);assert.equal(r.running.value,false);assert(updates>20);
console.log('PASS: 流式文字推进、五阶段完成、暂停继续、跳过不重复、切换案例取消旧回放与卸载清理');
