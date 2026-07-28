# Abyss Dash 资源目录

所有游戏资源统一放在 `assets` 下，文件名使用小写英文与连字符，避免日期名、空格和含义不明的版本号。

## 目录说明

- `art/characters`：游戏运行时使用的角色精灵图。
- `art/bosses`：游戏运行时使用的 Boss 精灵图。
- `art/references`：AI 生成或录制的原始参考视频，不由游戏直接加载。
- `art/workfiles`：抽帧、抠图和生成过程中的中间文件。
- `art/archive`：已被替换、仅用于回退对照的旧素材。
- `audio/music`：游戏运行时使用的音乐。
- `audio/references`：参考视频中分离出的音频，不由游戏直接加载。

## 运行时素材

| 文件 | 用途 |
| --- | --- |
| `art/characters/shark-default-spritesheet.png` | 默认鲨鱼动画 |
| `art/characters/shark-cyber-spritesheet.png` | 赛博鲨鱼动画 |
| `art/bosses/boss-octopus-spritesheet.png` | 章鱼 Boss 三帧动画 |
| `art/bosses/boss-submarine-spritesheet.png` | 潜艇 Boss 三帧动画 |
| `audio/music/boss-battle-beneath-the-crush.mp3` | Boss 战音乐 |

## 命名规则

- 角色：`角色名-外观-spritesheet.png`
- Boss：`boss-名称-spritesheet.png`
- 原始视频：`boss-名称-reference.mp4`
- 抽帧：`reference-frame-时间位置.png`
- 生成中间稿：`generation-序号-处理阶段.png`
- 旧版备份：在主文件名后加 `-previous`
