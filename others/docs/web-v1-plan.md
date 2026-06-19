# 帮涂 Web V1 开发计划

> 当前阶段只写 SQL 和文档，不写 Java/React 业务代码。数据库脚本已落地为 `web-v1-schema.sql`，后续确认后再分阶段实现 Java 接口和 React 前端。

## 1. 背景与目标

现有系统以小程序为主，代码在 `hsf/` 和 `后台代码/`，数据主要落在 `tp_` 前缀表。后续业务重心转到 Web 端，但 Web 新发布内容不能反向展示到小程序，避免影响平台规则。因此 Web V1 的核心原则是：

- Web 可以读取并展示小程序旧数据。
- Web 新发布、新项目、新订单、新公告、新配置全部走 `web_` 新表。
- `tp_users` 继续作为统一用户表，避免用户体系割裂。
- V1 先搭平台骨架和基础闭环，不做会员、付费置顶、在线支付、签到等复杂能力。

V1 必须覆盖：

- 手机号登录。
- 首页信息流。
- 信息列表、详情、发布信息。
- 项目列表、详情、项目下单。
- 商家列表、详情、拨打电话记录。
- 公告展示。
- 我的订单、退款申请。
- 最小后台：配置、公告、审核、订单、退款处理。

## 2. 当前代码与数据现状

### 现有代码

- `hsf/`：uni-app 小程序，Vue 2 + uView。
- `后台代码/`：ThinkPHP 6 后台和小程序 API，旧接口使用 token + MD5 sign。
- `../bangtu-web/dataserver-java`：Spring Boot 3.5 Java 服务，已有 JWT、短信、上传、微信支付转账相关能力；Web V1 后端代码统一新建 `cn.example.dataserver.web` 包存放。
- `../bangtu-web/web`：计划作为 React Web 前端目录。

### 现有核心旧表

- `tp_users`：统一用户表，建议只补 Web 登录标记字段。
- `tp_circle`：旧信息/圈子发布表，Web 只读展示。
- `tp_addon_work`：旧项目表，已有审核、退款、完成、评价字段，Web 只读展示。
- `tp_store`：旧商家表，Web 只读展示。
- `tp_sms_log`、`tp_config`：旧系统验证码和配置表，Web 不复用。
- 分类、文章、公告类旧表：V1 可按展示需要只读读取，Web 新公告独立建表。

## 3. 技术栈建议

### 后端

- Java 17 + Spring Boot 3.5。
- MySQL 单实例。
- 数据库操作统一使用 MyBatis-Plus；基础 CRUD 走 `IService`/`ServiceImpl`，复杂双源查询再使用 Mapper XML。
- Web V1 相关 Java 代码统一放在 `src/main/java/cn/example/dataserver/web/` 下，避免和现有旧接口、微信支付转账逻辑混在一起。
- Web 包建议结构：`controller`、`services`、`entity`、`dto`、`mapper`、`config`、`interceptor`、`crypto`、`constant`。
- Controller 只接收参数、调用 Service、返回结果；业务逻辑全部放入 `services/*BisService.java`。
- 所有接口统一使用 `cn.example.dataserver.common.Result` 返回，Controller/Service 最终返回 `Result.success(...).toJson()` 或错误 Result JSON。
- Web 接口统一放在 `/api/web/**`。
- 旧接口不改，旧 PHP 小程序签名逻辑不动。

### 前端

- React + TypeScript + Vite。
- Tailwind CSS 做基础样式。
- Framer Motion 做移动端页面切换、列表入场、底部弹层等动画。
- Zustand 管登录态、用户信息、轻量全局状态。
- TanStack Query 管接口缓存、刷新、分页。
- React Router 管前台和后台路由。
- 请求必须统一封装在 `src/services/`，页面和组件禁止直接写 `fetch('/xxx')`、`axios('/xxx')` 这类硬编码请求。

### 后续 App 化

Web 端可以按移动 H5/PWA 风格开发，后续 Android 只需要 WebView 嵌入并补少量能力：

- WebView 注入 token、设备信息、定位信息。
- 原生拨号、图片选择、定位可按需通过 JSBridge 接入。
- V1 先用浏览器标准能力，避免一开始绑定 App 容器。

## 4. 数据库设计

### 4.1 旧表使用边界

- `tp_users`：继续作为统一用户表，可新增 Web 登录字段。
- `tp_circle`：Web 信息列表可读，不写。
- `tp_addon_work`：Web 项目列表可读，不写。
- `tp_store`：Web 商家列表可读，不写。
- `tp_sms_log`：旧系统使用，Web 不写。
- `tp_config`：旧系统使用，Web 不写。

### 4.2 `tp_users` 建议新增字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `web_login` | `tinyint(1)` | 是否在 Web 登录过，0 否 1 是，用于 Web 新人红包等后续逻辑 |
| `web_first_login_time` | `datetime` | Web 首次登录时间 |
| `web_last_login_time` | `datetime` | Web 最后登录时间 |

### 4.3 Web 新表清单

所有新表统一规则：

- 表名使用 `web_` 前缀。
- 字段写中文 `COMMENT`。
- 引擎 `InnoDB`，字符集 `utf8mb4`。
- 时间字段使用 `datetime`。
- 图片字段使用 JSON 字符串或 MySQL JSON 类型，后端统一按数组处理。
- 跨旧表引用使用 `source_type + source_id`，例如 `source_type=miniapp/web`。
- SQL 脚本文件：`web-v1-schema.sql`。
- Java 实体后续全部放在 `cn.example.dataserver.web.entity`，并使用 MyBatis-Plus 注解映射表字段。

#### `web_config` Web 配置表

用途：保存 Web 独立配置，不污染 `tp_config`。

核心字段：

- `id`
- `config_key`
- `config_value`
- `value_type`
- `group_name`
- `remark`
- `created_at`
- `updated_at`

V1 配置项建议：

- `phone_login_bypass_enabled`：是否开启手机号免校验。
- `phone_login_bypass_code`：免校验固定验证码，默认 `1`。
- `sms_send_enabled`：是否真实发送短信。
- `info_auto_audit`：信息发布是否自动通过。
- `project_auto_audit`：项目发布是否自动通过。
- `home_notice_limit`：首页公告数量。
- `home_top_info_limit`：首页置顶信息数量。

#### `web_sms_code` Web 验证码表

用途：Web 手机号登录验证码记录。

核心字段：

- `id`
- `mobile`
- `code`
- `scene`
- `expire_time`
- `used`
- `used_at`
- `ip`
- `created_at`

#### `web_info` Web 发布信息表

用途：Web 用户新发布的信息，只在 Web 展示。

核心字段：

- `id`
- `user_id`
- `title`
- `content`
- `category_id`
- `category_name`
- `images`
- `contact_name`
- `contact_mobile`
- `province`
- `city`
- `district`
- `address`
- `longitude`
- `latitude`
- `audit_status`：0 待审核，1 已通过，2 已拒绝，3 已下架。
- `audit_remark`
- `is_top`
- `top_start_time`
- `top_end_time`
- `view_count`
- `created_at`
- `updated_at`

#### `web_project` Web 项目表

用途：Web 发布的新项目，不写入 `tp_addon_work`。

核心字段：

- `id`
- `user_id`
- `title`
- `content`
- `budget_amount`
- `construction_time`
- `contact_name`
- `contact_mobile`
- `province`
- `city`
- `district`
- `address`
- `longitude`
- `latitude`
- `images`
- `audit_status`
- `audit_remark`
- `is_top`
- `view_count`
- `created_at`
- `updated_at`

#### `web_project_order` Web 项目订单/意向单

用途：用户对 Web 或小程序项目下单，V1 不接在线支付，只记录意向。

核心字段：

- `id`
- `order_no`
- `user_id`
- `source_type`：`web` 或 `miniapp`。
- `source_id`
- `project_title`
- `amount`
- `contact_name`
- `contact_mobile`
- `remark`
- `status`：0 待处理，1 已受理，2 已完成，3 已取消。
- `refund_status`：0 无退款，1 申请中，2 已同意，3 已拒绝。
- `created_at`
- `updated_at`

#### `web_order_refund` Web 退款申请表

用途：V1 只记录申请和后台处理，不做支付原路退款。

核心字段：

- `id`
- `order_id`
- `user_id`
- `reason`
- `status`：0 待处理，1 已同意，2 已拒绝。
- `admin_id`
- `admin_remark`
- `created_at`
- `handled_at`

#### `web_call_record` Web 拨号记录表

用途：记录登录用户拨打商家、信息、项目手机号。

核心字段：

- `id`
- `user_id`
- `target_type`：`info`、`project`、`store`。
- `source_type`：`web` 或 `miniapp`。
- `source_id`
- `mobile`
- `created_at`

#### `web_notice` Web 公告表

用途：后台发布，前台展示。

核心字段：

- `id`
- `title`
- `content`
- `status`：0 草稿，1 已发布，2 已下架。
- `is_top`
- `publish_time`
- `created_at`
- `updated_at`

#### `web_admin_user` Web 后台管理员表

用途：V1 Java 最小后台账号，不复用 PHP 后台登录。

核心字段：

- `id`
- `username`
- `password_hash`
- `nickname`
- `status`：0 禁用，1 启用。
- `last_login_time`
- `created_at`
- `updated_at`

#### `web_audit_log` Web 审核日志表

用途：记录后台审核和处理动作。

核心字段：

- `id`
- `admin_id`
- `target_type`：`info`、`project`、`notice`、`refund`。
- `target_id`
- `action`
- `before_status`
- `after_status`
- `remark`
- `created_at`

## 5. 后端接口规划

### 5.1 接口路径

- 外部统一 `/api/web/**`。
- 如果 Java 服务保留 `spring.mvc.servlet.path=/api`，Controller 内部映射建议写 `/web/**`。
- 旧 `/api/**` 不改。

### 5.2 接口加密

配置建议：

- `web.crypto.enabled`
- `web.crypto.key`
- `web.crypto.path-pattern=/api/web/**`

规则：

- 只对 `/api/web/**` 生效。
- 开发环境默认关闭，方便调试。
- 生产环境开启 AES 请求体解密和响应加密。
- 未加密响应保持 `Result.java` JSON 格式。
- 加密响应统一为：

```json
{
  "enc": true,
  "encData": "base64"
}
```

- `encData` 先 Base64 解码，再 AES 解密，解密后的明文必须是 `Result.java` 格式 JSON 字符串。
- 前端请求层负责统一识别 `enc=true` 并解密，不允许页面组件直接处理加密细节。
- 不影响旧接口现有加密、签名、JWT 逻辑。

### 5.3 登录接口

- `POST /api/web/auth/send-code`
  - 入参：手机号、场景。
  - 行为：写入 `web_sms_code`；若 `sms_send_enabled=true`，调用阿里云短信。

- `POST /api/web/auth/login`
  - 入参：手机号、验证码。
  - 行为：读取 `web_config` 判断免校验；开启后验证码 `1` 可登录。
  - 用户不存在时，可创建 `tp_users` 轻量用户。
  - 登录成功后更新 `web_login`、`web_first_login_time`、`web_last_login_time`。

- `GET /api/web/auth/me`
  - 返回当前登录用户。

### 5.4 前台接口

- `GET /api/web/home`
- `GET /api/web/info/list`
- `GET /api/web/info/{sourceType}/{sourceId}`
- `POST /api/web/info`
- `GET /api/web/project/list`
- `GET /api/web/project/{sourceType}/{sourceId}`
- `POST /api/web/project/order`
- `GET /api/web/order/my`
- `GET /api/web/order/{id}`
- `POST /api/web/order/{id}/refund`
- `POST /api/web/call`
- `GET /api/web/store/list`
- `GET /api/web/store/{id}`
- `GET /api/web/notice/list`
- `GET /api/web/notice/{id}`
- `POST /api/web/file/upload`

### 5.5 后台接口

- `POST /api/web/admin/auth/login`
- `GET /api/web/admin/config`
- `PUT /api/web/admin/config`
- `GET /api/web/admin/notice/list`
- `POST /api/web/admin/notice`
- `PUT /api/web/admin/notice/{id}`
- `DELETE /api/web/admin/notice/{id}`
- `GET /api/web/admin/info/list`
- `POST /api/web/admin/info/{id}/audit`
- `GET /api/web/admin/project/list`
- `POST /api/web/admin/project/{id}/audit`
- `GET /api/web/admin/order/list`
- `GET /api/web/admin/refund/list`
- `POST /api/web/admin/refund/{id}/handle`

### 5.6 接口文档要求

- 每次实现或修改后端接口，都必须同步维护接口文档 Markdown。
- 接口文档至少包含：路径、方法、登录要求、请求参数、响应字段、错误码、加密说明、关联表、前端 service 方法名。
- V1 接口文档大纲文件：`web-v1-api-outline.md`。
- 前端对接要求文件：`web-v1-frontend-guide.md`。

## 6. 双源查询规则

### 信息列表

来源：

- Web：`web_info`，只查 `audit_status=1`。
- 小程序：`tp_circle`，只查公开、未下架数据。

排序：

- 置顶优先。
- 最新发布优先。
- 分页统一由后端返回。

详情：

- `sourceType=web` 查 `web_info`。
- `sourceType=miniapp` 查 `tp_circle`。

### 项目列表

来源：

- Web：`web_project`，只查 `audit_status=1`。
- 小程序：`tp_addon_work`，只查已审核、公开、未下架数据。

下单：

- 无论项目来自 Web 还是小程序，都写入 `web_project_order`。
- 不写 `tp_addon_work` 订单字段。

### 商家列表

来源：

- `tp_store` 只读。

拨号：

- 前端调用 `POST /api/web/call` 记录后，再触发 `tel:` 或 App 原生拨号。

## 7. 前端页面规划

### 首页

目标：用户一进入就看到真实信息流，不再被大块功能区挡住。

布局建议：

- 顶部：城市/定位、搜索框、消息/我的入口。
- 公告：一行滚动或横向公告条。
- 快捷入口：信息、项目、商家、发布、订单，压缩成 4 到 5 个图标。
- 首屏主体：置顶信息 + 最新信息流。
- 底部 Tab：首页、信息、发布、项目、我的。

### 信息

- 信息列表支持 Web 和小程序双源混排。
- 卡片显示来源标签：`Web` / `小程序`。
- 详情页展示标题、内容、图片、地区、联系人、拨号按钮。
- 发布页登录后可进入，图片上传走 Java 接口。

### 项目

- 项目列表双源展示。
- 详情页展示预算、施工时间、地址、联系人。
- 下单页只生成意向单，不接支付。

### 商家

- 列表读取 `tp_store`。
- 详情展示商家介绍、公告、图片、联系方式。
- 拨打电话必须登录并记录。

### 我的

- 未登录：手机号验证码登录。
- 已登录：用户信息、我的发布、我的订单、退款申请入口。
- V1 不做钱包、会员、积分。

### 后台

- 登录。
- 配置管理。
- 公告管理。
- 信息审核。
- 项目审核。
- 订单列表。
- 退款处理。

## 8. 权限规则

- 未登录可访问：首页、信息列表、信息详情、项目列表、项目详情、商家列表、商家详情、公告。
- 登录后可访问：发布信息、项目下单、拨打电话、我的订单、退款申请。
- 后台接口使用独立管理员 token，不复用普通用户 token。

## 9. 并发与性能判断

预计几千到一万人量级，Spring Boot + MySQL 单实例可以满足 V1。重点不在分布式，而在基础工程质量：

- 列表接口必须分页。
- 核心筛选字段加索引。
- 双源列表避免一次性查全表。
- 图片使用对象存储或本地上传统一抽象。
- 管理后台列表按时间、状态分页。

暂不需要：

- MQ。
- 分库分表。
- Redis 强依赖。
- 复杂微服务拆分。

## 10. V1 开发阶段拆分

### 阶段 1：基础工程和数据库

- 确认 `web_` 表结构。
- 生成 SQL 迁移脚本。
- Java 增加 Web 配置项。
- 建立 `/api/web/**` 基础分层。
- React Web 工程初始化。

### 阶段 2：登录与首页

- 手机号验证码登录。
- 免校验配置。
- 当前用户接口。
- 首页接口。
- 首页移动端布局。

### 阶段 3：信息、项目、商家

- 信息双源列表和详情。
- Web 信息发布。
- 项目双源列表和详情。
- 项目下单。
- 商家列表和详情。
- 拨号记录。

### 阶段 4：我的与退款

- 我的发布。
- 我的订单。
- 订单详情。
- 退款申请。

### 阶段 5：最小后台

- 管理员登录。
- Web 配置维护。
- 公告 CRUD。
- 信息审核。
- 项目审核。
- 订单查看。
- 退款处理。

### 阶段 6：联调和验收

- 执行 SQL 到本地数据库副本。
- 后端接口联调。
- 前端移动端 375/390/430 宽度验证。
- 确认 Web 发布不写旧表。
- 确认旧小程序不展示 Web 新内容。

## 11. V1 验收清单

- 执行新增 SQL 后 Java 服务可连接本地数据库。
- 免校验验证码开启时，手机号 + `1` 可登录。
- 免校验关闭时，只能使用有效验证码登录。
- Web 新信息只写 `web_info`。
- Web 新项目只写 `web_project`。
- Web 项目下单只写 `web_project_order`。
- 小程序旧信息和 Web 新信息可在 Web 双源列表展示。
- 小程序旧项目和 Web 新项目可在 Web 双源列表展示。
- 未登录可浏览首页、列表和详情。
- 登录后可发布、下单、拨号、查看订单、申请退款。
- 拨号动作有 `web_call_record` 记录。
- 公告由后台发布，前台只展示已发布公告。
- 首页首屏可以看到置顶信息和最新信息流。

## 12. V2/V3 预留方向

- 会员体系。
- Web 新人红包。
- 付费置顶。
- 在线支付。
- 签到积分。
- 商家入驻 Web 化。
- WebView App 壳和 JSBridge。
- 推送通知。
- 更完整的后台权限和操作日志。
