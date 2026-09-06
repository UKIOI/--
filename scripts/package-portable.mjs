import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),frontend=resolve(root,'frontend'),output=resolve(root,'release','战墙-分享版');
const build=spawnSync(process.execPath,[resolve(frontend,'node_modules/vite/bin/vite.js'),'build','--outDir','dist-portable'],{cwd:frontend,env:{...process.env,VITE_PORTABLE:'true'},stdio:'inherit',windowsHide:true});if(build.status!==0)process.exit(build.status??1);
const dist=resolve(frontend,'dist-portable');let html=readFileSync(resolve(dist,'index.html'),'utf8');
html=html.replace(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g,(_,src)=>{const code=readFileSync(resolve(dist,src.replace(/^\//,'')),'utf8');return '<script type="module">'+code.replace(/<\/script/gi,'<\\/script')+'</script>';});
html=html.replace(/<link\b[^>]*\bhref="([^"]+\.css)"[^>]*>/g,(_,src)=>'<style>'+readFileSync(resolve(dist,src.replace(/^\//,'')),'utf8')+'</style>');
if(/\b(?:src|href)="\/?assets\//.test(html))throw Error('External build assets remain');
const licenses=['vue','pinia'].map(p=>{const file=['LICENSE','LICENSE.md'].map(f=>resolve(frontend,'node_modules',p,f)).find(existsSync);if(!file)throw Error('Missing license: '+p);return p+'\n'+readFileSync(file,'utf8');}).join('\n\n');
html+='\n<!-- Third-party notices\n'+licenses.replace(/-->/g,'-- >')+'\n-->\n';
mkdirSync(output,{recursive:true});writeFileSync(resolve(output,'战墙-双击即玩.html'),html);
writeFileSync(resolve(output,'游玩说明.txt'),`战墙 · 离线分享版

1. 将压缩包完整解压，双击“战墙-双击即玩.html”。
2. 如果打开成代码，请右键 → 打开方式 → Microsoft Edge、Chrome 或 Firefox。
3. 电脑浏览器即可游玩，无需安装 Python、Node.js，无需联网。
4. 建议窗口至少 1280 × 720；本版以电脑键盘鼠标操作为主。
5. 存档、音量、难度和战绩只保存在当前浏览器。本包不含制作人的存档。
   请使用普通窗口；清除浏览器数据会删除进度。不同浏览器不共享存档。
6. 对外转发整个压缩包即可，不需要发送源代码、backend 或 frontend 文件夹。

操作：1—9、0、- 选择建筑；Space 暂停；Shift + 点击多选；点击防御塔直接操控。
所有模式与难度：玩家弹体均可穿过城墙和其他友方建筑。
局域网合作：房主运行项目中的“启动局域网联机.bat”，队友用浏览器打开房主的局域网地址并输入房间码；无需安装游戏。离线 HTML 本身不能启动联机服务。
新局可选难度，已有战局可在“设置”调整。游戏内提供操作说明和怪物图鉴。

这是离线浏览器版，关闭页面即可退出。音效在首次点击开始游戏后启用。
第三方开源许可见“开源许可.txt”（同时嵌入 HTML）。
`,{encoding:'utf8'});writeFileSync(resolve(output,'开源许可.txt'),licenses);console.log('Portable game: '+resolve(output,'战墙-双击即玩.html'));
