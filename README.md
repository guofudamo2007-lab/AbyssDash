# 🦈 Abyss Dash / 深渊冲刺

![Version](https://img.shields.io/badge/version-v10.0.0-00d7ff)
![Status](https://img.shields.io/badge/status-active_development-19c37d)
![HTML5 Canvas](https://img.shields.io/badge/engine-HTML5_Canvas-f16529)
![Vanilla JavaScript](https://img.shields.io/badge/code-Vanilla_JavaScript-f7df1e)

一款以深海生存跑酷、Roguelite 进化和巨型 Boss 战为核心的单文件网页游戏。游戏使用原生 HTML、CSS 与 JavaScript 构建，无需打包工具。

> 当前版本：**v10.0.0「层渊迁航」**
> 阶段 6 记录日期：**2026-08-14**（最终发布验收待阶段 7）
> 在线游玩：<https://guofudamo2007-lab.github.io/AbyssDash/>

## v10.0.0 更新重点

- 四个深度区域各使用五张 WebP 背景循环滚动，正式 Boss 击败后通过地图门闸完成区域转场。
- 深度 300、800、1500 依次触发正式 Boss；演示 Boss 与正式进度、奖励和地图转场保持隔离。
- 普通路段与 Boss 路段共用 `FishDirector` 的刷鱼规则和 30 条鱼上限，`BossSystem` 不管理鱼群。
- 正式 Boss 战提供一个独立安全护盾，不把它描述为 Boss 专用鱼群补给。
- Boss 音乐在 Boss 入场移动前起奏，并覆盖暂停、恢复、击败、重开和返回菜单生命周期。
- `references`、`workfiles` 和 PNG/source 原稿不由运行时读取。

## 核心玩法

### 深海跑酷

- 按住鼠标左键、空格键或触摸屏幕控制鲨鱼下潜，松开后上浮。
- 吞噬发光鱼积累 DNA 与 RUSH 怒气。
- 怒气充满后进入无敌冲刺，可破坏普通障碍。
- 随深度进入浅海、沉船区、海沟与黑暗深渊四个区域。

### Roguelite 突变

升级时从三项能力中选择一项：

- 液压鳍：缩短冲刺冷却。
- 生物电磁：扩大鱼群吸附范围。
- 深渊外壳：获得一次伤害抵消。
- 流线型躯干：提升基础速度。
- 贪婪巨口：提高吞噬得分。
- 利维坦巨兽：扩大体型并强化冲刺。
- 深海盲区、水母共生等高风险变异。

### 三阶段 Boss

| 深度节点 | Boss | 主要攻击 |
| --- | --- | --- |
| 300 | 巨型章鱼 | 墨汁弹、遮蔽干扰 |
| 800 | 深海潜艇 | 鱼雷攻击 |
| 1500 | 远古巨齿鲨 | 声波冲击、最终对决 |

正式 Boss 战会生成一个独立安全护盾；鱼群仍由 `FishDirector` 统一管理，`BossSystem` 不负责鱼群生成。

### 皮肤与成就

- 代码原生的 Neo Vector 鲨鱼。
- 普通鲨鱼与机器鲨鱼序列帧皮肤。
- 13 项深度、操作、Boss 与隐藏成就。
- 本地保存最高分、皮肤、音量、设置、教程和成就进度。

## 隐藏上帝模式

在主菜单连续点击标题旁的鲨鱼图标：

1. 鲨鱼进入冲刺状态。
2. 解锁隐藏成就。
3. 设置菜单出现“上帝模式”，不会自动跳转。
4. 开启后可选择无敌，并在游戏中按 `1` / `2` / `3` 召唤 Boss。

该功能用于演示和测试，不影响普通游玩流程。

## 运行方式

推荐使用本地 HTTP 服务运行，避免浏览器阻止 `file:///` 页面：

```bash
python -m http.server 8000
```

然后访问：

```text
http://127.0.0.1:8000/
```

游戏推荐横屏运行。

## 项目结构

```text
AbyssDash/
├─ index.html
├─ README.md
├─ DEVELOPMENT_PLAN_v9.9.0.md
├─ LUNA_V10_EXECUTION_PLAN.md
├─ RELEASE_REPORT_v10.0.0.md
├─ BASELINE_REPORT_v9.8.0.md
├─ STAGE1_REPORT_v9.9.0.md
├─ STAGE2_REPORT_v9.9.0.md
├─ QA_CHECKLIST.md
├─ tests/
└─ assets/
   ├─ README.md
   ├─ art/
   │  ├─ characters/   # 角色运行精灵
   │  ├─ bosses/       # Boss 运行精灵
   │  ├─ references/   # 原始参考视频
   │  ├─ workfiles/    # 抽帧与生成中间稿
   │  └─ archive/      # 被替换的旧素材
   └─ audio/
      ├─ music/        # 游戏音乐
      └─ references/   # 参考音频
```

资源命名和用途详见 [`assets/README.md`](assets/README.md)。

## 技术结构

- `GameEngine`：游戏状态和主循环。
- `Renderer`：Canvas 场景、区域和特效渲染。
- `BossSystem`：Boss 入场、攻击、正式安全护盾与音乐状态。
- `FishDirector`：普通路段与 Boss 路段的统一鱼群生成、上限和节奏。
- `MutationSystem`：升级选择与能力修正。
- `SkinManager`：代码皮肤与序列帧皮肤。
- `InputSystem`、`CollisionSystem`、`EntityManager`、`ProgressionSystem`：输入、碰撞、实体与成长逻辑。
- `AudioManager`：Web Audio 音效与 Boss 战音乐。

## 版本记录

### v10.0.0 — 层渊迁航（2026-08-14，阶段 6 记录）

- 完成四区五屏运行背景、正式 Boss 后门闸转场和深度语义回归。
- 统一普通鱼与 Boss 路段的 `FishDirector` 规则，保留 30 条鱼上限与正式安全护盾。
- 完成 Boss 音乐先起奏、暂停恢复、击败和演示 Boss 生命周期自动化验证。
- 最终浏览器矩阵、人工听音和 30 分钟墙钟验收列入阶段 7，尚未宣称完成。

### v9.9.0 — 深渊长航（2026-08-01）

- 建立正常长局、Boss 节点、重开清理和设置持久化回归。
- 完成横竖屏、触摸、高缩放、焦点和 Boss 血条适配。
- 修复后期连续冲刺时的鱼群断档。
- 进入局后反馈、音频生命周期和 30 分钟耐久收尾。

### v9.8.0 — 深渊回响（2026-07-28）

- 隔离 Boss 演示、正式进度和音乐生命周期。
- 升级鲨鱼彩蛋、上帝模式与数字键召唤限制。
- 增加三种 Boss 攻击预警并统一视觉层级。
- 完善键盘、缩放、触摸取消和画质资源上限。
- 建立 Boss、音频、彩蛋、无障碍和稳定性自动化回归。

### v9.7.0 — 深渊统御（2026-07-28）

- 重制章鱼和潜艇 Boss 动画素材。
- 新增教程、动态效果开关和画质模式。
- 整理完整资源目录并统一命名。

### v9.6.0 — 巨兽狂澜与视觉跃升

- 增加 Boss 动态补给与紧急护盾。
- 优化高频连击反馈与粒子渲染稳定性。
- 引入普通鲨鱼序列帧皮肤。

### v9.5.0 — 窒息畸变

- 加入深海契约和诅咒突变。
- 扩展高风险、高收益成长路线。

### v9.1.0 — 里程碑扩充

- 增加高难度特殊成就。
- 完善无敌帧和深海尾气排雷机制。

### v9.0.0 — 进化深渊

- 实装 Roguelite 突变系统。
- 引入对象池和升级后的保护时间。

### v8.0.0 — Boss 战与成就

- 实装章鱼、潜艇和巨齿鲨三阶段 Boss。
- 加入成就、音量和音效设置。

### v7.0.0 及更早

- 完成系统解耦、皮肤管理、图鉴、四区域、连击和高分屏适配。

## 验证范围

- JavaScript 主脚本语法和运行资源路径检查。
- 18 项 Node 自动化回归：正常进度、Boss 演示隔离、音频生命周期、设置持久化、响应式输入、鱼群节奏、资源完整性等。
- 本地 HTTP 环境下的菜单、设置、教程、暂停恢复、三档画质、减少动态效果、三次正式 Boss 转场和演示 Boss 检查。
- 实体触摸设备、真实高倍率缩放、30 分钟墙钟游玩和人工听音仍保留为人工验收项。

---

在深渊里，速度只是开始；真正决定你能走多远的是进化。
