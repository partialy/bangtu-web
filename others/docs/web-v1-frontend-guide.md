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
│   ├── MobileActivity.tsx
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
- 统一处理七牛上传凭证获取、七牛直传和上传进度。

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

- `sendCode`
- `login`
- `getMe`
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
- `getQiniuUploadToken`
- `uploadToQiniu`

后台：

- `login`
- `getMe`
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

### 5.6 首页轮播和公告类型

```ts
export interface WebBanner {
  id: number;
  title?: string;
  image: string;
  link?: string;
  target?: number;
}

export interface WebNotice {
  id: number;
  title: string;
  content: string;
  summary?: string;
  contentType?: 'html' | 'text';
  isTop?: number;
  popupEnabled?: number;
  publishTime?: string;
}

export interface HomeData {
  banners: WebBanner[];
  notices: WebNotice[];
  popupNotice?: WebNotice | null;
  topInfos: InfoItem[];
  latestInfos: InfoItem[];
  stores: StoreItem[];
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
- 底部固定 Tab：首页、商家、发布、项目、我的；第二栏固定为商家列表，原小程序资讯位置在 Web V1 改为项目列表。
- 需要保留安全区：`padding-bottom: env(safe-area-inset-bottom)`。
- 375、390、430 宽度不得出现横向滚动。
- 文本不能和按钮、图片、底部 Tab 重叠。

### 6.2 首页

首页首屏必须能看到信息流，不能被功能入口占满。

建议顺序：

1. `HeaderBar`，居中展示平台名称，右侧可放安全/菜单图标。
2. 地区选择 + 小号搜索框，地区选择在搜索左侧。
3. 首页轮播图，数据来自 `homeService.getHomeData().banners`，前端只渲染，不直接读取旧表。
4. 公告条，展示 `homeService.getHomeData().notices[0]`，置顶公告优先，点击进入公告详情，更多进入公告列表。
5. 4 个小图标快捷入口。
6. 紧凑统计卡片。
7. 置顶信息。
8. 推荐商家。
9. 最新信息流。

首页弹窗公告：

- `homeService.getHomeData().popupNotice` 不为空时展示弹窗。
- 弹窗展示后用 `localStorage` 记录公告 ID，避免同一公告重复弹出。
- 用户点击“查看详情”时关闭弹窗并进入公告详情页。

详情页容器：

- 移动端详情页优先复用 `src/common/MobileActivity.tsx`。
- `HeaderBar` 必须支持左、中、右插槽，返回按钮使用 `BackButton`。
- 内容放在 `ActivityShell` children 中，页面进入使用 `framer-motion` 做从右向左滑入的手机 App 动画。

### 6.3 信息列表

- Web 和小程序双源统一卡片。
- 必须显示来源标记：`Web` 或 `小程序`。
- 置顶内容有明显但克制的标记。
- 图片最多先展示 3 张，其余用数量提示。

### 6.4 发布信息

- 登录后可进入。
- 表单字段：标题、内容、分类、图片、联系人、手机号、地区、详细地址。
- 图片上传走 `fileService.getQiniuUploadToken` 和 `fileService.uploadToQiniu`，前端直传七牛，后端不转发文件流。
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

### 6.9 公告

- 公告列表调用 `noticeService.listNotices`。
- 公告详情调用 `noticeService.getNoticeDetail`。
- 公告内容支持 HTML 片段，渲染容器必须限制图片最大宽度为 100%，避免撑破移动端。
- 首页公告条只展示标题或摘要，不展示图片。
- 后台公告编辑后续建议接入富文本编辑器；图片仍走七牛前端直传，上传成功后把图片 URL 插入富文本 HTML。

### 6.8 管理后台

- 可以先复用移动端布局或做简单响应式后台。
- 页面包括配置、公告、信息审核、项目审核、订单、退款。
- 后台接口和普通用户接口的 token 分开存储。
- 用户端在 `web/`，后台在 `admin/`，两套前端项目各自维护 `src/services/http.ts`、状态存储和 token，不允许互相复用登录态。

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

## 11. 当前用户端实现基线（260619）

- `web/src/App.tsx` 不再用登录态拦截整个应用；未登录可进入首页、商家列表和信息流。
- `web/src/pages/HomeShell.tsx` 是当前用户端移动 App 壳，底部导航为：首页、商家、发布、项目、我的。
- 首页数据通过 `homeService.getHomeData` 获取，信息流通过 `infoService.listInfo` 获取，商家列表通过 `storeService.listStores` 获取，公告列表/详情通过 `noticeService.listNotices`、`noticeService.getNoticeDetail` 获取。
- 首页顶部当前为 `HeaderBar + 地区选择 + 搜索 + 轮播图 + 公告条`；轮播图使用后端从旧小程序 `tp_ad` 聚合出来的 `banners`。
- 公告详情页和公告列表页使用 `web/src/common/MobileActivity.tsx` 的 Activity 容器，进入时使用 `framer-motion` 滑入动画。
- 首页弹窗公告使用 `popupNotice`，并通过 `localStorage` 保存已弹公告 ID 去重。
- 页面组件只调用 service 方法，不直接拼接 `/api/web/**`。
- 发布信息当前接入 `infoService.publishInfo`，V1 表单先覆盖标题、内容、联系人、手机号、城市、详细地址；图片直传七牛后续在表单中补齐。
- 商家卡片当前展示旧 `tp_store` 的 Logo、名称、推荐/置顶/信誉标记、介绍、地址和拨号入口。
