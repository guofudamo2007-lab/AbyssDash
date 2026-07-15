# 🦈 深渊冲刺 (Abyss Dash) - 架构跃迁版 v7.0

> 一款基于 HTML5 原生 Canvas 的反重力深海动力学跑酷游戏。
> **单文件、零依赖、纯原生、现代系统级解耦架构、自带深海图鉴与皮肤系统。**

[![GitHub Pages](https://img.shields.io/badge/🎮主站试玩-GitHub_Pages-00ffff?style=for-the-badge)](https://guofudamo2007-lab.github.io/AbyssDash/)
[![Netlify](https://img.shields.io/badge/🚀备用节点-Netlify-33ffaa?style=for-the-badge)](https://cheerful-bienenstitch-28078d.netlify.app/)

## 🌊 核心特色玩法

* **多态外观系统 (Skin System)：** 内置 `SkinManager`，支持玩家自由切换代码原生绘制的赛博风【Neo Vector】与支持序列帧动画的【Cyber Shark】实体贴图。
* **沉浸式枢纽与图鉴 (Interactive Hub)：** 拥有完整的赛博风格主菜单界面与《深海图鉴》系统。即使处于待机菜单，底层引擎依旧在演算背景深海生态的浮动粒子与游鱼。
* **生态区域演进 (Biome System)：** 随着下潜深度的增加，无缝穿越【浅海】、【沉船区】、【海沟】与【黑暗区】四大生态。各区域拥有独立的危险系数与专属障碍物。
* **极速连击倍率 (Combo Multiplier)：** 连续精准吞噬发光小鱼可激活 `COMBO! x2` 极速状态，得分效率翻倍！受到碰撞将瞬间打断连击。
* **流体动力学操控：** 采用“按住下潜，松开上浮”的浮力模拟。角色随垂直运动速度引入 **Pitch 俯仰角自适应旋转矩阵**，操作反馈极具流体质感。
* **次世代视觉反馈：** 满怒触发【猩红冲刺 RUSH】——激活超高速镜头动态线条、无敌霸体、全屏暗礁碎裂特效及独立物理相机震荡 (Camera Shake)。

## 🛠️ 技术亮点与工程实践

本项目拒绝依赖任何第三方现代游戏引擎（如 Cocos/Egret），纯手写底层物理、逻辑状态、渲染管线与音频合成。在 v7.0 中，全面引入了现代游戏引擎的系统化设计思想，核心攻坚了以下工业级痛点：

| 工程痛点 | 产生的现象 | 解决方案与架构 |
| :--- | :--- | :--- |
| **面条代码与高耦合** | 随着功能增加，主循环异常臃肿，逻辑、输入、渲染强耦合，极难维护。 | **系统级解耦架构 (System-Based Architecture)：** 彻底拆分主循环。将功能划分为 `EntityManager`(实体管理)、`CollisionSystem`(碰撞)、`ProgressionSystem`(进程) 与 `InputSystem`(输入)，实现了高内聚低耦合的现代架构。 |
| **多态外观渲染扩展** | 传统的纯 Canvas 绘制逻辑写死在渲染管线中，无法支持外部贴图和动画。 | **双引擎渲染管线 (Dual-Pipeline Rendering)：** 引入皮肤配置树。渲染器自动兼容 `ctx.bezierCurveTo` 的矢量绘制与 `ctx.drawImage` 的精灵图 (Sprite) 序列帧裁剪动画，并巧妙运用 `ctx.filter` 为贴图赋予动态受击/冲刺滤镜。 |
| **状态机生命周期死锁** | 游戏处于菜单或结算界面时，主循环停止导致背景冻结。 | **独立状态渲染解耦 (Decoupled State Machine)：** 剥离出 `updateMenuLogic` 与主 `updateLogic`。在 `MENU` 状态下，系统只演算背景游鱼，实现动态待机画面。 |
| **DOM 动画重置失效** | 高频触发 Combo 连击或区域切换词时，CSS 过渡动画无法二次播放。 | **强制同步重排 (Forced Reflow)：** 在移除和添加动画类名之间，精准插入 `void element.offsetWidth` 触发浏览器强制重绘，实现 DOM 动画的无缝重置。 |
| **视口跨端极光缩放** | 游戏在面对全面屏手机、iPad 等多尺寸设备时，UI 极易错位。 | **高级容器查询架构 (Container Query Units)：** 将最外层声明为 size 容器，UI 抛弃 px 和 vw，全量改用 `cqw` / `cqh` 相对单位，实现完美的长宽比动态保真。 |

## 💻 技术栈

* **文本视觉：** 远程无缝挂载 Google Web Fonts 工业级赛博风格字体（Orbitron / Rajdhani）。
* **渲染层：** HTML5 `<canvas>` 2D API 纯代码绘制特效（UI容器响应、双重矩阵相机震屏、序列帧精灵图裁剪、滤镜渲染、刚体俯仰角流体动捕）。
* **音频引擎：** Web Audio API（基于代码手搓合成器底层，**无需外部声音文件，纯代码实时生成环境低频、方波爆炸声与正弦波拾取音**）。

## 📂 如何运行

**方案一：在线体验 (双节点支持)**
* 🌐 主站：[GitHub Pages 部署版](https://guofudamo2007-lab.github.io/AbyssDash/)
* 🚀 备用：[Netlify 部署版](https://cheerful-bienenstitch-28078d.netlify.app/)

**方案二：本地运行**
1. 克隆本项目或直接下载 `index.html`。
2. 无需 Node.js 或构建环境，直接双击用任意现代 PC/移动端浏览器打开 `index.html` 即可运行。

## 🔄 迭代日志

* `v7.0` (终极重构版)：**底层架构与外观大满贯版**。重构为系统级架构（Input, Collision, Progression, Entity解耦）；实装 `SkinManager` 支持序列帧精灵图贴图与 CSS 滤镜特效系统。
* `v6.0`：实装支持物理演算的动态主菜单、炫酷按钮涟漪响应与模块化的《深海图鉴》系统。
* `v5.0`：引入四大深海区域动态切换系统与 3 连击 Combo 倍率积分机制；重构 DOM 动画强制重绘触发队列。
* `v4.6`：自研基于容器查询单位（`cqw`/`cqh`）的全视口无损适配方案；实时深度色域变化与全屏暗角；全手搓鲨鱼物理俯仰角度控制。
* `v4.0`：重磅推出【道具与危机系统】。手搓磁铁引力场与追踪水雷 AI。
