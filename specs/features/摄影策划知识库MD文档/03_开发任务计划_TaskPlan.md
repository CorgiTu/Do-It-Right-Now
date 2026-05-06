# 摄影策划知识库系统 — 开发任务路线图

本项目采取 TDD 与领域驱动设计思想。请 AI 助手严格按照以下任务顺序推进，**严禁跳跃执行**。

## 阶段一：核心基础设施打底 (Infrastructure)
- [ ] **Task-01**: 数据库模型建立。配置 SQLite，创建 `KnowledgeEntry` (含 structured_content), `KnowledgeImage` (含 file_path), 以及 `PlatformAuth` 表。
- [ ] **Task-02**: 内存任务管理器。实现 `ImportTaskManager` 用于暂存图片处理状态和结果。
- [x] **Task-03**: QR 二维码服务。基于 `Pillow` 和 `pyzbar` 实现轻量级二维码解码。

## 阶段二：三大外部服务攻坚 (Core Services)
- [ ] **Task-04**: 图片备份服务。实现 `ImageBackupService`，包含 aiohttp 下载网络图片至本地及移除功能。
- [ ] **Task-05**: Playwright 抓取服务。实现带 Cookie 注入的无头浏览器服务，通过 JS 注入提取小红书图片 URL，并妥善关闭 context 防止内存泄漏。
- [x] **Task-06**: AI 视觉分析服务。接入智谱 `glm-4v-flash` 多模态模型。包含本地图片的 Base64 转换逻辑，及严格的 JSON 解析容错处理。

## 阶段三：REST API 接口搭建 (API Layer)
- [ ] **Task-07**: 认证 API。实现 `/auth/platform-login` 和 `/auth/platform-status` 预登录机制。
- [ ] **Task-08**: 导入分析 API。实现 `/import/upload-image` 和 `/import/upload-link`，串联 QR、Scraper 和 AI 服务，返回 task_id。
- [ ] **Task-09**: 批量上传 API。实现 `/import/batch-upload` (基于 asyncio.gather 并发) 及状态查询接口。
- [ ] **Task-10**: 结果与备份 API。实现获取分析结果、确认保存 `/import/save`，以及图片下载/移除控制接口。
- [ ] **Task-11**: 知识库编辑 API。扩展 CRUD，支持单条内容的结构化更新及批量修改标签 `/knowledge-entries/batch-tags`。

## 阶段四：前端核心组件 (Frontend UI)
- [ ] **Task-12**: 封装 API Client。配置 Axios，集成 Zustand 状态管理，封装鉴权与导入接口。
- [ ] **Task-13**: 全局导入弹窗 (`ImportModal`)。包含登录状态检测、本地上传拖拽区、链接粘贴 Tab 及全局 Loading。
- [ ] **Task-14**: 批量进度与预览 (`BatchProgress` & `AnalysisPreview`)。实现单条/批量上传进度条，5大维度 JSON 折叠面板，以及图片下载状态按钮 (`ImageDownloadButton`)。

## 阶段五：页面集成与策划案引擎 (Integration)
- [ ] **Task-15**: 知识库主页。实现瀑布流展示，集成多选框、批量操作工具栏及条目编辑抽屉。
- [ ] **Task-16**: 策划案生成页面。输入主题词，优先提取本地图片 `file_path` 作为上下文，对接生成逻辑。
- [ ] **Task-17**: HTML 导出功能。在生成结果页，将 HTML 模板与图片转换为单文件 Blob 进行下载。
- [ ] **Task-18**: 全链路联调测试。