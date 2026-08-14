# Abyss Dash v10.0.0「层渊迁航」Luna 执行手册

> 文档用途：交给低成本执行模型 Luna，按机械步骤安全收口当前工作树并完成下一版升级。
> 仓库唯一有效路径：`D:\游戏设计\AbyssDash`
> 基线日期：2026-08-14（Asia/Tokyo）
> 目标版本：`v10.0.0「层渊迁航」` / `LAYERED DESCENT`
> 执行方式：一次只执行一个阶段；每阶段结束必须停下汇报，等待用户说“继续阶段 N”。

## 0. 给 Luna 的启动指令

将下面文字原样交给 Luna：

```text
工作目录是 D:\游戏设计\AbyssDash。
请完整阅读 LUNA_V10_EXECUTION_PLAN.md，然后只执行“阶段 0：基线保护与分支确认”。
不要提前做阶段 1，不要改游戏代码，不要删除、移动、清理、暂存、提交或推送任何文件。
阶段 0 完成后，严格使用文档规定的汇报模板报告并停止，等待我说“继续阶段 1”。
遇到任何停机条件立即停止，不要自行猜测或扩大范围。
```

后续每次只发：

```text
继续执行 LUNA_V10_EXECUTION_PLAN.md 的阶段 N。只做该阶段，完成门禁后汇报并停止。
```

## 1. 总目标

把当前已经存在、但尚未提交的四区域背景、障碍美术、地图切换与 `FishDirector` 改动收口为一个可验证的 v10.0.0，同时完成以下纠偏：

1. Boss 和普通路段使用完全相同的刷鱼间隔、上限、位置和移动规则。
2. 不恢复 `bossSupply`、`deliverSupply`、Boss 专用鱼群或巨齿鲨 40 帧专用补给。
3. 正式 Boss 可以保留一个独立的一次性安全护盾，但它不得生成鱼、不得用于演示 Boss。
4. 四区域背景与四类障碍美术进入运行时，并保留代码绘制降级路径。
5. 正式 Boss 击败后切换地图；演示 Boss 不切图、不污染正式进度。
6. Boss 音乐在 Boss 入场移动开始前只启动一次，暂停、重开和结束时不叠加。
7. 保留现有核心玩法、碰撞、存档、成就、契约、三 Boss、上帝模式和单文件运行方式。

本手册不能从逻辑上保证任何模型绝不犯错；它通过小阶段、白名单、测试门禁和强制停机，把错误限制在可发现、可审查的范围内。

## 2. 绝对规则

以下规则优先于后文所有实施细节：

1. 只在 `D:\游戏设计\AbyssDash` 工作。`D:\AbyssDash` 是旧目录，禁止访问或恢复。
2. 不运行 `git reset`、`git checkout --`、`git restore`、`git clean`、`git stash`、递归删除或批量移动。
3. 不运行 `git add .`、`git add -A`、`git commit -a` 或交互式 `git add -p`。
4. 不删除任何未跟踪文件；它们可能是用户的生成原稿、参考文件或工具。
5. 不修改 `.agents/`、`assets/art/references/`、`assets/art/workfiles/`、`assets/art/archive/`。
6. 不重新生成美术，不联网搜素材，不安装依赖，不接入打包器或框架。
7. 不把 MP4 直接接入游戏，不实现 H3 章鱼入场动画；该素材留待下一轮。
8. 不改变 `localStorage` 键名或现有存档读取方式。
9. 不改变 Boss HP、伤害、深度节点、碰撞箱、跑酷物理或分数公式，除非本手册明确要求。
10. 不格式化整个 `index.html`，不批量改换行符，不做无关重命名。
11. 不通过删除测试、弱化断言、捕获并忽略错误、屏蔽 `console.warn` 来获得绿灯。
12. 修改旧断言时，必须在同一个补丁中加入表达新契约的替代断言。
13. 静态测试通过不等于浏览器验收通过；不能混写成“全部完成”。
14. 没有浏览器能力、听音能力或 30 分钟墙钟测试能力时，明确写“未验证”并停机，禁止猜测结果。
15. 默认不提交、不推送、不开 PR。只有用户明确要求时，才执行阶段 8 的对应动作。

## 3. 当前基线：Luna 必须先理解，不能擅自“清理”

### 3.1 Git 与测试基线

- 当前分支：`codex/v9.9.0-release-finish`
- 当前 HEAD：`138d07b`，提交信息 `feat: add run summary and feedback panel`
- 已修改的跟踪文件：
  - `index.html`
  - `tests/boss-demo-isolation.test.js`
  - `tests/fish-pacing.test.js`
  - `tests/normal-progression.test.js`
  - `tests/source-integrity.test.js`
- 已存在的未跟踪测试：
  - `tests/background-loop.test.js`
  - `tests/boss-supply.test.js`
  - `tests/map-transition.test.js`
  - `tests/movement-readability.test.js`
- 当前自动化基线：18 个测试全部通过；输出含：
  - `SCRIPT_PARSE_OK`
  - `RUNTIME_ASSET_AUDIT_OK 29`
  - `tests 18`
  - `pass 18`
  - `fail 0`
- 当前 `index.html` 仍显示 v9.9.0；阶段 6 前禁止改版本号。

本计划文件自身可能显示为未跟踪文件，这是预期状态，不属于异常。

### 3.2 只能进入运行时的 24 个新资源

背景 20 个，尺寸都应为 `1672 × 941`、RGB、WebP：

```text
assets/art/backgrounds/background-shallow-sea-01-v1.webp
assets/art/backgrounds/background-shallow-sea-02-v1.webp
assets/art/backgrounds/background-shallow-sea-03-v1.webp
assets/art/backgrounds/background-shallow-sea-04-v1.webp
assets/art/backgrounds/background-shallow-sea-05-v1.webp
assets/art/backgrounds/background-shipwreck-01-v1.webp
assets/art/backgrounds/background-shipwreck-02-v1.webp
assets/art/backgrounds/background-shipwreck-03-v1.webp
assets/art/backgrounds/background-shipwreck-04-v1.webp
assets/art/backgrounds/background-shipwreck-05-v1.webp
assets/art/backgrounds/background-trench-01-v1.webp
assets/art/backgrounds/background-trench-02-v1.webp
assets/art/backgrounds/background-trench-03-v1.webp
assets/art/backgrounds/background-trench-04-v1.webp
assets/art/backgrounds/background-trench-05-v1.webp
assets/art/backgrounds/background-dark-abyss-01-v1.webp
assets/art/backgrounds/background-dark-abyss-02-v1.webp
assets/art/backgrounds/background-dark-abyss-03-v1.webp
assets/art/backgrounds/background-dark-abyss-04-v1.webp
assets/art/backgrounds/background-dark-abyss-05-v1.webp
```

障碍 4 个，均应为 RGBA WebP：

```text
assets/art/obstacles/boundary-wall-pixel-v1.webp
assets/art/obstacles/cargo-crate-pixel-v2.webp
assets/art/obstacles/hazard-mine-pixel-v1.webp
assets/art/obstacles/hazard-pillar-pixel-v1.webp
```

除上面 24 个 WebP 外，当前未跟踪的 PNG、参考帧、提示词、生成原稿、滚动中间稿和 `.agents/` 都不进入本版提交，也不能删除。

### 3.3 已确认的隐藏矛盾

这些问题必须按本手册解决，不能沿用旧测试假象：

1. 真实 `FishDirector.beginBoss()` 已是一条普通鱼起步，但 `normal-progression.test.js` 的假对象仍伪造 5 条 `bossSupply` 鱼和一个护盾。
2. `getFishSpawnPlan()` 仍保留巨齿鲨 40 帧分支，但真实 `FishDirector` 总是把 `bossType` 写死为 `null`，该分支运行时不可达。
3. README 和旧 QA 仍声称 Boss 有专用动态补给；这与“Boss 和普通刷鱼共用规则”冲突。
4. 文档写 30 条鱼上限，当前 `FishDirector` 内部却硬编码 24。
5. “紧急护盾”目前只存在于旧文档和测试桩，真实 Boss 代码没有生成它。
6. `Renderer.drawBoundaryWalls()` 已定义但没有调用；边界墙资源实际只在地图转场中使用。
7. Boss 音乐目前在入场移动结束后才播放，与既定“音乐先起奏、Boss 后入场”目标相反。

## 4. 通用命令与门禁

### 4.1 PowerShell 前置

每个 shell 步骤都先使用：

```powershell
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath 'D:\游戏设计\AbyssDash'
```

禁止假设 `node` 或 `python` 在 PATH。使用以下应用自带运行时：

```powershell
$nodeExe = 'C:\Users\34360\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$pythonExe = 'C:\Users\34360\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
if (-not (Test-Path -LiteralPath $nodeExe -PathType Leaf)) { throw 'Bundled Node missing' }
if (-not (Test-Path -LiteralPath $pythonExe -PathType Leaf)) { throw 'Bundled Python missing' }
```

### 4.2 全量静态测试命令

每个代码阶段结束都必须运行完整套件，不只运行单个测试：

```powershell
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath 'D:\游戏设计\AbyssDash'
$nodeExe = 'C:\Users\34360\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$testFiles = Get-ChildItem -LiteralPath tests -Filter '*.test.js' -File | Sort-Object Name | ForEach-Object FullName
if ($testFiles.Count -lt 18) { throw "Unexpected test count: $($testFiles.Count)" }
& $nodeExe --test $testFiles
if ($LASTEXITCODE -ne 0) { throw "Node tests failed with exit code $LASTEXITCODE" }
git diff --check
if ($LASTEXITCODE -ne 0) { throw 'git diff --check failed' }
```

通过标准：`fail 0`，且不缺少 `SCRIPT_PARSE_OK` 与 `RUNTIME_ASSET_AUDIT_OK 29`。后续如果测试总数增加，可以大于 18，不能少于 18。

### 4.3 每阶段修改范围检查

```powershell
git status --short
git diff --stat
git diff --name-only
git diff --check
```

如果出现本阶段白名单之外的新修改，立即停机；不要自己回滚，因为那可能覆盖用户文件。

## 5. 阶段 0：基线保护与分支确认

### 目标

确认 Luna 看见的工作树与本手册一致，并将后续工作放到 v10 分支。此阶段不改任何文件内容。

### 允许操作

- 只读查看文件、Git 状态、测试结果。
- 在用户已明确说“按计划执行”的前提下，从当前分支创建 `codex/v10.0.0-layered-descent`。

### 禁止操作

- 不编辑文件。
- 不暂存、不提交、不推送。
- 不清理未跟踪资源。

### 步骤

1. 验证路径、分支和 HEAD：

```powershell
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path -LiteralPath 'D:\游戏设计\AbyssDash').Path
if ($repo -ne 'D:\游戏设计\AbyssDash') { throw "Wrong repo: $repo" }
Set-Location -LiteralPath $repo
git branch --show-current
git rev-parse --short HEAD
git status --short
```

2. 检查核心基线文件存在：

```powershell
$required = @(
  'index.html',
  'tests/fish-pacing.test.js',
  'tests/boss-supply.test.js',
  'tests/map-transition.test.js',
  'tests/background-loop.test.js',
  'tests/movement-readability.test.js'
)
foreach ($path in $required) {
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing baseline file: $path" }
}
```

3. 运行第 4.2 节全量静态测试。基线不是 18/18 时停止。

4. 创建或确认目标分支：

```powershell
$current = git branch --show-current
if ($current -eq 'codex/v9.9.0-release-finish') {
  git switch -c codex/v10.0.0-layered-descent
  if ($LASTEXITCODE -ne 0) { throw 'Failed to create v10 branch' }
} elseif ($current -ne 'codex/v10.0.0-layered-descent') {
  throw "Unexpected branch: $current"
}
git branch --show-current
git status --short
```

5. 创建分支前后的修改和未跟踪路径必须相同；只允许分支名变化。

### 阶段 0 停机条件

- HEAD 不是 `138d07b`，且用户没有明确说明新基线。
- 当前分支既不是旧收口分支，也不是目标 v10 分支。
- 任何基线测试失败。
- 发现文件被删除、素材目录为空或状态中出现本手册未列出的新修改。

## 6. 阶段 1：统一真实刷鱼契约

### 目标

让 Boss 与普通路段真正共用同一刷鱼规则，并消除测试、代码、文档之间的特殊 Boss 鱼群残留。此阶段不实现护盾、不改美术和转场。

### 文件白名单

```text
index.html
tests/fish-pacing.test.js
tests/boss-supply.test.js
tests/normal-progression.test.js
tests/boss-readability.test.js
```

### 必须形成的代码形态

1. 在 `PACING` 中建立唯一常量：
   - `MAX_ACTIVE_FISH: 30`
   - `FISH_MIN_INTERVAL_TICKS: 24`
   - `FISH_SAFE_SPAWN_DISTANCE: 220`
2. 保留现有四区普通 `fishInterval`：浅海 54、沉船 48、海沟 66、黑暗 78。
3. RUSH 最短间隔仍为 48；黑暗区每第四轮允许 2 条小群。
4. `getFishSpawnPlan` 改为只接收正常规则需要的参数，例如：

```js
getFishSpawnPlan(profile, isDashing, frameCount)
```

5. 删除该函数中的 `bossType === 'megalodon'` 40 帧分支和 `!bossType` 特判。
6. `FishDirector.update()` 在普通和 Boss 状态下都调用同一个 `getFishSpawnPlan()`。
7. `FishDirector.beginBoss(type)`：
   - 清空旧鱼；
   - 调用同一个 `spawnSchool({ count: 1 })`；
   - 不添加 `bossSupply` 标记；
   - 不在鲨鱼旁瞬间出现；
   - 后续进入同一间隔、上限、位置和移动循环。
8. 所有 24/30 的鱼上限判断统一引用 `PACING.MAX_ACTIVE_FISH`，最终值为 30。
9. 所有安全距离统一引用 `PACING.FISH_SAFE_SPAWN_DISTANCE`，最终值为 220。
10. 不新增 `spawnBossSchool`、`updateBossSupply`、`deliverSupply`、`bossSupply` 或任何 Boss 专用鱼定时器。

### 测试修改要求

1. `tests/fish-pacing.test.js`：
   - 删除章鱼/巨齿鲨专用补给断言；
   - 保留四区间隔、RUSH 48 和黑暗区第四轮 2 条鱼；
   - 断言函数签名不再需要 `bossType`；
   - 断言 `FishDirector` 内不存在 Boss 专用鱼函数或标记。
2. `tests/boss-supply.test.js`：
   - Boss 入场恰好一条正常鱼；
   - `source === 'traversal'`；
   - `x >= shark.x + 220`；
   - `60 <= y <= baseHeight - 60`；
   - Boss 和普通模式运行相同 tick 后，鱼数量与生成节奏一致；
   - 预填 30 条活动鱼后不得超过 30。
3. `tests/normal-progression.test.js`：
   - 把伪造 5 条 `bossSupply` 鱼的测试桩改为只记录 `fishDirector.beginBoss(type)` 调用；
   - 该文件只测试 `BossSystem` 是否正确委托，不再伪造 `FishDirector` 的内部产物；
   - 暂时删除虚假的紧急护盾断言，真实护盾在阶段 2 独立测试。
4. `tests/boss-readability.test.js`：删除无效的 `BOSS_SUPPLY_INTERVAL_TICKS` 与 `BOSS_EMERGENCY_TICKS` 测试环境残留。

### 阶段 1 门禁

运行第 4.2 节全量测试，并额外运行：

```powershell
rg -n "bossSupply|spawnBossSchool|updateBossSupply|deliverSupply|BOSS_SUPPLY_INTERVAL_TICKS|BOSS_EMERGENCY_TICKS" index.html
rg -n "bossSupply|spawnBossSchool|updateBossSupply|deliverSupply|BOSS_SUPPLY_INTERVAL_TICKS|BOSS_EMERGENCY_TICKS" tests
```

预期：第一条（运行时代码）零命中。第二条若有命中，只允许是“这些旧实现不得存在”的负向断言；不得出现伪造字段、旧计时常量或提供专用鱼群的测试桩。若历史 Markdown 仍命中，不在本阶段改，阶段 6 处理。

### 阶段 1 禁止的“快速修法”

- 不得为了保留旧断言重新加 5 条鱼。
- 不得把 `bossType` 继续传入但写死成 `null`。
- 不得把上限文档改成 24；本轮保留原有 30 条上限。
- 不得只改测试而不删除运行时代码中的不可达特殊分支。

## 7. 阶段 2：独立的一次性正式 Boss 安全护盾

### 目标

恢复正式 Boss 的安全保障，但只恢复护盾，不恢复任何 Boss 专用鱼群架构。

### 文件白名单

```text
index.html
tests/normal-progression.test.js
tests/boss-demo-isolation.test.js
```

### 精确行为契约

在 `BossSystem` 中实现一个职责单一的方法，例如 `spawnBossSafetyShield()`：

1. 仅正式 Boss (`isDemo === false`) 可以生成。
2. 玩家已经有护盾时不生成。
3. 场上已有 `source: 'boss-safety'` 的护盾时不重复生成。
4. `powerups.length >= 5` 时不突破既有道具上限。
5. 生成恰好一个普通 `shield` 道具，建议字段：

```js
{
  x: renderer.baseWidth + 90,
  y: clamp(shark.y, 60, renderer.baseHeight - 60),
  radius: 14,
  type: 'shield',
  source: 'boss-safety'
}
```

6. 道具从右侧正常进入，不直接出现在鲨鱼身上。
7. 该方法不得读取或修改 `engine.fishes`。
8. 不显示 `SUPPLY CURRENT`，不新增鱼群提示。
9. 在 `spawnBoss()` 成功建立 `bossData` 后调用一次；不要放进每帧 `update()`。
10. 演示 Boss 不生成该护盾，从而不把演示资源带回正式流程。

### 必须新增或修改的断言

`tests/normal-progression.test.js` 至少覆盖：

- 正式章鱼 Boss 生成一个 `boss-safety` 护盾；
- 护盾位于屏幕右侧，且垂直位置在安全区域；
- `fishDirector.beginBoss('octopus')` 只调用一次；
- 玩家已有护盾时不生成；
- 已有 `boss-safety` 道具时不重复生成；
- 任何安全护盾路径都不会额外添加鱼。

`tests/boss-demo-isolation.test.js` 至少覆盖：

- 演示 Boss 不生成 `boss-safety` 护盾；
- 演示 Boss 击败后仍不切图、不加分、不解锁正式成就。

### 阶段 2 门禁

运行全量测试，然后检查：

```powershell
rg -n "boss-safety|spawnBossSafetyShield" index.html tests
rg -n "bossSupply|deliverSupply|SUPPLY CURRENT|EMERGENCY SUPPLY" index.html
rg -n "bossSupply|deliverSupply|SUPPLY CURRENT|EMERGENCY SUPPLY" tests
```

第一条必须有实现和测试命中；第二条（运行时代码）必须零命中。第三条若有命中，只允许是负向断言，不能是测试桩或正向期望。

## 8. 阶段 3：运行时美术边界与降级路径收口

### 目标

确认现有 20 张背景和 4 张障碍 WebP 是唯一新增运行资源；不重新做图，不改变碰撞。

### 文件白名单

```text
index.html
tests/source-integrity.test.js
tests/background-loop.test.js
assets/README.md
上述 24 个 WebP 文件（只读验证，不改像素）
```

### 步骤

1. 验证 WebP 尺寸与颜色模式：

```powershell
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath 'D:\游戏设计\AbyssDash'
$pythonExe = 'C:\Users\34360\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
& $pythonExe -c "from pathlib import Path; from PIL import Image; root=Path(r'D:\游戏设计\AbyssDash'); bg=sorted((root/'assets/art/backgrounds').glob('*-0?-v1.webp')); obs=sorted((root/'assets/art/obstacles').glob('*.webp')); assert len(bg)==20, len(bg); assert len(obs)==4, len(obs); assert all(Image.open(p).size==(1672,941) and Image.open(p).mode=='RGB' for p in bg); assert all(Image.open(p).mode=='RGBA' for p in obs); paths=bg+obs; [print(f'{p.relative_to(root)}\t{Image.open(p).size}\t{Image.open(p).mode}\t{p.stat().st_size}') for p in paths]"
if ($LASTEXITCODE -ne 0) { throw 'Asset dimension audit failed' }
```

2. 背景必须是四区各 5 张，全部唯一，并由 `ZONE_PROFILES` 引用。
3. 障碍资源必须由 `GAMEPLAY_ART` 引用：mine、crate、pillar、boundaryWall。
4. `source-integrity.test.js` 继续审计 29 个总运行资源，不得只检查文件存在而漏掉 HTML 引用。
5. 保留 `Image.onerror -> asset.failed = true` 和代码绘制 fallback。
6. `drawArtAsset()` 加载失败必须返回 `false`；调用方随后走现有 Canvas 绘制。
7. `Renderer.drawBoundaryWalls()` 当前未调用，删除这个死方法；不要把它接成永久上下边框，因为那会制造与碰撞箱不一致的假墙。
8. `boundaryWall` 资源继续只用于 `drawMapTransition()` 的门闸视觉。
9. 不改变 mine、crate、pillar 实体的 `x/y/width/height/radius`；只允许调整裁切或绘制缩放，且必须由浏览器截图证明必要。
10. 更新 `assets/README.md`：把四区背景和四个障碍 WebP 加入运行时素材说明，并明确 PNG/source/workfiles 不由运行时读取。

### 阶段 3 静态门禁

- 运行全量测试。
- `RUNTIME_ASSET_AUDIT_OK 29` 必须存在。
- 运行：

```powershell
rg -n "drawBoundaryWalls\(" index.html
```

预期零命中。

### 阶段 3 浏览器门禁

必须用 localhost，不使用 `file:///`：

```powershell
$ErrorActionPreference = 'Stop'
$pythonExe = 'C:\Users\34360\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
$server = Start-Process -FilePath $pythonExe -ArgumentList '-m','http.server','8000','--bind','127.0.0.1' -WorkingDirectory 'D:\游戏设计\AbyssDash' -WindowStyle Hidden -PassThru
$server.Id
```

打开 `http://127.0.0.1:8000/`，检查：

- Network 中 29 个运行资源均为成功响应，无 404。
- 控制台无 error；正常情况下也不应出现 `Gameplay art failed to load`。
- 浅海、沉船、海沟、黑暗区各观察至少 15 秒。
- 每区至少记录开始、滚动中、接近循环回绕三个画面。
- 背景没有空白帧、明显断层、突然缩放或错误区域串图。
- mine、crate、pillar 的图像与原碰撞范围视觉一致；不可为了好看改变碰撞箱。
- 任意一个视觉点未检查，阶段状态写“静态通过，视觉未完成”，不得写“完成”。

用启动命令返回的精确 PID 停止服务器；不能按进程名批量终止：

```powershell
Stop-Process -Id <精确PID>
```

## 9. 阶段 4：正式 Boss 后地图切换状态机

### 目标

把当前已有转场实现补齐为可验证状态机，不重做视觉设计。

### 文件白名单

```text
index.html
tests/map-transition.test.js
tests/boss-demo-isolation.test.js
tests/normal-progression.test.js
tests/movement-readability.test.js（仅在确有相关断言时）
```

### 行为契约

1. 所有区域和 Boss 节点都以深度为语义，不以得分为语义。
2. 将 `getZoneProfile(score)` 参数名改成 `depth`；只改语义命名，不改变阈值。
3. 将 `ProgressionSystem.updateZoneAndSpeed(score)` 参数名改成 `depth`；速度公式保持现状。
4. 正式 Boss 击败后：
   - 300：浅海 -> 沉船；
   - 800：沉船 -> 海沟；
   - 1500：海沟 -> 黑暗深渊。
5. 切图只能在关闭阶段完全遮住画面后提交；淡出前仍显示旧区域。
6. 转场期间：
   - `updateLogic()` 只更新转场，不更新伤害、生成或 Boss；
   - 清空障碍、水雷、水母、水流和旧道具；
   - 释放 `inputSystem.isPressing`；
   - 重置 `FishDirector`；
   - 不改变成就、分数或存档键。
7. 点击、触摸或空格可以跳过，并且同一次输入不能同时造成下潜。
8. `reduceMotion` 模式仍有可见的短暂遮挡与区域提交，但没有长动画。
9. 同一阈值已经解锁后，不得重复播放转场。
10. 演示 Boss 永远不调用 `startMapTransition()`。
11. 重开、回菜单和新局必须重置：
    - `unlockedZoneThreshold = 0`；
    - `zoneProfile = shallow`；
    - `mapTransition.active = false`；
    - `backgroundTravel = 0`。

### 测试要求

`tests/map-transition.test.js` 至少覆盖：

- 300、800、1500 三个正式阈值；
- closing -> holding -> opening -> idle 顺序；
- 旧图只在关屏完成后切换；
- 跳过路径只提交一次；
- `reduceMotion` 路径；
- 已解锁阈值拒绝重播；
- 输入释放、危险物清空、FishDirector 重置；
- 非法阈值不推进区域。

`tests/boss-demo-isolation.test.js` 保留并强化“演示 Boss 不切图”。

`tests/normal-progression.test.js` 验证新局重置四项状态，不要用测试桩伪造转场成功。

### 阶段 4 门禁

- 全量测试通过。
- 浏览器中用正式 Boss 路径检查三个转场。
- 为提高验收效率，可以只在浏览器控制台临时操作现有 `game` 对象来触发正式 Boss 和 `defeatBoss()`；禁止把调试语句写进仓库。
- 每个节点至少记录：Boss 击败前、关屏、目标区域打开后三个画面。
- 演示 Boss 结束后必须仍在原区域。

## 10. 阶段 5：Boss 音乐顺序与生命周期

### 目标

实现“音乐先起奏，Boss 后开始入场移动”，只调整状态顺序，不重混音、不替换音频。

### 文件白名单

```text
index.html
tests/audio-lifecycle.test.js
tests/normal-progression.test.js
tests/boss-demo-isolation.test.js
tests/boss-readability.test.js
```

### 行为契约

1. `spawnBoss()` 成功建立 `bossData` 后立即且只调用一次 `audio.playBossMusic()`。
2. 调用发生在任何后续 `BossSystem.update()` 推进入场位置之前。
3. 立即设置 `bossData.musicStarted = true`，防止进入 idle 时重复播放。
4. Boss 到达 `restX` 后只显示 `BOSS ENGAGED`，不再启动第二次音乐。
5. 正式与演示 Boss 都遵守同一音乐启动顺序。
6. Boss 击败后只停止一次；正式流程恢复环境音，演示流程也不能留下 Boss 音乐。
7. 游戏结束、重开、回菜单使用既有立即停止路径，不得恢复环境音到错误状态。
8. 暂停、失焦、恢复不重置曲目到开头，不叠加第二个播放实例。
9. 不改变 MP3 文件、音量倍率 `0.4` 或音效波形；如听音发现问题，先报告，不在此阶段扩大范围。

### 测试要求

- `spawnBoss()` 返回时，`boss-music:play` 已恰好出现一次。
- 连续执行入场 update 直到 idle 后，播放次数仍为一次。
- defeat、pause/resume、game over、restart 的现有生命周期断言继续通过。
- 测试 fake 必须提供真实使用到的 `playBossMusic` / `stopBossMusic`，不可通过空缺方法绕过路径。

### 阶段 5 门禁

- 全量测试通过。
- 浏览器控制台无音频 promise 错误之外的异常；如果浏览器自动播放策略阻止播放，记录精确错误和触发方式，不要吞掉错误。
- 人工听音至少覆盖：普通 Boss 入场、暂停恢复、Boss 击败、演示 Boss 结束、游戏结束。
- 没有扬声器/耳机条件时，报告“自动化通过，人工听音未完成”。

## 11. 阶段 6：版本、README、资源说明与发布记录

### 前置条件

阶段 1—5 的静态门禁全部通过，阶段 3—5 的浏览器门禁已经完成或被用户明确接受为待办。前置条件不满足时，禁止提前把页面显示成 v10.0.0。

### 文件白名单

```text
index.html（仅版本字段）
README.md
assets/README.md
QA_CHECKLIST.md
DEVELOPMENT_PLAN_v9.9.0.md（只允许顶部加归档指引，不重写历史记录）
tests/version-consistency.test.js
RELEASE_REPORT_v10.0.0.md（新建）
LUNA_V10_EXECUTION_PLAN.md（只允许追加执行结果，不重写规则）
```

### 版本字段

统一改为：

- HTML application version：`10.0.0`
- 页面标题：`深渊冲刺 (Abyss Dash) v10.0.0`
- 菜单标签：`v10.0.0 · LAYERED DESCENT`
- 中文名：`v10.0.0「层渊迁航」`
- README 徽章：`v10.0.0`
- 发布日期：使用实际完成发布验收的日期，不得预填未来日期。

### README 必须准确表达

1. 四区域各 5 屏滚动环境。
2. 正式 Boss 击败后的地图门闸转场。
3. Boss 与普通路段共用相同刷鱼规则和 30 条鱼上限。
4. 正式 Boss 有一个独立安全护盾；不要称为“Boss 专用鱼群补给”。
5. `FishDirector` 管理所有游戏内鱼群；`BossSystem` 不再管理鱼群。
6. 音乐在 Boss 入场前起奏。
7. references/workfiles/PNG 原稿不由运行时读取。

### 历史文档规则

- v9.8/v9.9 的历史记录可以保留当时事实。
- `DEVELOPMENT_PLAN_v9.9.0.md` 只在顶部加“已由 v10 计划接续”的链接，不批量勾选旧清单。
- 不把未完成的人工听音或墙钟测试写成已完成。

### 发布报告最低内容

`RELEASE_REPORT_v10.0.0.md` 必须分开记录：

- Git 基线与最终分支；
- 代码改动摘要；
- 纳入的 24 个新运行资源；
- Node 测试数量与结果；
- 浏览器尺寸和浏览器名称；
- 三次地图转场结果；
- 资源请求与控制台结果；
- 人工听音结果；
- 30 分钟墙钟结果；
- 明确的未验证项。

### 阶段 6 门禁

```powershell
rg -n "application-version|<title>|id=\"version-label\"" index.html
rg -n "version-v10\.0\.0|当前版本.*v10\.0\.0|v10\.0\.0.*层渊迁航" README.md
```

预期：第一条显示的三个运行时版本位置全部为 v10.0.0；第二条显示 README 徽章、当前版本和 v10 版本记录。README 历史版本章节允许保留 v9.9.0。

然后运行全量测试与 `git diff --check`。

## 12. 阶段 7：最终浏览器、长局与发布验收

### 12.1 浏览器尺寸矩阵

至少检查：

| 视口 | 用途 |
| --- | --- |
| 844 × 390 | 横屏触摸基线 |
| 390 × 844 | 竖屏提示与暂停 |
| 1280 × 720 | 主桌面验收 |
| 1920 × 1080 | 大屏布局 |
| 约 640 × 360 | 200% 等效高缩放 |

每个尺寸检查菜单、HUD、设置、暂停、Boss 血条和转场文字。不能只看启动页。

### 12.2 正常流程矩阵

- 深度 0 开局正常。
- 正式 300/800/1500 Boss 依次出现。
- 三次正式击败依次切换区域。
- 正式 Boss 只有安全护盾，没有专用鱼群。
- 演示 Boss 不切图、不保存击败、不解锁正式成就。
- 死亡、重开、回菜单不继承 Boss、投射物、转场或音频状态。
- 本地已有 `abyssDash*` 存档仍能读取。

### 12.3 视觉矩阵

- 四区背景均实际显示，不只是网络加载成功。
- 每区五屏循环无明显空洞或跳变。
- 背景与鲨鱼移动方向一致。
- RUSH 时鲨鱼前移，Boss 战时不漂移。
- mine/crate/pillar 清晰，碰撞公平。
- 转场门闸只在转场出现，不形成永久假墙。
- 关闭“减少动态效果”和开启该选项各检查一次转场。

### 12.4 30 分钟墙钟测试

不能用 72,000 tick 自动模拟代替。不要执行一次 30 分钟阻塞 sleep；保持浏览器运行并在 0、10、20、30 分钟分别记录：

- 当前区域、深度、状态；
- `fishes`、`particles`、`bubbles`、`obstacles`、`mines`、`jellyfishes` 数量；
- 是否出现音频叠加；
- 控制台 warning/error；
- 主观卡顿趋势；
- 页面失焦恢复后是否时间跳跃。

自动化 `LONG_RUN_STABILITY_SIMULATION_OK` 与墙钟结果必须分成两行报告。

### 12.5 最终通过定义

只有同时满足以下条件，才可写“v10 本地验收完成”：

- 全量 Node 测试 `fail 0`；
- `SCRIPT_PARSE_OK`；
- `RUNTIME_ASSET_AUDIT_OK 29`；
- `git diff --check` 无输出；
- localhost 无资源 404；
- 浏览器控制台无错误；
- 四区和三次正式转场已视觉检查；
- 演示 Boss 隔离已检查；
- 音频生命周期已听音；
- 30 分钟墙钟已实际完成。

任何一项缺失，必须写“部分验收”，列出缺失项。

## 13. 阶段 8：精确暂存、提交与远端动作

只有用户明确要求“提交”后才进入本阶段。

### 13.1 暂存前检查

```powershell
git status --short
git diff --check
git diff --name-only
```

禁止出现已删除文件。禁止出现 `.agents/`、references、workfiles 或 PNG 原稿被修改。

### 13.2 允许暂存的文本文件

只允许按实际修改情况显式暂存：

```text
index.html
README.md
assets/README.md
QA_CHECKLIST.md
DEVELOPMENT_PLAN_v9.9.0.md
LUNA_V10_EXECUTION_PLAN.md
RELEASE_REPORT_v10.0.0.md
tests/audio-lifecycle.test.js
tests/background-loop.test.js
tests/boss-demo-isolation.test.js
tests/boss-readability.test.js
tests/boss-supply.test.js
tests/fish-pacing.test.js
tests/map-transition.test.js
tests/movement-readability.test.js
tests/normal-progression.test.js
tests/source-integrity.test.js
tests/version-consistency.test.js
```

没有修改的文件不要为了凑清单而触碰。

### 13.3 允许暂存的二进制文件

只允许第 3.2 节列出的 24 个 WebP。不得暂存同目录 PNG。

可以使用 Git 路径规则，但暂存后必须人工核对清单：

```powershell
git add -- "assets/art/backgrounds/*-v1.webp" "assets/art/obstacles/*.webp"
git diff --cached --name-only
```

如果 staged 清单中出现任何 PNG、MP4、workfiles、references 或 `.agents/`，立即停机；不要自行 reset，报告用户处理。

### 13.4 提交前最后门禁

1. 再跑一次全量 Node 测试。
2. `git diff --cached --check` 必须通过。
3. `git diff --cached --stat` 必须由用户可审查。
4. `git status --short` 中未跟踪的生成原稿允许继续存在，不删除。

建议单一提交信息：

```text
feat: release Abyss Dash v10.0.0 layered descent
```

当前工作树的多个功能已经交织在同一个 `index.html` diff 中。禁止让 Luna 使用交互式分块暂存伪造多个提交；一个经过完整验收的提交比错误拆分更安全。

推送、PR、合并和部署必须分别得到明确授权。提交授权不等于推送授权。

## 14. 强制停机条件

任意阶段发生下列情况，Luna 必须原地停止并汇报：

1. 工作目录或分支与预期不符。
2. 基线测试在修改前失败。
3. 同一个测试连续修三次仍失败。
4. 需要修改本阶段白名单外文件才能继续。
5. 发现用户文件被锁定、删除、覆盖或意外移动。
6. 需要删除/重建素材、安装依赖或访问网络才能继续。
7. 资源尺寸、数量或名称不符合第 3.2 节。
8. 浏览器出现 404、脚本错误、持续 warning 或黑屏。
9. 只能通过放松测试才能通过。
10. 无法区分得分与深度、正式与演示、普通鱼与安全护盾的职责。
11. 没有能力执行要求的视觉、听音或墙钟验收。
12. staged 清单包含禁止文件。

停机后禁止使用更强的删除、重置或批量替换手段“自救”。

## 15. Luna 每阶段固定汇报模板

Luna 必须逐项填写，不得只说“已完成”：

```text
阶段：N - 阶段名称

实际修改文件：
- 路径 1
- 路径 2

关键行为变化：
- ...

执行的验证命令：
- 命令摘要

验证结果：
- Node：测试数 / pass / fail
- 脚本解析：通过或失败
- 资源审计：数量与结果
- git diff --check：通过或失败
- 浏览器：通过 / 未执行 / 失败
- 人工听音：通过 / 未执行 / 失败
- 墙钟测试：通过 / 未执行 / 失败

Git 状态：
- 当前分支
- 修改路径
- 未跟踪路径是否仍保持原样
- 是否暂存：必须为“否”，除非阶段 8 获得授权

未验证项与风险：
- 无，或逐项列出

阶段结论：
- 完成 / 部分完成 / 阻塞

已停止，等待用户授权进入下一阶段。
```

## 16. 最终验收速查表

| 契约 | 必须结果 |
| --- | --- |
| 工作目录 | 仅 `D:\游戏设计\AbyssDash` |
| 架构 | 单文件 Canvas，无新依赖 |
| 普通/Boss 鱼 | 同间隔、同上限、同位置、同移动 |
| 鱼上限 | 30，唯一常量 |
| 安全距离 | 220 px，唯一常量 |
| Boss 特殊鱼 | 不存在 |
| 正式安全护盾 | 每场最多一个，右侧正常进入 |
| 演示安全护盾 | 不生成 |
| 背景 | 4 区 × 5 张 WebP |
| 障碍 | 4 张 RGBA WebP |
| 美术失败 | Canvas fallback 仍可用 |
| 地图切换 | 仅正式 Boss，300/800/1500 |
| 演示 Boss | 不切图、不改正式进度 |
| 音乐 | 入场前启动一次，结束后不残留 |
| 存档 | 现有 `abyssDash*` 键兼容 |
| 静态测试 | 至少 18 个，fail 0 |
| 资源审计 | 29 个运行资源 |
| 浏览器 | 无 404、无 console error |
| 墙钟测试 | 真实 30 分钟，不能用模拟替代 |
| Git | 不清理原稿，不 `git add .` |

## 17. 执行记录

此节由 Luna 仅追加简短记录；不得修改前面的规则和验收标准。

```text
阶段 0：未执行
阶段 1：未执行
阶段 2：未执行
阶段 3：未执行
阶段 4：未执行
阶段 5：未执行
阶段 6：未执行
阶段 7：未执行
阶段 8：未授权
```

追加执行记录（2026-08-14）：

```text
阶段 0：已完成，基线与分支确认
阶段 1：已完成，正常流程与 Boss 节点
阶段 2：已完成，输入与响应式适配
阶段 3：已完成，运行资源与视觉素材接入
阶段 4：已完成，正式 Boss 地图转场
阶段 5：部分完成，自动化与浏览器通过，人工听音未完成
阶段 6：已完成，版本与发布记录收口；最终发布验收待阶段 7
阶段 7：未执行
阶段 8：未授权
```

追加执行记录（2026-08-14，阶段 7）：

```text
阶段 7：部分完成，浏览器尺寸矩阵、正式流程/视觉检查与真实 30 分钟墙钟通过；自动化与 localhost 资源门禁通过；人工听音、六项运行时数组计数和 640 × 360 裁切风险仍未闭合
阶段 8：未授权
```

追加执行记录（2026-08-14，阶段 8）：

```text
阶段 8：已授权；提交前全量 Node 测试通过，按白名单精确暂存并完成本地提交；未推送、未合并、未建 PR
```
