# FileForma 维护指南

本文档记录 FileForma 的维护优先级、工作流程，以及与 iLovePDF 的功能对标结论。默认采用**均衡推进**策略。

## 维护优先级

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P0 | Bug 修复 / 转换失败 | 保障线上 37 个工具可用 |
| P1 | SEO 博客内容 | 按 [content-calendar-6-months.md](../content-calendar-6-months.md) 每周 2 篇 |
| P2 | 文档与测试 | 保持 README、测试脚本跨平台可用 |
| P3 | 后端体验 | 冷启动提示、Render 套餐评估 |
| P4 | 新功能 | 按 [FEATURE-MATRIX.md](./FEATURE-MATRIX.md) 缺口优先级迭代 |

## 日常开发流程

### 前端改动

```bash
npm run build
npm run dev          # http://localhost:4173
npm run validate:blog
```

### 后端改动

```bash
cd backend && docker compose up --build   # http://localhost:8000
```

本地联调时指定 API 地址：

```bash
CONVERT_API_BASE=http://localhost:8000 npm run build
```

### 部署

推送到 `master` 后 Render 自动部署（见 [render.yaml](../render.yaml)）。

分支命名：`cursor/<描述>-f815`

## 测试

```bash
# 安装一次性测试依赖
npm install playwright-core --prefix .test_node --no-save
pip install pillow-heif pypdf python-docx Pillow --target .test_deps --upgrade

# 运行测试（可通过环境变量覆盖 URL）
API_BASE=https://convert-studio-pdf-api.onrender.com python3 scripts/test-online-converters.py
SITE_BASE=https://fileforma.com node scripts/test-browser-converters.mjs
```

## 博客发布

1. 在 `content/blog/en/` 创建 Markdown
2. `npm run validate:blog`
3. `npm run build` 并部署

规范见 [manus-skills/fileforma-blog-publisher/SKILL.md](../manus-skills/fileforma-blog-publisher/SKILL.md)

## 关键文件

| 职责 | 文件 |
|------|------|
| 工具定义 | [src/site-data.mjs](../src/site-data.mjs) |
| 页面模板 | [src/templates.mjs](../src/templates.mjs) |
| 前端逻辑 | [public/app.js](../public/app.js) |
| 后端 API | [backend/app/main.py](../backend/app/main.py) |
| 部署 | [render.yaml](../render.yaml) |

## 已知约束

- 任务状态存内存，API 重启后丢失
- Render 免费 Docker 服务会冷启动（30–60 秒）
- 部分工具为 best-effort（PDF→Word、OCR、翻译等）
- 单文件 50 MB、最多 5 文件、12 jobs/min/IP
