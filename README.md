# 🦈 深渊冲刺 (Abyss Dash) - 终极完全体 v8.5

> 一款基于 HTML5 原生 Canvas 的反重力深海动力学跑酷游戏。
> **单文件、零依赖、纯原生、现代系统级解耦架构、自带多重 Boss 战、成就系统与皮肤商城。**

[![GitHub Pages](https://img.shields.io/badge/🎮主站试玩-GitHub_Pages-00ffff?style=for-the-badge)](https://guofudamo2007-lab.github.io/AbyssDash/)
[![Netlify](https://img.shields.io/badge/🚀备用节点-Netlify-33ffaa?style=for-the-badge)](https://cheerful-bienenstitch-28078d.netlify.app/)

## 🌊 核心特色玩法

* **阶段性巨型 Boss 战 (Boss System)：** 随着下潜深度达到 300m、800m、1500m，深海远古霸主将被唤醒。玩家必须在中后期转攻为守，在闪避墨汁弹幕、高导鱼雷和超声波的同时，利用【猩红冲刺 RUSH】化身利刃，狠狠撞击巨怪！
* **深海生态集群系统 (Boids Algorithm)：** 在 v8.5 引擎底层引入经典的 Craig Reynolds Boids 鱼群智能算法，实现了小鱼群游时的分离、对齐与凝聚特性。当遭遇鲨鱼冲刺时，鱼群甚至会触发真实的“恐慌逃散”反馈，让海洋更加灵动。
* **洋流涡旋模拟 (Simplex Noise)：** 抛弃死板的线性漂浮，通过移植轻量级的 2D Simplex Noise 算法，令全屏幕的深海气泡、微粒和浮游生物呈现出极具随机感和平滑度的流体物理轨迹，完美模拟海底暗涌。
* **全新「和平逃脱」机制 (Pacifist Victory)：** 独创隐藏机制，如果你能在 Boss 战中纯靠走位存活 60 秒而不发动攻击，Boss 会因无聊主动撤退！这不仅是完成【和平主义者】成就的关键，更能获得双倍分数和“和平胜利”专属绿字爆屏提示。
* **勋章成就中心 (Achievement Manager)：** 内置 8 项硬核挑战成就（如【和平主义者】不吃小鱼前进 500m、【绝对防御】无伤通关、以及三大 Boss 的斩杀之证）。成就解锁时伴随极其精美的顶部金色 Toast 动画弹窗。
* **双模多态皮肤选单 (Skin Customization)：** 玩家可在主菜单自由切换矢量代码绘制的【Neo Vector】、普通像素风【Normal Shark】以及赛博朋克风【Cyber Shark】的高保真精灵序列帧贴图。
* **多维控制台 (Config Settings)：** 主菜单⚙️面板支持背景环境低音、Boss 战战歌（Music）和代码手搓合成器音效（SFX）的滑动调节，并实时进行 LocalStorage 状态同步。
* **极速连击倍率 (Combo Multiplier)：** 连续精准吞噬 3 条潜鱼即可激活 `COMBO! x2` 极速状态。受到任何实质伤害或瘫痪冲击将瞬间清空连击，极限拉满博弈心流。

## 🛠️ 技术亮点与工程实践

本项目拒绝依赖任何第三方游戏引擎（如 Cocos/Egret）或重量级前端框架，纯手写底层物理、碰撞、粒子与音频，在 v8.0 中完成了工程级代码结构进化：

| 工程痛点 | 产生的现象 | 解决方案与架构 |
| :--- | :--- | :--- |
| **Boss 战斗交互逻辑** | Boss 战需要独立于无尽跑酷之外的运动逻辑（例如停止深度累加、Boss 坐标追踪、特定的受击判定）。 | **面向状态的 Boss 驱动器：** 引入独立的状态子机。非冲刺状态撞击 Boss 触发反弹或护盾破碎；冲刺状态下撞击自动扣除 Boss 血量，并附加小范围强力震屏与大质量喷溅粒子。同时引入 Timer 超时状态机，实现隐藏的“和平逃脱”机制。 |
| **高频弹幕碰撞性能瓶颈** | 后期同屏存在大量墨汁、鱼雷、水母、水雷、障碍物和小鱼，逐一进行 AABB 碰撞检测会导致帧率严重骤降。 | **系统级解耦架构 (System Architecture)：** 彻底拆分主循环，将底层细分为 `EntityManager`、`CollisionSystem` 和 `ProgressionSystem`，极大优化了 CPU 逻辑分支，在 120Hz 下保持绝对零卡顿。 |
| **视觉张力不足** | 需要在玩家吃到大量奖励或者遭受严重打击时，给予极具冲击力的负面/狂暴视觉反馈。 | **赛博朋克色差特效 (Chromatic Aberration)：** 利用纯 Canvas API 中极具性价比的 `globalCompositeOperation = 'screen'` 颜色滤光叠加机制，实现无外部依赖情况下的屏幕撕裂、色彩剥离和重影震撼特效。 |
| **DOM 动画高频失效** | 顶部成就 Toast 或连击 Combo 提示在短时间内连续触发时，CSS 过渡动画无法二次播放。 | **强制同步重排 (Forced Reflow)：** 在移除和添加动画类名之间，精准插入 `void element.offsetWidth` 触发浏览器强制重绘，实现 DOM 动画的无缝重置。 |
| **多设备视口保真度** | 跨端在面对全面屏手机、iPad 等多尺寸设备时，游戏 UI 元素和字体易发生变形。 | **高级容器查询架构 (Container Query Units)：** 将最外层声明为 size 容器，UI 抛弃 px 和 vw，全量改用 `cqw` / `cqh` 相对单位进行缩放，实现完美的长宽比动态自适应。 |
| **多态皮肤滤镜兼容** | 当使用图片皮肤时，传统的 Canvas 涂色无法在不换图的前提下实现受击变红或麻痹变紫的效果。 | **渲染管线动态滤镜插值 (Canvas Filters)：** 在 `Renderer` 绘制精灵图时，根据状态实时插值 `sepia` (色相)、`hue-rotate` (色调旋转) 和 `saturate` (饱和度) 矩阵，实现 0 内存开销的高清状态变色。 |

## 💻 技术栈

* **视觉与美学：** 远程无缝挂载 Google Web Fonts 工业级赛博风格字体（Orbitron / Rajdhani），全面引入现代 Glassmorphism (毛玻璃) 和霓虹扫描线交互。
* **渲染层：** HTML5 `<canvas>` 2D API 纯代码绘制特效（UI 容器响应、双重矩阵相机震屏、序列帧精灵图裁剪、滤镜渲染、刚体俯仰角流体动捕）。
* **音频引擎：** Web Audio API（基于代码手搓合成器底层，**无需外部声音文件，纯代码实时生成环境低频、方波爆炸声与正弦波功能音**） + 独立 Boss 战高燃音轨。

## 📂 如何运行与资源放置

**方案一：在线体验 (双节点支持)**
* 🌐 主站：[GitHub Pages 部署版](https://guofudamo2007-lab.github.io/AbyssDash/)
* 🚀 备用：[Netlify 部署版](https://cheerful-bienenstitch-28078d.netlify.app/)

**方案二：本地运行**
1. 克隆本项目，并将皮肤贴图文件 `normal_shark.png`、`cyber_shark.png` 和背景乐 `Beneath_the_Crush.mp3` 放在 `index.html` 的**同级目录下**。
2. 无需 Node.js 或任何打包工具，直接双击用任意现代 PC 或移动端浏览器打开 `index.html` 即可运行。

## 🔄 迭代日志

* `v8.5`：**生态与物理升级版**。零依赖原生移植两大经典算法：基于 `Boids` 算法打造拥有动态群游避险本能的灵动鱼群系统；基于 `Simplex Noise` 生成极具自然感和平滑度的涡流洋流物理场；新增全局纯 Canvas API 方案实现冲刺/麻痹时的赛博朋克色差撕裂视觉反馈；修复了深海引擎底层死亡菜单画布不释放的隐藏死锁。
* `v8.0`：**UI 全面重构 & Boss 战大满贯版**。全面升级主菜单、模态框为玻璃拟态 (Glassmorphism) 与霓虹科幻风；实装三大巨型 Boss 阶段与弹幕机制（章鱼/潜艇/暗影巨齿鲨）；新增**“和平逃脱 (Pacifist Boss Victory)”**隐藏通关机制；新增 8 项成就勋章系统与置顶 Toast 解锁弹窗；加入音量滑动控制面板与无敌彩蛋。
* `v7.0`：重构为系统级解耦架构（Input, Collision, Progression, Entity 解耦）；实装 `SkinManager` 支持序列帧精灵图贴图与 CSS 滤镜特效系统。
* `v6.0`：实装支持物理演算的动态主菜单、炫酷按钮涟漪响应与模块化的《深海图鉴》系统。
* `v5.0`：引入四大深海区域动态切换系统与 3 连击 Combo 倍率积分机制；重构 DOM 动画强制重绘触发队列。
* `v3.5`：引入 `window.devicePixelRatio` 彻底自适应视网膜高分屏。
* `v3.0`：底层代码 OOP（面向对象）完全重构。引入 Class 架构与生命周期引擎。
