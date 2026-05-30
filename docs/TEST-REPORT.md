# FileForma 功能测试报告

测试日期：2026-05-30  
对标基准：[iLovePDF](https://www.ilovepdf.com/)  
详细功能矩阵见 [FEATURE-MATRIX.md](./FEATURE-MATRIX.md)

## 测试环境

| 项目 | 值 |
|------|-----|
| 静态站点 | `https://fileforma.com` / 本地 `dist/` |
| 后端 API | `https://convert-studio-pdf-api.onrender.com` |
| 测试脚本 | `scripts/test-online-converters.py`、`scripts/test-browser-converters.mjs` |

## 服务端工具测试结果（24 项）

| 状态 | 数量 |
|------|------|
| 通过 | 23 |
| 跳过 | 1（PowerPoint to PDF，测试 fixture 过简） |
| 失败 | 0 |

全部通过的工具：HEIC/TIFF to JPG、Word/Excel to PDF、PDF to Word/JPG、Compress/Repair、Merge/Split/Remove/Extract/Organize、Rotate、Page numbers、Watermark、Crop、Edit、Redact、Sign、Compare、Protect、Unlock。

## 浏览器工具测试（11 项）

覆盖：PNG/JPG/WebP/AVIF 互转、Compress、Resize、Image to PDF、JPG to PDF。  
运行方式：`SITE_BASE=http://localhost:4173 npm run test:browser`（需 Playwright Chromium）。

## 与 iLovePDF 功能差距摘要

### 已对齐（核心 PDF 工具）

- Organize：Merge、Split、Organize、Remove、Extract
- Optimize：Compress、Repair
- Convert to PDF：Word、PowerPoint、Excel、JPG
- Convert from PDF：PDF to Word、PDF to JPG
- Edit：Rotate、Watermark、Page numbers、Crop、OCR、Compare、Redact、Sign
- Security：Unlock、Protect

### 简化实现（有工具但能力弱于 iLovePDF）

| 工具 | FileForma | iLovePDF |
|------|-----------|----------|
| PDF to Word | pdf2docx best-effort | 高保真转换 |
| Edit PDF | 文本叠加 | 完整可视化编辑器 |
| Redact PDF | 关键词搜索遮盖 | 可视化选区 |
| Sign PDF | 文字签名 | 电子签章流程 |
| Compare PDF | 文本 diff 报告 | 并排可视化对比 |
| Translate PDF | 文本提取 | AI 保版式翻译 |
| OCR PDF | Tesseract | 高级 OCR（Premium） |

### 尚未实现（iLovePDF 有、FileForma 无）

- PDF to PowerPoint / Excel
- HTML to PDF
- PDF to PDF/A
- PDF Forms（表单检测/填写）
- AI Summarizer
- Scan to PDF
- Workflows / Desktop / Mobile

### 图片工具（对标 iLoveIMG）

FileForma 已覆盖 HEIC、PNG/JPG/WebP/AVIF/TIFF 转换、压缩、缩放、转 PDF。缺口：GIF、SVG 专用工具。

## 建议下一批开发优先级

1. **PDF to PowerPoint / Excel** — 缩小 Convert from PDF 最大缺口
2. **HTML to PDF** — iLovePDF 常见入口工具
3. **Compare PDF 可视化** — 提升 Edit 类工具体验
4. **Redact/Sign 交互增强** — 从关键词/文字升级为可视化操作
5. **PowerPoint 测试 fixture** — 使用 python-pptx 生成有效 PPTX，保障测试覆盖

## 运行测试

```bash
npm run test:server
CONVERT_API_BASE=http://localhost:8000 npm run build
SITE_BASE=http://localhost:4173 npm run test:browser
```
