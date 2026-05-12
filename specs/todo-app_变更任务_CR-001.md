# 变更任务计划 — CR-001: 多主题切换与强调色优化

> 基于 `todo-app_任务规划.md`（如果存在则遵循相同规范）
> 变更类型：扩展
> 对应 AC：AC-024, AC-025, AC-026, AC-027, AC-028, AC-029, AC-030

---

## 任务概览

本变更计划涵盖 6 个增量任务，按依赖关系排序执行。核心工作：
1. 创建主题色板配置和类型定义
2. 实现主题状态管理 Store
3. 更新全局样式变量体系
4. 创建主题切换 UI 组件
5. 更新组件强调色样式
6. 回归验证

---

## 增量任务清单

### T-024: 主题色板配置与类型定义

**状态**: [x] 已完成
**优先级**: P0（基础依赖）
**对应 AC**: AC-024
**对应技术方案**: §7.5 主题色板定义
**前置依赖**: 无

#### 验证标准 (TDD RED)
```typescript
// themes.ts 必须导出以下接口和数据
import type { ThemeColors } from './types';

// themes.ts 必须包含 3 个预设主题
export const themes: ThemeColors[] = [
  // enhanced-morandi, bright, dark
];

// themes.ts 必须导出默认主题 ID
export const DEFAULT_THEME_ID = 'enhanced-morandi';

// themes.ts 必须提供按 ID 查找主题的函数
export function getThemeById(id: string): ThemeColors | undefined;
```

#### 通俗解释
定义主题的 TypeScript 类型和 3 套预设配色方案（增强莫兰迪、明亮、深色）。这是整个主题系统的基础数据，后续所有任务都依赖它。

#### 具体操作
1. 创建 `src/renderer/config/themes.ts`
2. 定义 `ThemeColors` 接口（技术方案 §7.5）
3. 定义 3 套主题的色板数据
4. 导出 `themes` 数组、`DEFAULT_THEME_ID`、`getThemeById` 函数
5. 创建 `src/renderer/config/types.ts`（如果不存在）导出类型

---

### T-025: 主题状态管理 Store

**状态**: [x] 已完成
**优先级**: P0
**对应 AC**: AC-025, AC-026, AC-027
**对应技术方案**: §6.4 主题系统方案
**前置依赖**: T-024

#### 验证标准 (TDD RED)
```typescript
// themeStore.test.ts

describe('themeStore', () => {
  it('初始化时使用默认主题', () => {
    const store = useThemeStore.getState();
    expect(store.currentThemeId).toBe('enhanced-morandi');
  });

  it('从 localStorage 读取已保存的主题', () => {
    localStorage.setItem('todo-app-theme', 'dark');
    // 重新初始化 store
    expect(useThemeStore.getState().currentThemeId).toBe('dark');
  });

  it('切换主题并保存到 localStorage', () => {
    const store = useThemeStore.getState();
    store.switchTheme('bright');
    expect(store.currentThemeId).toBe('bright');
    expect(localStorage.getItem('todo-app-theme')).toBe('bright');
  });

  it('切换主题时应用 CSS 变量到 document root', () => {
    useThemeStore.getState().switchTheme('dark');
    const root = document.documentElement;
    expect(getComputedStyle(root).getPropertyValue('--color-accent')).toBe('#4da6ff');
  });
});
```

#### 通俗解释
创建 Zustand Store 管理当前主题：应用启动时读取 localStorage 中的主题（如果有），没有则用默认主题。提供 `switchTheme()` 方法，切换主题时同时更新 CSS 变量到 `document.documentElement`，这样整个页面颜色立即生效。

#### 具体操作
1. 创建 `src/renderer/store/themeStore.ts`
2. 定义 Zustand Store 包含：
   - `currentThemeId: string` — 当前主题 ID
   - `switchTheme(themeId: string)` — 切换主题并持久化
   - `applyTheme()` — 内部函数，将主题色板应用到 CSS 变量
3. 初始化时读取 `localStorage.getItem('todo-app-theme')`
4. 使用 `T-024` 的 `getThemeById` 获取色板数据
5. 创建 `themeStore.test.ts` 单元测试

---

### T-026: 全局样式变量体系更新

**状态**: [x] 已完成
**优先级**: P0
**对应 AC**: AC-028, AC-029, AC-030
**对应技术方案**: §7.5 全局样式更新
**前置依赖**: T-024

#### 验证标准 (TDD RED)
```css
/* globals.css 必须包含以下 CSS 变量定义 */
:root {
  --color-bg: #f8f7f4;
  --color-bg-alt: #f2f1ee;
  --color-text: #5a5a5a;
  --color-text-light: #9a9a9a;
  --color-border: #e8e6e1;
  --color-shadow: rgba(0, 0, 0, 0.06);
  --color-hover: #f0eeea;
  --color-accent: #7a9ba8;       /* 新增 */
  --color-accent-hover: #6b8a97; /* 新增 */
  --color-accent-light: #c5d9e2; /* 新增 */
}

/* 复选框必须使用 accent 变量 */
input[type="checkbox"]:checked {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
}

/* 输入框聚焦必须使用 accent 变量 */
input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent-light);
}
```

#### 通俗解释
将全局样式中的 CSS 变量从 `--color-morandi-*` 重命名为通用的 `--color-*`，并新增 3 个强调色变量（accent, accent-hover, accent-light）。同时更新复选框、输入框等全局样式，让它们使用新的强调色变量。

#### 具体操作
1. 编辑 `src/styles/globals.css`
2. 重命名 CSS 变量（去掉 `morandi` 前缀）
3. 新增 `--color-accent`、`--color-accent-hover`、`--color-accent-light`
4. 更新复选框样式使用 `var(--color-accent)`
5. 更新输入框聚焦样式使用 `var(--color-accent)`
6. 确保初始值与增强莫兰迪主题一致

---

### T-027: 主题切换 UI 组件

**状态**: 待执行
**优先级**: P1
**对应 AC**: AC-024, AC-025
**对应技术方案**: §6.4 主题系统方案
**前置依赖**: T-025

#### 验证标准 (TDD RED)
```typescript
// ThemeSwitcher.test.tsx

describe('ThemeSwitcher', () => {
  it('渲染时显示 3 个主题选项', () => {
    render(<ThemeSwitcher />);
    expect(screen.getByText('增强莫兰迪')).toBeInTheDocument();
    expect(screen.getByText('明亮')).toBeInTheDocument();
    expect(screen.getByText('深色')).toBeInTheDocument();
  });

  it('当前主题标记为选中状态', () => {
    vi.spyOn(useThemeStore, 'getState').mockReturnValue({
      currentThemeId: 'bright',
      switchTheme: vi.fn(),
    });
    render(<ThemeSwitcher />);
    const brightOption = screen.getByText('明亮').closest('div');
    expect(brightOption).toHaveClass('selected'); // 或其他标识
  });

  it('点击主题选项调用 switchTheme', () => {
    const switchTheme = vi.fn();
    vi.spyOn(useThemeStore, 'getState').mockReturnValue({
      currentThemeId: 'enhanced-morandi',
      switchTheme,
    });
    render(<ThemeSwitcher />);
    fireEvent.click(screen.getByText('明亮'));
    expect(switchTheme).toHaveBeenCalledWith('bright');
  });
});
```

#### 通俗解释
创建主题切换 UI 组件，以卡片或列表形式展示 3 个预设主题，点击即可切换。当前主题需要有视觉标识（如边框高亮、勾选图标）。样式简洁，符合整体设计风格。

#### 具体操作
1. 创建 `src/renderer/components/ThemeSwitcher.tsx`
2. 渲染主题列表，从 `themes` 配置读取主题名和颜色预览
3. 点击主题时调用 `themeStore.switchTheme()`
4. 当前主题显示选中状态（边框/背景高亮）
5. 每个主题旁边可以显示一个小色块预览
6. 创建 `ThemeSwitcher.test.tsx` 单元测试

---

### T-028: 设置面板与集成

**状态**: 待执行
**优先级**: P1
**对应 AC**: AC-024
**对应技术方案**: §6.4 主题系统方案
**前置依赖**: T-027

#### 验证标准 (TDD RED)
```typescript
// SettingsPanel.test.tsx

describe('SettingsPanel', () => {
  it('渲染时包含主题切换组件', () => {
    render(<SettingsPanel />);
    expect(screen.getByText('主题设置')).toBeInTheDocument();
    expect(screen.getByText('增强莫兰迪')).toBeInTheDocument();
  });
});

// App.tsx 集成验证
describe('App theme integration', () => {
  it('应用启动时初始化主题', () => {
    render(<App />);
    const root = document.documentElement;
    const accentColor = getComputedStyle(root).getPropertyValue('--color-accent');
    expect(accentColor).toBeTruthy(); // 不为空
  });
});
```

#### 通俗解释
创建设置面板，将主题切换组件集成进去。设置面板可以放在窗口右上角（齿轮图标）。应用启动时调用 `themeStore` 初始化主题。

#### 具体操作
1. 创建 `src/renderer/components/SettingsPanel.tsx`
2. 包含"主题设置"标题和 `ThemeSwitcher` 组件
3. 在 `App.tsx` 中添加设置入口（右上角齿轮图标）
4. 点击齿轮图标打开设置面板（模态框或侧滑面板）
5. 在 `App.tsx` 的 `useEffect` 中调用 `themeStore.initTheme()` 初始化主题
6. 创建 `SettingsPanel.test.tsx` 单元测试

---

### T-029: 组件强调色样式更新

**状态**: 待执行
**优先级**: P0
**对应 AC**: AC-028, AC-029, AC-030
**对应技术方案**: §7.5 组件样式更新示例
**前置依赖**: T-026

#### 验证标准 (TDD RED)
```typescript
// 需要更新以下组件的样式（通过 snapshot 测试或样式断言）

// TaskInput.tsx
// - 添加按钮使用 bg-[var(--color-accent)] + hover:bg-[var(--color-accent-hover)]

// ListSidebar.tsx
// - 选中项使用 bg-[var(--color-accent-light)] + opacity
// - 悬停效果使用 var(--color-accent-light)

// TaskItem.tsx
// - 复选框使用 var(--color-accent)（已由 globals.css 全局更新）
// - 编辑模式边框使用 var(--color-accent)

// DueDatePicker.tsx
// - 选中日期使用 bg-[var(--color-accent)] + text-white
// - 悬停效果使用 var(--color-accent-light)

// App.tsx
// - 主容器背景使用 var(--color-bg)
// - 头部边框使用 var(--color-border)

// TaskList.tsx
// - 已完成区域分割线使用 var(--color-border)
```

#### 通俗解释
将所有组件中硬编码的 `--color-morandi-*` 变量替换为新的 `--color-*` 变量，并使用强调色变量替换原来的主色变量。这包括按钮、选中状态、悬停效果、边框等。

#### 具体操作
按顺序更新以下文件：

1. **TaskInput.tsx**
   - 按钮：`bg-[var(--color-morandi-primary)]` → `bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]`
   - 输入框：更新边框变量

2. **ListSidebar.tsx**
   - 选中状态：`bg-[var(--color-morandi-primary-light)]` → `bg-[var(--color-accent-light)]`
   - 悬停效果：更新变量名
   - 边框：更新变量名

3. **TaskItem.tsx**
   - 编辑模式边框：更新变量名
   - 其他样式变量替换

4. **DueDatePicker.tsx**
   - 选中日期颜色：使用 `var(--color-accent)`
   - 悬停效果：使用 `var(--color-accent-light)`

5. **App.tsx**
   - 主容器、头部等：更新变量名

6. **TaskList.tsx**
   - 分割线、空状态等：更新变量名

7. **ListManager.tsx, ReminderPicker.tsx, ConfirmDialog.tsx**
   - 检查并更新所有使用旧变量的地方

---

### T-030: 回归验证

**状态**: 待执行
**优先级**: P0
**对应 AC**: 全部已有 AC
**前置依赖**: T-024, T-025, T-026, T-027, T-028, T-029

#### 验证标准
1. 运行所有已有测试，确保全部通过
2. 新增的 themeStore 和 ThemeSwitcher 测试通过
3. 主题切换功能正常工作（明亮手动验证）
4. 三个主题切换后界面颜色正确
5. 刷新页面后主题保持

#### 通俗解释
确保新增主题功能没有破坏已有功能。运行所有测试，手动验证主题切换和强调色效果。

#### 具体操作
1. 运行 `npm run test` 或 `npm test` 执行所有测试
2. 修复任何失败的测试
3. 运行应用，手动验证：
   - 应用启动显示增强莫兰迪主题
   - 打开设置面板，看到 3 个主题选项
   - 点击明亮主题，界面立即切换颜色
   - 点击深色主题，界面切换到深色
   - 刷新页面，确认主题保持
   - 按钮、复选框、选中状态使用正确的强调色
4. 如有必要，更新失败的测试用例

---

## 依赖关系图

```
T-024 (主题色板配置)
  └── T-025 (主题 Store)
        └── T-027 (主题切换组件)
              └── T-028 (设置面板集成)
  └── T-026 (全局样式更新)
        └── T-029 (组件强调色更新)
              └── T-030 (回归验证)
                    ↑ 所有任务完成后执行
```

## 执行顺序建议

1. **第一阶段（基础层）**：T-024 → T-025 → T-026
   - 创建主题数据、状态管理、样式变量

2. **第二阶段（UI 层）**：T-027 → T-028
   - 创建主题切换 UI 和设置面板

3. **第三阶段（应用层）**：T-029
   - 更新所有组件的样式

4. **第四阶段（验证）**：T-030
   - 回归测试和手动验证

---

## 变更影响摘要

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/renderer/config/themes.ts` | 新增 | 主题色板配置 |
| `src/renderer/config/types.ts` | 新增（或创建） | 主题类型定义 |
| `src/renderer/store/themeStore.ts` | 新增 | 主题状态管理 |
| `src/renderer/components/ThemeSwitcher.tsx` | 新增 | 主题切换 UI |
| `src/renderer/components/SettingsPanel.tsx` | 新增 | 设置面板 |
| `src/renderer/store/themeStore.test.ts` | 新增 | Store 测试 |
| `src/renderer/components/ThemeSwitcher.test.tsx` | 新增 | 组件测试 |
| `src/renderer/components/SettingsPanel.test.tsx` | 新增 | 面板测试 |
| `src/styles/globals.css` | 修改 | 重命名变量 + 新增强调色 |
| `src/renderer/components/TaskInput.tsx` | 修改 | 更新样式变量 |
| `src/renderer/components/ListSidebar.tsx` | 修改 | 更新样式变量 |
| `src/renderer/components/TaskItem.tsx` | 修改 | 更新样式变量 |
| `src/renderer/components/DueDatePicker.tsx` | 修改 | 更新样式变量 |
| `src/renderer/components/App.tsx` | 修改 | 初始化主题 + 添加设置入口 |
| `src/renderer/components/TaskList.tsx` | 修改 | 更新样式变量 |
| 其他组件 | 检查 | 检查是否使用了旧变量名 |
