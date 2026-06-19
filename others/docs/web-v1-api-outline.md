# 帮涂 Web V1 接口文档大纲

> 本文档是后续实现接口时必须维护的 API 文档骨架。每次新增或修改后端接口，都要同步更新本文档。

## 1. 基础约定

### 1.1 服务地址

- 本地 Java：`http://localhost:38989/api`
- Web V1 前缀：`/web`
- 外部完整接口：`/api/web/**`

### 1.2 Java 包与返回规范

- Web V1 后端代码统一放在：`cn.example.dataserver.web`
- 数据库操作统一使用 MyBatis-Plus。
- 所有普通接口统一返回 `cn.example.dataserver.common.Result` 的 JSON 字符串。

`Result<T>` 格式：

```json
{
  "code": 0,
  "msg": "success",
  "data": {},
  "errorMsg": null,
  "success": true
}
```

### 1.3 加密响应

生产环境开启加密后，接口响应外层为：

```json
{
  "enc": true,
  "encData": "base64"
}
```

说明：

- `encData` 是 Base64 字符串。
- Base64 解码后再 AES 解密。
- 解密后的明文必须是 `Result.java` 格式 JSON 字符串。
- 前端统一在 `src/services/httpClient.ts` 中处理，不允许页面组件处理。

### 1.4 鉴权

普通用户：

```http
Authorization: Bearer <userToken>
```

后台管理员：

```http
Authorization: Bearer <adminToken>
```

未登录可访问：

- 首页
- 信息列表/详情
- 项目列表/详情
- 商家列表/详情
- 公告列表/详情

必须登录：

- 发布信息
- 项目下单
- 拨打电话记录
- 我的订单
- 退款申请

必须管理员登录：

- 配置管理
- 公告管理
- 信息审核
- 项目审核
- 订单查看
- 退款处理

## 2. 接口文档填写模板

每个接口实现后必须按此模板补齐：

```md
### 接口名称

- Path:
- Method:
- Auth:
- Frontend Service:
- Related Tables:
- Description:

#### Request Query

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |

#### Request Body

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |

#### Response Data

| 字段 | 类型 | 说明 |
| --- | --- | --- |

#### Example Request

#### Example Response

#### Error Cases

| code | msg | 说明 |
| --- | --- | --- |
```

## 3. 用户与登录

### 3.1 发送验证码

- Path: `/api/web/auth/send-code`
- Method: `POST`
- Auth: 否
- Frontend Service: `sendCode`
- Related Tables: `web_sms_code`, `web_config`
- Description: 发送或记录 Web 手机号登录验证码。

Request Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `mobile` | string | 是 | 手机号 |
| `scene` | string | 否 | 场景，默认 `login` |

Response Data：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `sent` | boolean | 是否已触发真实短信发送 |
| `expireSeconds` | number | 过期秒数 |
| `expiresIn` | number | 当前实现字段，验证码有效期秒数 |
| `bypassEnabled` | boolean | 当前实现字段，是否开启免校验验证码 |

### 3.2 手机号登录

- Path: `/api/web/auth/login`
- Method: `POST`
- Auth: 否
- Frontend Service: `login`
- Related Tables: `tp_users`, `web_sms_code`, `web_config`
- Description: 手机号验证码登录；配置开启后手机号 + 验证码 `1` 可登录。

Request Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `mobile` | string | 是 | 手机号 |
| `code` | string | 是 | 验证码 |

Response Data：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `token` | string | 用户 token |
| `tokenType` | string | 当前实现字段，固定 `Bearer` |
| `expiresIn` | number | 当前实现字段，token 过期秒数 |
| `user` | object | 当前用户 |
| `isNewWebUser` | boolean | 是否首次 Web 登录 |

### 3.3 当前用户

- Path: `/api/web/auth/me`
- Method: `GET`
- Auth: 用户登录
- Frontend Service: `getMe`
- Related Tables: `tp_users`
- Description: 返回当前登录用户。

## 4. 首页

### 4.1 首页聚合

- Path: `/api/web/home`
- Method: `GET`
- Auth: 否
- Frontend Service: `getHomeData`
- Related Tables: `web_notice`, `web_info`, `tp_circle`, `web_project`, `tp_addon_work`, `tp_store`, `web_config`
- Description: 首页公告、置顶信息、最新信息、项目和商家聚合。

Request Query：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `city` | string | 否 | 城市筛选 |

Response Data：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `notices` | array | 公告 |
| `topInfos` | array | 置顶信息 |
| `latestInfos` | array | 最新信息 |
| `projects` | array | 推荐项目 |
| `stores` | array | 推荐商家 |

## 5. 信息接口

### 5.1 信息列表

- Path: `/api/web/info/list`
- Method: `GET`
- Auth: 否
- Frontend Service: `listInfo`
- Related Tables: `web_info`, `tp_circle`
- Description: Web 信息和小程序信息双源分页列表。

Query：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | number | 否 | 页码，默认 1 |
| `size` | number | 否 | 每页数量，默认 20 |
| `keyword` | string | 否 | 搜索词 |
| `categoryId` | number | 否 | 分类 |
| `city` | string | 否 | 城市 |

### 5.2 信息详情

- Path: `/api/web/info/{sourceType}/{sourceId}`
- Method: `GET`
- Auth: 否
- Frontend Service: `getInfoDetail`
- Related Tables: `web_info` 或 `tp_circle`
- Description: 根据信息来源分流详情。

Path：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `sourceType` | string | 是 | `web` 或 `miniapp` |
| `sourceId` | number | 是 | 来源 ID |

### 5.3 发布信息

- Path: `/api/web/info`
- Method: `POST`
- Auth: 用户登录
- Frontend Service: `publishInfo`
- Related Tables: `web_info`, `web_config`
- Description: 用户发布 Web 信息，只写 `web_info`。

Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | string | 是 | 标题 |
| `content` | string | 是 | 内容 |
| `categoryId` | number | 否 | 分类 ID |
| `categoryName` | string | 否 | 分类名称 |
| `images` | string[] | 否 | 图片 URL |
| `contactName` | string | 否 | 联系人 |
| `contactMobile` | string | 否 | 联系电话 |
| `province` | string | 否 | 省份 |
| `city` | string | 否 | 城市 |
| `district` | string | 否 | 区县 |
| `address` | string | 否 | 详细地址 |

## 6. 项目接口

### 6.1 项目列表

- Path: `/api/web/project/list`
- Method: `GET`
- Auth: 否
- Frontend Service: `listProjects`
- Related Tables: `web_project`, `tp_addon_work`
- Description: Web 项目和小程序项目双源分页列表。

### 6.2 项目详情

- Path: `/api/web/project/{sourceType}/{sourceId}`
- Method: `GET`
- Auth: 否
- Frontend Service: `getProjectDetail`
- Related Tables: `web_project` 或 `tp_addon_work`
- Description: 根据来源读取项目详情。

### 6.3 项目下单

- Path: `/api/web/project/order`
- Method: `POST`
- Auth: 用户登录
- Frontend Service: `createProjectOrder`
- Related Tables: `web_project_order`, `web_project`, `tp_addon_work`
- Description: 生成项目意向单，V1 不接在线支付。

Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `sourceType` | string | 是 | `web` 或 `miniapp` |
| `sourceId` | number | 是 | 项目来源 ID |
| `amount` | number | 否 | 订单金额 |
| `contactName` | string | 否 | 联系人 |
| `contactMobile` | string | 否 | 联系电话 |
| `remark` | string | 否 | 备注 |

## 7. 订单与退款

### 7.1 我的订单

- Path: `/api/web/order/my`
- Method: `GET`
- Auth: 用户登录
- Frontend Service: `listMyOrders`
- Related Tables: `web_project_order`
- Description: 当前用户项目意向单列表。

### 7.2 订单详情

- Path: `/api/web/order/{id}`
- Method: `GET`
- Auth: 用户登录
- Frontend Service: `getOrderDetail`
- Related Tables: `web_project_order`, `web_order_refund`
- Description: 当前用户订单详情。

### 7.3 申请退款

- Path: `/api/web/order/{id}/refund`
- Method: `POST`
- Auth: 用户登录
- Frontend Service: `applyOrderRefund`
- Related Tables: `web_project_order`, `web_order_refund`
- Description: 提交退款申请，V1 只记录申请。

Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `reason` | string | 是 | 退款原因 |

## 8. 拨号记录

### 8.1 记录拨号

- Path: `/api/web/call`
- Method: `POST`
- Auth: 用户登录
- Frontend Service: `recordCall`
- Related Tables: `web_call_record`
- Description: 用户点击拨号前记录行为。

Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `targetType` | string | 是 | `info`、`project`、`store` |
| `sourceType` | string | 是 | `web` 或 `miniapp` |
| `sourceId` | number | 是 | 来源 ID |
| `mobile` | string | 是 | 手机号 |

## 9. 商家接口

### 9.1 商家列表

- Path: `/api/web/store/list`
- Method: `GET`
- Auth: 否
- Frontend Service: `listStores`
- Related Tables: `tp_store`
- Description: 读取旧商家数据，只读展示。

### 9.2 商家详情

- Path: `/api/web/store/{id}`
- Method: `GET`
- Auth: 否
- Frontend Service: `getStoreDetail`
- Related Tables: `tp_store`
- Description: 商家详情。

## 10. 公告接口

### 10.1 公告列表

- Path: `/api/web/notice/list`
- Method: `GET`
- Auth: 否
- Frontend Service: `listNotices`
- Related Tables: `web_notice`
- Description: 已发布公告列表。

### 10.2 公告详情

- Path: `/api/web/notice/{id}`
- Method: `GET`
- Auth: 否
- Frontend Service: `getNoticeDetail`
- Related Tables: `web_notice`
- Description: 公告详情。

## 11. 文件上传

### 11.1 获取七牛上传凭证

- Path: `/api/web/file/upload-token`
- Method: `GET`
- Auth: 用户登录
- Frontend Service: `getQiniuUploadToken`
- Related Tables: 无，V1 不落库
- Description: Java 后端只签发七牛上传凭证，前端拿到 token 后直传七牛，不经过后端转发文件流。

Response Data：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `uploadToken` | string | 七牛上传凭证 |
| `uploadUrl` | string | 七牛浏览器直传地址 |
| `domain` | string | 图片访问域名 |
| `cdnDomain` | string | CDN 图片访问域名 |
| `keyPrefix` | string | 建议文件 key 前缀，前端最终 key 必须以此前缀开头 |
| `expires` | number | 上传凭证有效期，单位秒 |

前端流程：

1. 调用 `getQiniuUploadToken` 获取上传凭证。
2. 在 `fileService.uploadToQiniu` 中将文件、`token`、最终 `key` 直传到 `uploadUrl`。
3. 七牛上传成功后，用 `domain + '/' + key` 生成图片 URL。
4. 发布信息或项目时，把图片 URL 或 key 写入 `images` 数组。

## 12. 后台接口

### 12.1 管理员登录

- Path: `/api/web/admin/auth/login`
- Method: `POST`
- Auth: 否
- Frontend Service: `adminLogin`
- Related Tables: `web_admin_user`
- Description: Web 管理后台登录。

### 12.2 配置查询

- Path: `/api/web/admin/config`
- Method: `GET`
- Auth: 管理员
- Frontend Service: `getWebConfig`
- Related Tables: `web_config`

### 12.3 配置更新

- Path: `/api/web/admin/config`
- Method: `PUT`
- Auth: 管理员
- Frontend Service: `updateWebConfig`
- Related Tables: `web_config`, `web_audit_log`

### 12.4 公告管理

- `GET /api/web/admin/notice/list`：`listAdminNotices`
- `POST /api/web/admin/notice`：`createNotice`
- `PUT /api/web/admin/notice/{id}`：`updateNotice`
- `DELETE /api/web/admin/notice/{id}`：`deleteNotice`

Related Tables: `web_notice`, `web_audit_log`

### 12.5 信息审核

- `GET /api/web/admin/info/list`：`listInfoAudit`
- `POST /api/web/admin/info/{id}/audit`：`auditInfo`

Related Tables: `web_info`, `web_audit_log`

Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | number | 是 | 1 通过，2 拒绝，3 下架 |
| `remark` | string | 否 | 审核备注 |

### 12.6 项目审核

- `GET /api/web/admin/project/list`：`listProjectAudit`
- `POST /api/web/admin/project/{id}/audit`：`auditProject`

Related Tables: `web_project`, `web_audit_log`

### 12.7 订单查看

- Path: `/api/web/admin/order/list`
- Method: `GET`
- Auth: 管理员
- Frontend Service: `listAdminOrders`
- Related Tables: `web_project_order`

### 12.8 退款处理

- `GET /api/web/admin/refund/list`：`listRefunds`
- `POST /api/web/admin/refund/{id}/handle`：`handleRefund`

Related Tables: `web_order_refund`, `web_project_order`, `web_audit_log`

Body：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | number | 是 | 1 同意，2 拒绝 |
| `remark` | string | 否 | 处理备注 |

## 13. 错误码约定

| code | 说明 |
| --- | --- |
| `0` | 成功 |
| `400` | 参数或业务错误 |
| `401` | 未登录或 token 失效 |
| `403` | 无权限 |
| `404` | 数据不存在 |
| `500` | 服务异常 |

## 14. 文档维护规则

- 接口实现前先补充本大纲中的字段细节。
- 接口实现后补充 Example Request 和 Example Response。
- 修改接口入参、出参、鉴权、加密行为时必须同步更新本文档。
- 前端 service 方法名发生变化时必须同步更新本文档和 `web-v1-frontend-guide.md`。

## 15. 当前已实现接口（260619）

本节记录当前代码已经落地、可联调的 Web V1 接口；后续继续实现时，以本节为当前事实基线。

### 15.1 用户端登录

- `POST /api/web/auth/send-code`
  - Auth: 否
  - Frontend Service: `sendCode`
  - Body: `{ "mobile": "13800138000" }`
  - Data: `{ "sent": false, "bypassEnabled": true, "expiresIn": 300 }`
  - Related Tables: `web_sms_code`, `web_config`

- `POST /api/web/auth/login`
  - Auth: 否
  - Frontend Service: `login`
  - Body: `{ "mobile": "13800138000", "code": "1" }`
  - Data: `{ "token": "...", "tokenType": "Bearer", "expiresIn": 2592000, "user": { ... } }`
  - Related Tables: `tp_users`, `web_sms_code`, `web_config`

- `GET /api/web/auth/me`
  - Auth: 用户登录
  - Frontend Service: `getMe`
  - Related Tables: `tp_users`

### 15.2 用户端首页与信息

- `GET /api/web/home`
  - Auth: 否
  - Frontend Service: `getHomeData`
  - Data: `{ "notices": [], "topInfos": [], "latestInfos": [], "stores": [] }`
  - Related Tables: `web_notice`, `web_info`, `tp_circle`, `tp_store`, `web_config`
  - Note: `stores` 来自旧 `tp_store`，只读展示；旧 PHP 序列化图片字段会在 Java 层提取为图片 URL 数组。

- `GET /api/web/info/list?page=1&size=10`
  - Auth: 否
  - Related Tables: `web_info`, `tp_circle`
  - Note: 双源只读展示；Web 新信息来自 `web_info`，小程序旧信息来自 `tp_circle`。

- `POST /api/web/info`
  - Auth: 用户登录
  - Frontend Service: `publishInfo`
  - Related Tables: `web_info`, `web_config`
  - Note: 只写 `web_info`，不会写入 `tp_circle`。

### 15.3 用户端商家

- `GET /api/web/store/list?page=1&size=20`
  - Auth: 否
  - Frontend Service: `listStores`
  - Related Tables: `tp_store`
  - Data: `[{ "storeId": 140, "storeName": "...", "storeLogo": "...", "contactsMobile": "...", "city": "...", "isTop": 0, "isHot": 1, "images": [] }]`
  - Note: V1 只读旧商家数据，筛选 `deleted=0`、`status=1`；按置顶、热门、推荐、排序和审核时间排序。

### 15.4 Web 独立后台登录

- `POST /api/web/admin/auth/login`
  - Auth: 否
  - Frontend Service: `adminAuthService.login`
  - Body: `{ "username": "admin", "password": "admin123456" }`
  - Related Tables: `web_admin_user`
  - Note: `web_admin_user` 为空时会按 yml 的 `web.admin.default.*` 初始化默认管理员。

- `GET /api/web/admin/auth/me`
  - Auth: 管理员登录
  - Frontend Service: `adminAuthService.getMe`
  - Related Tables: `web_admin_user`
