# 你为什么打不好铁拳8

48秒原创像素动画短片，1920×1080，24fps，H.264视频与AAC立体声音频。

剧情从乱抢回合、漏掉确反、不看回放三个习惯出发，让主角把练习重点从背连招转向判断时机。片尾任务是「今日只改一个错」。中文字幕已烧录在画面中，另附SRT。没有真人配音；音乐、动作音效和文字提示音均为程序合成。

## 文件

- `tekken8-pixel-lesson.mp4`：完整成片。
- `poster.jpg`：封面。
- `tekken8-pixel-lesson.srt`：独立字幕。
- `TREATMENT.md`：创作方案和分镜。
- `FACTS.md`：教学范围与表述检查。
- `CREDITS`：创作、工具与第三方字体许可说明。
- `src/`、`timeline.json`、`tools/`、`fonts/`：可修改工程。

## 重新制作

先按 https://github.com/lemomo-ai/lemo-opuscar 安装核心工具，以及Python的Pillow、NumPy、SciPy、SoundFile；系统需有FFmpeg、Node和Chromium。字体生成使用Noto Sans CJK字体，默认路径见 `tools/glyphs.py`；已有 `fonts/glyphs.json` 可直接供页面使用。

运行：

```sh
LEMO_OPUSCAR_HOME=/path/to/lemo-opuscar sh build.sh
```

若浏览器没有由Playwright安装，可设置 `PLAYWRIGHT_CHROME` 指向Chromium。渲染脚本生成画面、声音、字幕和封面；中间文件写入 `out/` 和 `audio/`。

## 已完成的检查

完整视频解码通过；48秒、1152帧、1080p/24fps；96个时间采样的32色索引与文字边界通过；九段字幕停留时长、音效节拍和两段短暂静音通过。最终音频约−14.1 LUFS，峰值−2.3 dBFS。
