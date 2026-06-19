# 帮涂 Web V1 前端对接与实现文档

> 本文档可直接交给 AI 或前端开发者执行。当前阶段只定义对接要求和工程规范，不写前端代码。

## 1. 技术栈

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Zustand
- TanStack Query
- React Router

## 2. 核心原则

- 前端项目目录：`E:\Projects\xianyu\20260310\bangtu-web\web`。
- 页面、组件、Hooks、状态、请求服务必须拆分，避免大文件和大组件。
- 页面和 UI 组件禁止直接请求接口，不能出现 `fetch('/api/web/xxx')`、`axios('/api/web/xxx')` 这类写法。
- 所有接口统一封装到 `src/services/`，页面只调用 service 导出的类型安全方法。
- 所有接口响应统一走 `Result<T>` 类型。
- 加密、token、错误提示、登录跳转、分页参数都在请求层统一处理。
- 前端展示必须适配移动端，优先按手机 App 风格设计。

## 3. 推荐目录结构

```text
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── queryClient.ts
├── common/
│   ├── index.ts
│   ├── AppShell.tsx
│   ├── BottomTabs.tsx
│   ├── Button.tsx
│   ├── EmptyState.tsx
│   ├── ImageGrid.tsx
│   ├── LoadingState.tsx
│   ├── SourceBadge.tsx
│   └── TopBar.tsx
├── pages/
│   ├── Home/
│   ├── Info/
│   ├── Project/
│   ├── Store/
│   ├── Notice/
│   ├── Mine/
│   └── Admin/
├── services/
│   ├── httpClient.ts
│   ├── types.ts
│   ├── authService.ts
│   ├── homeService.ts
│   ├── infoService.ts
│   ├── projectService.ts
│   ├── orderService.ts
│   ├── storeService.ts
│   ├── noticeService.ts
│   ├── fileService.ts
│   └── adminService.ts
├── stores/
│   ├── authStore.ts
│   └── appStore.ts
├── hooks/
│   ├── useRequireLogin.ts
│   ├── useInfiniteList.ts
│   └── useCallPhone.ts
├── utils/
│   ├── crypto.ts
│   ├── format.ts
│   ├── validators.ts
│   └── env.ts
├── styles/
│   └── index.css
└── main.tsx
```

## 4. 请求封装要求

### 4.1 统一入口

所有 HTTP 请求必须经过 `src/services/httpClient.ts`。

`httpClient` 负责：

- 拼接 `VITE_API_BASE_URL`。
- 注入 `Authorization: Bearer <token>`。
- 处理普通 `Result<T>` 响应。
- 处理加密响应 `{ enc: true, encData: string }`。
- 统一抛出业务错误。
- 统一处理 401 登录失效。
- 统一处理上传进度和文件上传。

页面禁止直接写接口路径。正确方式：

```ts
// 页面中只调用 service 方法
const result = await listInfo({ page: 1, size: 20 });
```

错误方式：

```ts
// 禁止
await fetch('/api/web/info/list');
```

### 4.2 Result 类型

前端统一定义：

```ts
export interface ApiResult<T> {
  code: number;
  msg: string;
  data: T;
  errorMsg?: string | null;
  success: boolean;
}
```

成功判断：

- `success === true`
- `code === 0`

未授权：

- `code === 401`
- 或 HTTP 状态 401

### 4.3 加密响应类型

后端生产环境可能返回：

```ts
export interface EncryptedResult {
  enc: true;
  encData: string;
}
```

处理流程：

1. 判断响应是否存在 `enc === true`。
2. 对 `encData` 做 Base64 解码。
3. 使用 AES 解密。
4. 解密结果是 `Result.java` 格式 JSON 字符串。
5. `JSON.parse` 得到 `ApiResult<T>`。

页面、组件、业务 Hook 不允许感知加密细节。

### 4.4 请求方法命名

Service 方法按业务命名，不按 URL 命名：

- `sendLoginCode`
- `loginByMobile`
- `getCurrentUser`
- `getHomeData`
- `listInfo`
- `getInfoDetail`
- `publishInfo`
- `listProjects`
- `getProjectDetail`
- `createProjectOrder`
- `listMyOrders`
- `getOrderDetail`
- `applyOrderRefund`
- `recordCall`
- `listStores`
- `getStoreDetail`
- `listNotices`
- `getNoticeDetail`

后台：

- `adminLogin`
- `getWebConfig`
- `updateWebConfig`
- `listAdminNotices`
- `createNotice`
- `updateNotice`
- `deleteNotice`
- `listInfoAudit`
- `auditInfo`
- `listProjectAudit`
- `auditProject`
- `listAdminOrders`
- `listRefunds`
- `handleRefund`

## 5. TypeScript 类型要求

### 5.1 基础来源类型

```ts
export type SourceType = 'web' | 'miniapp';
export type TargetType = 'info' | 'project' | 'store';
```

### 5.2 列表分页类型

```ts
export interface PageQuery {
  page: number;
  size: number;
}

export interface PageResult<T> {
  list: T[];
  page: number;
  size: number;
  total?: number;
  hasMore?: boolean;
}
```

### 5.3 信息卡片类型

```ts
export interface InfoItem {
  sourceType: SourceType;
  sourceId: number;
  title: string;
  content: string;
  images: string[];
  categoryName?: string;
  contactName?: string;
  contactMobile?: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  isTop: boolean;
  viewCount: number;
  createdAt: string;
}
```

### 5.4 项目类型

```ts
export interface ProjectItem {
  sourceType: SourceType;
  sourceId: number;
  title: string;
  content: string;
  amount: number;
  constructionTime?: string;
  contactName?: string;
  contactMobile?: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  images: string[];
  isTop: boolean;
  viewCount: number;
  createdAt: string;
}
```

### 5.5 用户和订单类型

```ts
export interface WebUser {
  userId: number;
  mobile: string;
  nickname?: string;
  headPic?: string;
  webLogin: boolean;
  webFirstLoginTime?: string;
  webLastLoginTime?: string;
}

export interface WebOrder {
  id: number;
  orderNo: string;
  sourceType: SourceType;
  sourceId: number;
  projectTitle: string;
  amount: number;
  contactName?: string;
  contactMobile?: string;
  remark?: string;
  status: 0 | 1 | 2 | 3;
  refundStatus: 0 | 1 | 2 | 3;
  createdAt: string;
}
```

## 6. 页面布局要求

### 6.1 总体体验

- 首屏就是可用产品，不做营销落地页。
- 移动端优先，主体宽度建议 `max-width: 430px`，桌面居中展示手机容器。
- 底部固定 Tab：首页、信息、发布、项目、我的。
- 需要保留安全区：`padding-bottom: env(safe-area-inset-bottom)`。
- 375、390、430 宽度不得出现横向滚动。
- 文本不能和按钮、图片、底部 Tab 重叠。

### 6.2 首页

首页首屏必须能看到信息流，不能被功能入口占满。

建议顺序：

1. 顶部定位/搜索。
2. 公告条。
3. 4 到 5 个小图标快捷入口。
4. 置顶信息横向/紧凑列表。
5. 最新信息流。

### 6.3 信息列表

- Web 和小程序双源统一卡片。
- 必须显示来源标记：`Web` 或 `小程序`。
- 置顶内容有明显但克制的标记。
- 图片最多先展示 3 张，其余用数量提示。

### 6.4 发布信息

- 登录后可进入。
- 表单字段：标题、内容、分类、图片、联系人、手机号、地区、详细地址。
- 图片上传走 `fileService.uploadFile`。
- 提交走 `infoService.publishInfo`。
- 提交后根据后端返回状态展示“已发布”或“待审核”。

### 6.5 项目

- 列表展示预算、施工时间、地区、来源。
- 详情页展示下单按钮。
- 下单前必须登录。
- V1 下单只是意向单，不展示支付入口。

### 6.6 商家

- 列表从旧 `tp_store` 读取。
- 详情展示商家介绍、公告、图片、地址、联系方式。
- 拨号按钮调用 `recordCall` 成功后再触发 `tel:`。

### 6.7 我的

- 未登录展示手机号验证码登录。
- 已登录展示用户信息、我的发布、我的订单、退款入口。
- V1 不展示钱包、积分、会员购买。

### 6.8 管理后台

- 可以先复用移动端布局或做简单响应式后台。
- 页面包括配置、公告、信息审核、项目审核、订单、退款。
- 后台接口和普通用户接口的 token 分开存储。

## 7. TanStack Query 使用要求

- 列表使用 query key 包含筛选参数。
- 发布、下单、退款成功后要 invalidate 相关列表。
- 详情页 query key 必须包含 `sourceType` 和 `sourceId`。

示例 key：

```ts
['infoList', query]
['infoDetail', sourceType, sourceId]
['projectList', query]
['projectDetail', sourceType, sourceId]
['myOrders']
```

## 8. Zustand 状态要求

`authStore` 保存：

- `token`
- `user`
- `isLoggedIn`
- `setToken`
- `setUser`
- `logout`

token 持久化到 `localStorage`，但 Service 层读取 token 时必须通过统一方法，避免多个地方直接访问 storage。

## 9. 环境变量

建议：

```env
VITE_API_BASE_URL=http://localhost:38989/api
VITE_WEB_CRYPTO_ENABLED=false
```

请求时 service 内拼接 `/web/**`，最终路径为 `/api/web/**`。

## 10. 验收要求

- 页面中搜索不到 `fetch('/api`、`axios('/api`、`/api/web` 这类直接请求写法。
- 所有接口都有对应 service 方法和 TypeScript 入参/出参类型。
- 加密响应只在 `httpClient` 处理。
- 未登录可浏览首页、列表、详情。
- 登录后可发布、下单、拨号、查看订单、申请退款。
- 375/390/430 宽度无横向滚动、无明显遮挡。
