# FileForma vs iLovePDF 功能对标矩阵

对照基准：[iLovePDF](https://www.ilovepdf.com/)（2026-05）。  
图例：**有** = 已实现且可用 · **部分** = 有入口但能力简化 · **无** = 尚未实现

## Organize PDF

| 工具 | iLovePDF | FileForma | 备注 |
|------|----------|-----------|------|
| Merge PDF | 有 | **有** | FileForma 支持拖拽排序 |
| Split PDF | 有 | **有** | 按页码范围拆分 |
| Organize PDF | 有 | **有** | 重排/筛选页面 |
| Remove pages | 有 | **有** | |
| Extract pages | 有 | **有** | |

## Optimize PDF

| 工具 | iLovePDF | FileForma | 备注 |
|------|----------|-----------|------|
| Compress PDF | 有 | **有** | Ghostscript 压缩 |
| Repair PDF | 有 | **有** | 基础修复 |
| Compare PDF | 有 | **部分** | 文本 diff 报告，非并排可视化 |

## Convert to PDF

| 工具 | iLovePDF | FileForma | 备注 |
|------|----------|-----------|------|
| Word to PDF | 有 | **有** | LibreOffice |
| PowerPoint to PDF | 有 | **有** | LibreOffice |
| Excel to PDF | 有 | **有** | LibreOffice |
| JPG to PDF | 有 | **有** | 浏览器本地 |
| Image to PDF | 有 | **有** | 多图合并 |
| HTML to PDF | 有 | **无** | 需新增 |

## Convert from PDF

| 工具 | iLovePDF | FileForma | 备注 |
|------|----------|-----------|------|
| PDF to Word | 有 | **部分** | pdf2docx，复杂排版可能失真 |
| PDF to PowerPoint | 有 | **无** | 高优先级缺口 |
| PDF to Excel | 有 | **无** | 高优先级缺口 |
| PDF to JPG | 有 | **有** | ZIP 打包各页 |
| PDF to PDF/A | 有 | **无** | 归档标准 |
| Translate PDF | 有 (AI) | **部分** | 仅提取文本供翻译，非 AI 保版式 |

## Edit PDF

| 工具 | iLovePDF | FileForma | 备注 |
|------|----------|-----------|------|
| Edit PDF | 有 | **部分** | 文本叠加，非完整编辑器 |
| Rotate PDF | 有 | **有** | |
| Page numbers | 有 | **有** | |
| Watermark | 有 | **有** | 文字水印 |
| Crop PDF | 有 | **有** | 统一边距裁剪 |
| Redact PDF | 有 | **部分** | 关键词遮盖，非可视化选区 |
| Sign PDF | 有 | **部分** | 文字签名，非电子签章流程 |
| OCR PDF | 有 | **部分** | Tesseract，质量取决于扫描件 |
| PDF Forms | 有 | **无** | 表单检测/填写 |

## PDF Security

| 工具 | iLovePDF | FileForma | 备注 |
|------|----------|-----------|------|
| Unlock PDF | 有 | **有** | 需已知密码 |
| Protect PDF | 有 | **有** | 密码加密 |

## PDF Intelligence / 其他

| 工具 | iLovePDF | FileForma | 备注 |
|------|----------|-----------|------|
| AI Summarizer | 有 | **无** | |
| Scan to PDF | 有 | **无** | 移动端扫描 |
| Workflows | 有 | **无** | 自动化流水线 |
| Desktop / Mobile | 有 | **无** | 纯 Web |

## Image Tools（对标 iLoveIMG）

| 工具 | iLoveIMG | FileForma | 备注 |
|------|----------|-----------|------|
| HEIC to JPG | 有 | **有** | 服务端 |
| PNG/JPG/WebP 互转 | 有 | **有** | 浏览器本地 |
| AVIF to JPG | 有 | **有** | 浏览器 |
| TIFF to JPG | 有 | **有** | 服务端 |
| Compress / Resize | 有 | **有** | 浏览器 |
| GIF / SVG 工具 | 有 | **无** | |

## 覆盖率摘要

| 类别 | iLovePDF 核心工具数 | FileForma 有/部分 | 缺口 |
|------|---------------------|-------------------|------|
| Organize | 5 | 5 / 0 | 0 |
| Optimize | 3 | 2 / 1 | 可视化 Compare |
| Convert to PDF | 6 | 5 / 0 | HTML to PDF |
| Convert from PDF | 6 | 2 / 2 | PDF→PPT/Excel/PDF-A |
| Edit | 9 | 5 / 4 | Forms、完整编辑器 |
| Security | 2 | 2 / 0 | 0 |
| Intelligence | 3 | 0 / 1 | AI 摘要、Scan |
| Image | ~10 | 8 / 0 | GIF、SVG |

**总体：** FileForma 已覆盖 iLovePDF 约 **60%** 核心 PDF 工具名，其中约 **15%** 为简化实现。建议下一批功能迭代优先：**PDF to PowerPoint**、**PDF to Excel**、**HTML to PDF**、**Compare PDF 可视化**、**Redact/Sign 交互增强**。
