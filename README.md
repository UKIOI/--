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

- `content/game-config.json`：运行时数值与内容单一来源。`build_config.py` 仅用于从初始基线重新生成，调平衡应直接修改 JSON。
- `frontend/src/game/engine.ts`：命令、重力、战斗、经济、调度与确定性 xorshift32 状态。
- `frontend/src/game/systems/spatial.ts`：空间桶与射线 AABB 查询。
- `frontend/src/game/render/`：程序绘图与音效，不参与模拟确定性。
- `frontend/src/game/persistence.ts`：串行保存、IndexedDB 副本与冲突保护。
- `backend/app/`：配置校验、API、Pydantic 快照、SQLite 事务。
- `data/warwall.sqlite3`：首次请求自动创建，可通过 `WARWALL_DB` 环境变量改到测试数据库。不要提交数据库。

开发模式在底部提供敌人 / Boss 生成、强化和结算测试入口，生产构建不显示。性能面板显示实际 RAF 频率和每帧模拟耗时。八类建筑可直接从正常建筑栏验证。

存档是单槽，覆盖新局前提示并保留浏览器备份；读档总是暂停。不同 runId 或 revision 冲突需要显式选择。版本不兼容保留并支持导出 JSON，不自动迁移。

## 验收记录与限制

具体执行结果见 [docs/acceptance.md](docs/acceptance.md)。未完成的人工试玩、真实集显设备性能与浏览器覆盖会明确标注；自动化测试通过不等同于 PRD 全部人工验收通过。

技术文档参考：[Vite 官方入门](https://vite.dev/guide/)、[FastAPI 官方入门](https://fastapi.tiangolo.com/tutorial/first-steps/)。
