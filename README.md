# 战墙 · WARWALL

基于 [PRD.md](PRD.md) 实现的桌面浏览器单机无限生存游戏。Vue 3 + TypeScript + Pinia 管理界面，Canvas 2D 绘制战场，独立固定步引擎运行战斗；FastAPI + SQLite 提供配置、存档、设置与战绩。

## 启动（Windows PowerShell）

安装 Python 3.11+ 与 Node.js 22.12+。本机交付环境已经安装项目依赖并生成生产构建。

第一次安装，在项目根目录执行：

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.lock
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

另开 PowerShell，进入项目的 frontend 目录：

```powershell
cd frontend
npm ci
npm run dev
```

访问 http://127.0.0.1:5173。后端必须先启动，首次游戏需要通过 API 获取配置。

验证生产版本：保持后端运行，在 frontend 执行：

```powershell
npm run build
npm run preview
```

访问 http://127.0.0.1:4173。开发和生产预览均代理 `/api` 到 `127.0.0.1:8000`，不依赖跨域许可。

已构建后，也可在根目录运行 `powershell -ExecutionPolicy Bypass -File .\start.ps1`。脚本在后台启动两个服务，控制台按 Enter 后只停止本次启动的进程。不要与已经占用 8000/4173 端口的服务重复启动。

## 操作

- 怪物现在有步伐、旋翼、攻击前扑等动作；轰炸物从机体释放并实体飞行。两个 Boss 新增震波、巨岩、激光与导弹攻击，详见 [怪物战斗更新](docs/enemy-combat-update.md)。
- 新增桥梁（9）、加农炮（0）、狙击塔（-）。桥梁点击格子指定高度，可水平延伸并承载炮塔，失去全部支撑后坠落。详细数值与分支见 [新建筑设计](docs/new-buildings.md)。
- 迫击炮会转向目标并从炮口发射抛物线炮弹，显示尾迹、炮口闪光、后坐和命中冲击；弩炮与防空塔也会朝目标转向。减少动态效果会关闭后坐和尾迹。
- 首页“怪物图鉴”可查看全部六种怪物与两个 Boss 的造型、基础属性、行为和应对建议，可筛选地面、空中与 Boss。
- 设置中的“试听战斗音效”用于检查音量；战斗音效增益已提高，加入动态压缩，并避免重复播放同一视觉特效。
- 数字键 1—8 或点击建筑卡片选择建筑，鼠标显示预测落点，左键每次投放一座。
- 右键 / Esc 取消投放。取消后点击建筑，查看生命、选择一次分支升级，或按住拆除 1 秒回收。
- Space 暂停 / 继续；失焦自动暂停，恢复窗口后手动继续。
- 矿场生产金币，城墙阻挡地面敌人，上层火力需要射界；防空塔专门打空中单位。
- 游戏每 15 秒模拟时间自动保存。菜单提供“保存并返回主菜单”，保存失败明确提示浏览器副本状态。

## 测试

后端：

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest -q
```

前端：

```powershell
cd frontend
npm run typecheck
npm test
npm run build
npx playwright install chromium firefox
# 后端与 npm run preview 都需要运行
npm run test:e2e
```

`npm test` 包含一小时无渲染模拟和两种自动建造策略，结果写入 `docs/stability-result.json`、`docs/balance-result.json`。压测会人工补满核心和敌人，这是稳定性负载，不能当作平衡或人工试玩结果。

`npm run generate:api` 从运行中后端的 OpenAPI 生成 `src/api/generated.ts`。修改 Pydantic schema 后应重新生成并提交类型文件。

## 代码与数据

- `content/game-config.json`：运行时数值与内容单一来源。`build_config.py` 只检查并格式化现有 JSON，不会重置平衡数值；`balance-v1.json` 保留旧数值，用于存档适配和前后对比。
- `frontend/src/game/engine.ts`：命令、重力、战斗、经济、调度与确定性 xorshift32 状态。
- `frontend/src/game/systems/spatial.ts`：空间桶与射线 AABB 查询。
- `frontend/src/game/render/`：程序绘图与音效，不参与模拟确定性。
- `frontend/src/game/persistence.ts`：串行保存、IndexedDB 副本与冲突保护。
- `backend/app/`：配置校验、API、Pydantic 快照、SQLite 事务。
- `data/warwall.sqlite3`：首次请求自动创建，可通过 `WARWALL_DB` 环境变量改到测试数据库。不要提交数据库。

开发模式在底部提供敌人 / Boss 生成、强化和结算测试入口，生产构建不显示。性能面板显示实际 RAF 频率和每帧模拟耗时。八类建筑可直接从正常建筑栏验证。

存档是单槽，覆盖新局前提示并保留浏览器备份；读档总是暂停。不同 runId 或 revision 冲突需要显式选择。版本不兼容保留并支持导出 JSON，不自动迁移。

## 弹体、桥梁与背景音更新

箭塔发射带箭头和尾羽的实体箭矢，加农炮发射可见铁弹；按距离计算飞行时间，碰撞后结算伤害。桥梁使用空心钢桁架与连续桥面，升级具有不同外观。

背景音景包含风声、低频运转声与缓慢音符，点击进入游戏后启用，可在设置中调整“背景音景”音量（调至 0 静音）。暂停时渐弱，无需下载音频资源。更新后先保存，再按 Ctrl+F5 刷新页面。

## 离线分享版

分享版是单个 HTML，电脑上双击即可用浏览器离线游玩，无需 Python、Node.js 或本地服务。存档与战绩保存在接收者自己的浏览器，不包含开发环境的存档；清除浏览器数据会删除分享版进度。建议使用普通浏览窗口，分辨率至少 1280×720。

开发者可在 `frontend` 中运行 `node ../scripts/package-portable.mjs`，输出到 `release/战墙-分享版/`。其中 `战墙-双击即玩.html` 可单独运行，文件夹附带游玩说明和开源许可。构建目录与当前联网开发版分开，不影响原有启动方式。

## 验收记录与限制

**平衡第 2 版**：重新调整全部 11 种建筑、升级分支及 13 种敌人的数值。旧存档按比例适配建筑和怪物生命，保留实际投入。完整前后对比及测试说明见 [平衡调整表](docs/balance-v2.md)，最终数值以 `content/game-config.json` 为准，其他历史更新文档中的旧数值仅供回顾。

难度更新：主页可选简单 / 普通 / 困难，已有战局可在设置里调整。**困难模式只有子弹穿城墙，箭矢与炮弹会被城墙挡住，但可穿过其他友方建筑；简单和普通模式全部穿透友方建筑。** 狙击弹、母舰强化和播报修复详见 [难度更新说明](docs/difficulty-update.md)。

最新战术扩展：新增五种虫类、导弹与空降事件、Boss 范围攻击、建筑损伤和升级外观。选中防御塔按 **E** 操控，指向敌人按住左键开火，右键退出；**Shift + 点击** 多选建筑后，在侧栏统一升级。详细机制与数值见 [战术扩展说明](docs/tactical-expansion.md)。

具体执行结果见 [docs/acceptance.md](docs/acceptance.md)。未完成的人工试玩、真实集显设备性能与浏览器覆盖会明确标注；自动化测试通过不等同于 PRD 全部人工验收通过。

技术文档参考：[Vite 官方入门](https://vite.dev/guide/)、[FastAPI 官方入门](https://fastapi.tiangolo.com/tutorial/first-steps/)。
