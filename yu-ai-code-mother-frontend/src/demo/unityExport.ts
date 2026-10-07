import type {GameWork} from './games'
export function unityFiles(work:GameWork):Record<string,Uint8Array>{
 const text=(s:string)=>new TextEncoder().encode(s)
 return {
 'Packages/manifest.json':text(JSON.stringify({dependencies:{'com.unity.modules.physics':'1.0.0','com.unity.modules.imgui':'1.0.0','com.unity.modules.inputlegacy':'1.0.0'}})),
 'ProjectSettings/ProjectVersion.txt':text('m_EditorVersion: 6000.0.23f1\n'),
 '.gitignore':text('Library/\nTemp/\nLogs/\nObj/\nBuild/\nUserSettings/\n'),
 'Assets/Resources/game.json':text(JSON.stringify(work,null,2)),
 'Assets/Scripts/BladeArena.cs':text(`using UnityEngine;
using System.Collections.Generic;

// Engine-native prototype; independent implementation, not a converted Web demo.
public sealed class BladeArena : MonoBehaviour {
    [System.Serializable] public class Config { public float speed=1; public int difficulty=1; public string name; }
    class Enemy { public GameObject body; public float hp=30; public float hit; }
    Transform hero; readonly List<Enemy> enemies=new List<Enemy>();
    readonly List<Transform> blades=new List<Transform>();
    Config cfg; float clock,spawn,angle,hp=100,xp; int level=1,kills; bool ended;
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    static void Boot(){ if(FindFirstObjectByType<BladeArena>()==null) new GameObject("BladeArena").AddComponent<BladeArena>(); }
    void Start(){
        var file=Resources.Load<TextAsset>("game"); cfg=file?JsonUtility.FromJson<Config>(file.text):new Config();
        var camera=Camera.main; if(!camera){var c=new GameObject("Main Camera"); c.tag="MainCamera"; camera=c.AddComponent<Camera>();}
        camera.orthographic=true; camera.orthographicSize=12; camera.transform.position=new Vector3(0,20,-15); camera.transform.rotation=Quaternion.Euler(55,0,0);
        var light=new GameObject("Sun").AddComponent<Light>(); light.type=LightType.Directional; light.transform.rotation=Quaternion.Euler(50,-30,0);
        var floor=GameObject.CreatePrimitive(PrimitiveType.Plane); floor.name="Open terrain"; floor.transform.localScale=Vector3.one*30; Paint(floor,new Color(.35f,.48f,.29f));
        var p=GameObject.CreatePrimitive(PrimitiveType.Capsule); p.name="Player"; p.transform.position=Vector3.up; Paint(p,new Color(.7f,.24f,.12f)); hero=p.transform;
        AddBlade();
    }
    void Paint(GameObject body,Color color){var shader=Shader.Find("Standard"); body.GetComponent<Renderer>().material=new Material(shader);body.GetComponent<Renderer>().material.color=color;}
    void AddBlade(){var b=GameObject.CreatePrimitive(PrimitiveType.Cube);Destroy(b.GetComponent<Collider>());b.transform.localScale=new Vector3(.2f,.2f,1);Paint(b,new Color(1,.72f,.12f));blades.Add(b.transform);}
    void Update(){
        if(ended)return;
        float dt=Time.deltaTime; clock+=dt;spawn-=dt;angle+=dt*4.5f;
        Vector3 direction=new Vector3(Input.GetAxisRaw("Horizontal"),0,Input.GetAxisRaw("Vertical"));
        if(Input.GetMouseButton(0)){var ray=Camera.main.ScreenPointToRay(Input.mousePosition);var plane=new Plane(Vector3.up,Vector3.zero);if(plane.Raycast(ray,out float distance)){direction=ray.GetPoint(distance)-hero.position;direction.y=0;}}
        hero.position+=Vector3.ClampMagnitude(direction,1)*dt*5*cfg.speed;
        Camera.main.transform.position=hero.position+new Vector3(0,20,-15);
        int desired=Mathf.Min(9,1+Mathf.FloorToInt(clock/5)); if(blades.Count<desired)AddBlade();
        for(int i=0;i<blades.Count;i++){float a=angle+i*Mathf.PI*2/blades.Count; blades[i].position=hero.position+new Vector3(Mathf.Cos(a),0,Mathf.Sin(a))*2.5f;blades[i].rotation=Quaternion.Euler(0,-a*Mathf.Rad2Deg,0);}
        if(spawn<=0){spawn=Mathf.Max(.15f,.8f-clock*.005f)/Mathf.Max(1,cfg.difficulty);float a=Random.value*Mathf.PI*2;var e=GameObject.CreatePrimitive(PrimitiveType.Capsule);e.transform.position=hero.position+new Vector3(Mathf.Cos(a),0,Mathf.Sin(a))*16;Paint(e,new Color(.22f,.32f,.6f));enemies.Add(new Enemy{body=e});}
        for(int i=enemies.Count-1;i>=0;i--){var e=enemies[i];e.hit-=dt;e.body.transform.position=Vector3.MoveTowards(e.body.transform.position,hero.position,dt*2);if(Vector3.Distance(e.body.transform.position,hero.position)<1)hp-=dt*12;
            if(e.hit<=0)foreach(var blade in blades)if(Vector3.Distance(blade.position,e.body.transform.position)<1){e.hp-=12+level*2;e.hit=.18f;break;}
            if(e.hp<=0){Destroy(e.body);enemies.RemoveAt(i);kills++;xp+=10;if(xp>=level*40){xp=0;level++;hp=Mathf.Min(100,hp+20);if(blades.Count<9)AddBlade();}}
        }
        if(hp<=0)ended=true;
    }
    void OnGUI(){GUI.Label(new Rect(15,15,480,30),"Blade Arena | HP "+Mathf.CeilToInt(hp)+" | Kills "+kills+" | Level "+level+" | Blades "+blades.Count);if(ended)GUI.Label(new Rect(15,50,300,30),"Game over - restart Play mode");}
}
`),
 'Assets/Editor/GameBuild.cs':text(`using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEditor.Build.Reporting;
using UnityEngine;
public static class GameBuild {
 [MenuItem("Idea2Game/Create and Build Web Prototype")]
 public static void Web(){
  System.IO.Directory.CreateDirectory("Assets/Scenes");
  var scene=EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
  new GameObject("BladeArena").AddComponent<BladeArena>();
  EditorSceneManager.SaveScene(scene,"Assets/Scenes/Main.unity");
  PlayerSettings.WebGL.compressionFormat=WebGLCompressionFormat.Disabled;
  var report=BuildPipeline.BuildPlayer(new BuildPlayerOptions{scenes=new[]{"Assets/Scenes/Main.unity"},locationPathName="Build/Web",target=BuildTarget.WebGL,options=BuildOptions.None});
  if(report.summary.result!=BuildResult.Succeeded)throw new System.Exception("Web build failed: "+report.summary.result);
 }
}
`),
 'build.ps1':text(`param([Parameter(Mandatory=$true)][string]$UnityPath)
$ErrorActionPreference='Stop'
if(!(Test-Path -LiteralPath $UnityPath -PathType Leaf)){throw 'Unity.exe not found'}
$projectPath=$PSScriptRoot
& $UnityPath -batchmode -quit -projectPath $projectPath -executeMethod GameBuild.Web -logFile (Join-Path $projectPath 'build.log')
if($LASTEXITCODE -ne 0){throw 'Unity build failed; inspect build.log'}
`),
 'README.md':text('# Unity转刀基础原型\n\n这是独立C#基础原型，未编译验证，不是当前网页游戏的完整移植：包含开放地形、移动、四面刷怪、旋转碰撞、自动增刀和自动升级；尚缺正式美术、经验掉落拾取、三选一升级及乔峰Boss。\n\n使用Unity 6.0（可在Hub中选择匹配版本或升级工程），安装Web Build Support并激活许可证。打开工程，通过Idea2Game/Create and Build Web Prototype生成场景与Build/Web；也可执行 ./build.ps1 -UnityPath <Unity.exe绝对路径>。首次导入可能升级API；需读取日志并实际试玩验收。源码为Assets/Scripts和Assets/Editor。\n\n发布的是Build/Web中的HTML/JS/WASM/data，不是直接发布C#。Cloudflare可托管Web产物，部署前检查文件大小限制。当前浏览器预览仍为原Web实现。\n')
 }
}
