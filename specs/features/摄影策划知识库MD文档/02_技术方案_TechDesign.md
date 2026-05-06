没问题！前面的聊天记录确实太长了，翻起来很容易眼花。这份就是那三剑客中最长、也最核心的第二部分：02_技术方案_TechDesign.md。它已经包含了所有“防雷补丁”（轻量化识别、本地图片 Base64、多模态视觉模型修复、内存泄漏修复等）。  你直接把下面这个代码框里的全部内容复制，保存为 02_技术方案_TechDesign.md 即可：Markdown# 摄影策划知识库系统 — 技术方案 (V2 优化版)

## 1. 现有代码理解

### 1.1 项目结构
```text
backend/
├── app/
│   ├── api/
│   │   ├── knowledge_entries.py   # 知识库 CRUD 路由
│   │   ├── uploads.py             # 图片上传路由
│   │   └── ...
│   ├── crud.py                    # 数据库 CRUD 操作
│   ├── database.py                # SQLAlchemy 会话管理
│   ├── models.py                  # 数据库模型
│   ├── schemas/
│   │   └── knowledge.py           # Pydantic Schema
│   ├── services/
│   │   ├── ai_service.py          # AI 分类服务（智谱 GLM）
│   │   ├── scraper_service.py     # 网页抓取服务（Playwright）
│   │   ├── image_backup_service.py# 图片下载备份服务
│   │   └── qr_service.py          # 二维码识别服务
│   ├── main.py                    # 入口与静态目录挂载
│   └── config.py                  # 配置
1.2 核心机制与变更摘要核心机制：改用 Playwright 提取 JS 渲染后的动态图片 URL。支持 URL 引用 + 本地下载备份两种图片管理方式。AI 分析时优先使用本地备份图片，支持多模态上下文输入。2. 数据模型变更2.1 KnowledgeEntry 新增字段Pythonclass KnowledgeEntry(Base):
    # ... 现有字段 ...
    structured_content = Column(Text, nullable=True)  # JSON 格式，存储 AI 结构化分析内容
2.2 新增 PlatformAuth 模型存储平台登录凭证，用于爬虫绕过反爬虫墙（如小红书预登录）：Pythonclass PlatformAuth(Base):
    __tablename__ = "platform_auth"
    id = Column(Integer, primary_key=True, autoincrement=True)
    platform = Column(String(50), nullable=False, unique=True)
    cookies = Column(Text, nullable=False)  # JSON 格式
    login_at = Column(TIMESTAMP, server_default=func.now())
    expires_at = Column(TIMESTAMP, nullable=True)
    status = Column(String(20), default="active")
3. API 与路由设计3.1 静态资源路由挂载 (避坑关键点)在 app/main.py 初始化 FastAPI 时，必须挂载本地上传目录，否则前端请求图片会全部 404：Pythonfrom fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# 确保目录存在
os.makedirs("uploads/permanent/backups", exist_ok=True)
os.makedirs("uploads/temp", exist_ok=True)

# 挂载静态路由
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
3.2 接口列表方法路径说明POST/import/upload-image上传图片并自动识别 QR 码获取原帖POST/import/upload-link粘贴链接直接上传GET/import/analysis/{task_id}获取分析结果（预览）POST/import/save确认保存分析结果到知识库POST/auth/platform-login平台预登录POST/import/download-image下载原帖图片到本地备份4. 核心服务实现 (防雷重构版)4.1 轻量级 QR 码识别服务注意：废弃笨重的 opencv-python，改用极其轻量的 Pillow。Python# services/qr_service.py
import logging
from typing import Optional
from PIL import Image
from pyzbar import pyzbar

logger = logging.getLogger(__name__)

class QRService:
    def decode_qr_from_image(self, image_path: str) -> Optional[str]:
        try:
            # 使用 Pillow 读取图片
            img = Image.open(image_path)
            decoded_objects = pyzbar.decode(img)
            
            for obj in decoded_objects:
                if obj.type == "QRCODE":
                    url = obj.data.decode("utf-8")
                    logger.info(f"QR 码解码成功: {url}")
                    return url
            return None
        except Exception as e:
            logger.error(f"QR 码识别失败或文件不存在: {e}")
            return None

qr_service = QRService()
4.2 AI 分析服务（含本地图片 Base64 转换）注意：智谱多模态模型无法读取本地文件路径，必须转为 Base64。必须使用带 v 的视觉模型。Python# services/ai_service.py
import json
import base64
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

class AIService:
    # ... 初始化 client ...

    def _encode_image_to_base64(self, image_path: str) -> Optional[str]:
        """将本地图片转换为 Base64 字符串"""
        try:
            with open(image_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            # 简单起见统一声明为 jpeg，智谱可自动适应
            return f"data:image/jpeg;base64,{encoded_string}"
        except Exception as e:
            logger.error(f"本地图片读取失败: {e}")
            return None

    async def analyze_photography_post(self, images: List[str], original_title: Optional[str] = None, original_body: Optional[str] = None) -> dict:
        prompt = self._build_photography_analysis_prompt(original_title, original_body)
        messages = [{"role": "system", "content": "你是一个专业的摄影策划师。请严格按照用户要求的 JSON 格式返回分析结果，不要包含任何 markdown 代码块标记。"}]
        
        image_content = []
        for img in images[:3]: # 最多 3 张
            if img.startswith("http"):
                image_content.append({"type": "image_url", "image_url": {"url": img}})
            else:
                # 核心避坑：处理本地路径
                base64_data = self._encode_image_to_base64(img)
                if base64_data:
                    image_content.append({"type": "image_url", "image_url": {"url": base64_data}})

        if image_content:
            user_msg = [{"type": "text", "text": prompt}] + image_content
            messages.append({"role": "user", "content": user_msg})
        else:
            messages.append({"role": "user", "content": prompt})
        
        try:
            response = await self.client.chat.completions.create(
                model="glm-4v-flash", # 【修复】必须明确使用带 v 的视觉模型
                messages=messages,
                temperature=0.3,
            )
            return self._parse_photography_analysis(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"AI 调用失败: {e}")
            return self._get_default_analysis()

    def _parse_photography_analysis(self, content: str) -> dict:
        try:
            # 清理可能的 Markdown 标记
            cleaned = content.strip()
            if cleaned.startswith("```json"): cleaned = cleaned[7:]
            elif cleaned.startswith("```"): cleaned = cleaned[3:]
            if cleaned.endswith("```"): cleaned = cleaned[:-3]
            return json.loads(cleaned.strip())
        except Exception:
            return self._get_default_analysis()

    def _get_default_analysis(self) -> dict:
        return {
            "scene": {"location": "", "background": "", "spatial_layout": ""},
            "lighting": {"time_of_day": "", "light_type": "", "direction": ""},
            "person": {"clothing_style": "", "pose": "", "mood": ""},
            "composition": {"technique": "", "angle": "", "depth_of_field": ""},
            "color": {"dominant_color": "", "emotion": ""}
        }
4.3 Playwright 抓取服务 (防卡死提取)注意：禁止 page.click()，直接使用 JS 提取动态图片。必须彻底关闭 context 防止内存泄漏。Python# services/scraper_service.py 的核心片段
async def _scrape_xiaohongshu_with_playwright(self, url: str):
    # ... 初始化 context 等待 ...
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=15000)
        # 使用 JS 注入直接提取，防阻塞防拦截
        images = await page.evaluate("""() => {
            const images = [];
            document.querySelectorAll('img').forEach(img => {
                let src = img.src || img.getAttribute('data-src');
                if (src && src.startsWith('http') && !src.includes('icon') && !src.includes('avatar')) {
                    images.push(src);
                }
            });
            return [...new Set(images)];
        }""")
        # ... 提取标题和正文 ...
    finally:
        # 【修复】必须同时关闭 page 和 context，否则会导致后台内存泄漏溢出
        if 'page' in locals() and page:
            await page.close()
        if 'context' in locals() and context:
            await context.close()
5. 临时任务状态机(使用 ImportTaskManager 内存字典设计，用于暂存处理中的任务状态，由 uuid 生成 task_id，包含 processing/completed/failed 状态及过期清理机制)。6. 新增依赖 (轻量版)Plaintext# requirements.txt
fastapi>=0.100.0
uvicorn>=0.23.0
sqlmodel>=0.0.8
aiohttp>=3.8.5
zhipuai>=2.0.1
playwright>=1.37.0
Pillow>=10.0.0
pyzbar>=0.1.9
(注意系统需安装 zbar 基础库，Windows 安装 pyzbar 时会自动自带对应的 DLL 文件)。