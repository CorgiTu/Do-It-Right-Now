# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作提供指导。

## 仓库结构

工作区包含两个相关项目：

- `SleepTracker-Clean/` — 当前活跃的干净版本（在此开发）
- `SleepTracker/` — 含 Android SDK 产物的旧版本，仅供参考
- `specs/` — 功能规格文档

## 开发命令

所有命令在 `SleepTracker-Clean/` 目录下执行：

```bash
npm install          # 安装依赖
npm start            # 启动 Expo 开发服务器（Metro bundler）
npm run android      # 在 Android 模拟器/设备上运行
npm run ios          # 在 iOS 模拟器上运行（仅 macOS）
npm run web          # 通过 Expo web 在浏览器中运行
```

### 构建 APK

```bash
# 云端构建（推荐，约 10-15 分钟）
eas build --platform android --profile preview

# 开发客户端构建（迭代更快）
eas build --platform android --profile development

# 本地构建（需要 Android Studio + 配置 ANDROID_HOME）
cd android && gradlew assembleRelease
# 输出路径：android/app/build/outputs/apk/release/app-release.apk
```

TypeScript 启用了严格模式（`noImplicitAny`、`strictNullChecks` 等），运行 `npx tsc --noEmit` 可在不构建的情况下进行类型检查。

## 架构说明

**入口文件：** `App.tsx` — 初始化所有服务、管理顶层页面状态、渲染底部导航栏。导航采用手动状态切换（`PageType` 联合类型），而非 React Navigation（该依赖已安装但尚未接入）。

**服务层**（`src/services/`）— 所有业务逻辑以单例形式存放于此：
- `RealmService` — 打开/关闭 Realm 数据库；必须在其他所有服务之前初始化
- `StorageService` — 对 `UserSettings`、`SleepTarget`、`SleepRecord` 进行 CRUD 操作
- `DataSyncService` — 协调从 `BandService` 和 `MiFitService` 拉取数据并合并结果
- `BandService` / `MiFitService` — 分别对接智能手环 SDK 和小米运动健康 API 的适配器
- `NotificationService` — 封装 `expo-notifications`，处理权限请求
- `ReminderService` — 根据作息目标调度/检查提醒，内部调用 `NotificationService`

**数据模型**（`src/models/index.ts`）— 同时定义了 Realm Schema 和 TypeScript 类型，涵盖 `UserSettings`、`SleepTarget`、`SleepRecord`、`Reminder`。所有 ID 为字符串（UUID）。`SleepTarget` 中的时间以 `"HH:MM"` 字符串存储；`SleepRecord` 中的实际时间戳为 `Date` 对象。

**页面**（`src/pages/`）— 每个页面均为独立组件：
- `OnboardingPage` — 首次启动时显示，直到 `UserSettings` 保存完成
- `TargetSettingsPage` — 设置起床/睡觉时间目标
- `StatisticsPage` — 通过 `react-native-chart-kit` 展示图表
- `SettingsPage` — 通知开关、用户名设置
- `ThemePage` — 主题选择器，通过 `onThemeChange` 回调通知 `App.tsx`

**主题** — 内置四种主题（`light`、`dark`、`blue`、`green`）。颜色映射定义在 `App.tsx:getThemeColors` 中。主题 ID 持久化存储于 `UserSettings.theme`。

**初始化顺序**（见 `App.tsx`）：
1. `RealmService.initialize()`
2. `StorageService.getUserSettings()` → 决定引导状态和主题
3. `NotificationService.initialize()` → 请求通知权限
4. `ReminderService.checkAndGenerateReminders()` → 仅在已授权通知且设置存在时执行
