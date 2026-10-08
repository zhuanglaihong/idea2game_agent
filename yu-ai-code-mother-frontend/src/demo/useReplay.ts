import { ref, onUnmounted } from 'vue'
import { replayScripts, type ReplayStep } from './replayScripts'
export interface ReplayMessage { role: string; text: string; title?: string; type?: ReplayStep['type']; file?: string; streaming?: boolean }
export function useReplay(onUpdate: () => void) {
 const stage=ref(0), running=ref(false), paused=ref(false), messages=ref<ReplayMessage[]>([])
 let timer:ReturnType<typeof setInterval>|undefined, stepIndex=0, offset=0, script:ReplayStep[]=[]
 const clear=()=>{if(timer)clearInterval(timer);timer=undefined}
 function cancel(){clear();running.value=false;paused.value=false;for(const m of messages.value)m.streaming=false}
 function finish(){clear();for(let i=stepIndex;i<script.length;i++){const s=script[i]!;if(i===stepIndex&&messages.value[messages.value.length-1]?.streaming)Object.assign(messages.value[messages.value.length-1]!,{text:s.text,streaming:false});else messages.value.push({role:'assistant',...s,streaming:false})}stage.value=5;running.value=false;paused.value=false;onUpdate()}
 function begin(kind:'tiles'|'zombies'|'history'|'gates',prompt:string){cancel();script=replayScripts[kind];stepIndex=offset=0;stage.value=0;messages.value=[{role:'user',text:prompt}];running.value=true;paused.value=false;messages.value.push({role:'assistant',...script[0]!,text:'',streaming:true});let hold=0
  timer=setInterval(()=>{if(paused.value)return;if(hold>0){hold--;return}const s=script[stepIndex]!;const m=messages.value[messages.value.length-1]!;offset=Math.min(s.text.length,offset+3);m.text=s.text.slice(0,offset);onUpdate();if(offset>=s.text.length){m.streaming=false;stage.value=stepIndex+1;stepIndex++;if(stepIndex===script.length){clear();running.value=false;onUpdate();return}offset=0;hold=125;messages.value.push({role:'assistant',...script[stepIndex]!,text:'',streaming:true})}},32)
 }
 onUnmounted(cancel)
 return{stage,running,paused,messages,begin,cancel,finish}
}

