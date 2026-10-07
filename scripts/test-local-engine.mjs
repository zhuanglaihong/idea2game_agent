import assert from 'node:assert/strict';
import {buildArguments,execute} from './local-engine.mjs';
assert(buildArguments('unity','D:/game with spaces').includes('D:/game with spaces'));
assert(buildArguments('unity','D:/game').includes('GameBuild.Web'));
assert.deepEqual(buildArguments('godot','D:/game','Web').slice(0,5),['--headless','--path','D:/game','--export-release','Web']);
assert.throws(()=>buildArguments('flash','D:/game'));
await assert.rejects(()=>execute({},'unity'),/Configure/);
await assert.rejects(()=>execute({engines:{unity:'relative.exe'}},'unity'),/absolute/);
console.log('PASS local engine arguments, missing configuration and executable-path validation; real engine builds require installed engines.');
