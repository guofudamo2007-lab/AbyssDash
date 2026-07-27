# 🦈 Abyss Dash (深渊冲刺) - Ultra HD

![Abyss Dash](https://img.shields.io/badge/Status-Active_Development-brightgreen.svg)
![Vanilla JS](https://img.shields.io/badge/Built_With-Vanilla_JS_&_Canvas-f0db4f.svg)

Abyss Dash 是一款主打**深海生存跑酷**与 **Roguelite 进化养成**的硬核网页游戏。完全基于原生 HTML5 Canvas 构建，零外部依赖，追求极致的性能优化与 60FPS 的丝滑心流体验。

## ✨ 核心特色 (Core Features)

### 🧬 Roguelite 基因突变系统 (Mutation System)
每一次深渊探索都是全新的旅程！吞噬深海发光鱼群积累 DNA，获取指数级提升的进化能力：
- ⚡ **液压鳍 (Hydraulic Fins)**：冲刺怒气获取加速。
- 🧲 **生物电磁 (Bio-Magnetism)**：大范围自动吸附鱼群。
- 🛡️ **深渊外壳 (Abyssal Plating)**：生成可抵御一次致命威胁的护盾。
- 💨 **流线型躯体 (Streamlined Body)**：全局基础游动速度提升。
- 💎 **贪婪巨口 (Golden Maw)**：吞噬得分倍率疯狂上涨。
- 🦖 **利维坦巨兽 (Leviathan Form)**：终极形态！体型翻倍，超长无敌冲刺，霸体碾碎一切普通礁石。

### 🦑 史诗级深海领主 (Epic Boss Fights)
当潜入足够深的深度，深海的真正主宰将会降临：
- **LV.1 巨型深海章鱼 (Giant Octopus)**：触手挥击，毒液喷吐。
- **LV.2 废弃幽灵潜艇 (Ghost Submarine)**：鱼雷轰炸，强力探照灯干扰。
- **LV.3 远古巨齿鲨 (Megalodon)**：终极掠食者对决，深海大漩涡。

### 🎨 原生代码绘制皮肤 (Code-Native Skins)
抛弃传统的外部图片贴图，游戏内置皮肤引擎完全由数学曲线（贝塞尔曲线、极坐标函数）实时演算绘制。
- **深海原型 (Classic Abyss)**：原生经典形态。
- **霓虹赛博 (Neo Vector)**：自带微型独立画布预览的故障风赛博机械装甲。
- **黄金之躯 (Golden Scale)**：高光闪烁的皇家变异体。

### 🎵 纯代码实时生成音效 (Procedural Audio)
绝不加载冗长的 MP3！利用浏览器内置 `AudioContext` 实时振荡器，纯代码演算生成：
- 深海环境底噪 (Ambient Noise)
- 冲刺高能电音 (Dash Synth)
- 吃鱼水滴声与领主警报音

## 🛠️ 技术栈与架构 (Tech Stack & Architecture)

- **Engine**: 纯原生 JS 面向对象架构 (OOP)，严格的 `GameEngine` 状态机。
- **Rendering**: 纯 HTML5 `<canvas>` 配合 `requestAnimationFrame`。
- **Physics**: 简易流体力学模型（浮力系统、水流阻力、Boids 群体跟随算法）。
- **Performance**:
  - **对象池 (Object Pooling)**: 严格限制同屏 300 个粒子的硬性上限，智能回收旧粒子，彻底防止内存泄漏与渲染雪崩。
  - **DOM 事件委托 (Event Delegation)**: 杜绝高频创建 UI 时产生的幽灵监听器。
- **Style**: Glassmorphism (毛玻璃质感 UI)，CSS3 硬件加速动画。

## 🕹️ 怎么玩 (How to Play)

1. 按住 **鼠标左键 / 空格键 / 触摸屏幕** 控制鲨鱼下潜，松开上浮。
2. 吃掉发光小鱼积累 DNA 与冲刺怒气。
3. 怒气满时自动触发 **RUSH 无敌冲刺**，期间可撞碎一切障碍！
4. 避开深海水雷与瘫痪水母。
5. 每次升级时，仔细抉择你的进化路线。

## 📝 开发者日志 (Dev Notes)

这不仅仅是一个游戏，更是一次关于 **Canvas 性能压榨** 与 **数值心流策划** 的深度实验。
*Enjoy the Abyss!*

---

## 🚀 核心迭代里程碑 (Changelog)

- **`v9.6` (Current) - 巨兽狂澜与视觉跃升**：彻底修复巨齿鲨 Boss 战断粮问题并引入 Boss 专属动态补给平衡机制，精简高频连击时的 UI 光污染并修复极端情况下的引擎渲染崩溃。利用自研 Python 抽帧算法将实拍视频重制为 24 帧超丝滑“普通鲨鱼”精灵图动画，显著提升深海探索的沉浸感。
- **`v9.5` - 窒息畸变 (Abyssal Contract)**：实装了极具挑战性的【深海契约】面板（包含热液失控、地磁逆转、基因衰变三大负面效果）与包含即时副作用的【诅咒突变】卡牌（深海盲区、水母共生），将高难度下的资源换取与博弈推向极致。
- **`v9.1` - 里程碑扩充**：新增 5 项基于变异与操作的高难度成就（万磁王、终极重炮等），实装护眼正弦波闪烁、无敌帧时停与深海尾气排雷机制。
- **`v9.0` - 进化深渊**：实装 Roguelite 突变系统（6大基因）、无敌帧机制与对象池性能优化。
- **新增**: 完整实装 Roguelite 基因突变系统，提供三选一升级面板与 6 种进阶能力（包含利维坦巨兽形态）。
- **新增**: 引入无敌帧缓冲（Grace Period）机制，彻底解决升级后“见光死”痛点。
- **优化**: 重构底层粒子渲染机制，引入 Object Pooling（对象池）与 300 粒子硬性上限，防渲染雪崩。
- **平衡**: 指数级调优经验值曲线 (EXP Curve)，放缓后期成长节奏。

### `v8.0` - Boss 战与成就大满贯版
- **新增**: 实装三大巨型 Boss 阶段与弹幕机制（章鱼/潜艇/暗影巨齿鲨）。
- **新增**: 新增 8 项成就勋章系统与置顶 Toast 解锁弹窗。
- **优化**: 加入游戏音量/音效 ⚙️ 滑动控制面板。

### `v7.0` - 系统级解耦
- **架构**: 重构为系统级解耦架构（Input, Collision, Progression, Entity 解耦）。
- **优化**: 实装 `SkinManager` 支持序列帧精灵图贴图与 CSS 滤镜特效系统。

### `v6.0` - 界面与图鉴
- **新增**: 实装支持物理演算的动态主菜单、炫酷按钮涟漪响应。
- **新增**: 模块化的《深海图鉴》系统 (Encyclopedia)。

### `v5.0` - 深度与连击
- **新增**: 引入四大深海区域动态切换系统。
- **新增**: 引入 3 连击 Combo 倍率积分机制。
- **优化**: 重构 DOM 动画强制重绘触发队列。

### `v3.5` - 视网膜适配
- **优化**: 引入 `window.devicePixelRatio` 彻底自适应视网膜高分屏。

### `v3.0` - OOP 重构起源
- **架构**: 底层代码 OOP（面向对象）完全重构。引入 Class 架构与生命周期引擎。
