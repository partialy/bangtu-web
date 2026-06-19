# AGENTS.md

This file provides guidance to Codex when working in `bangtu-web`.

## Project Structure

```
admin/              # Web 管理端，后续实现后台页面
dataserver-java/    # Spring Boot Java 后端，本目录是独立 Git 仓库，根仓库忽略它
web/                # React 移动端 Web 前台
others/docs/        # Web 规划、接口、前端对接等 Markdown 文档
others/sqls/        # 数据库迁移 SQL
```

## Git 协作规则

- `bangtu-web` 是 Web 协作根仓库，会推送到 GitHub：`https://github.com/partialy/bangtu-web.git`。
- `dataserver-java/` 是独立 Git 仓库，根仓库必须通过 `.gitignore` 忽略它，不要在 `bangtu-web` 根仓库提交 Java 子仓库内容。
- `hsf.sql` 是本地数据库副本，根仓库必须忽略；线上迁移只提交 `others/sqls/` 下带时间戳的迁移脚本。
- 压缩包、构建产物、依赖目录、环境变量文件不得提交。
- 每次开始实现前必须先在 `bangtu-web` 根目录执行 `git pull --rebase` 拉取最新代码，避免覆盖其他 AI 或开发者提交。
- 每次实现完成并验证后，用中文提交信息提交并推送到远程仓库。
- 前端 AI 主要负责 `web/`、`admin/` 和前端文档；后端实现者主要负责 Java 独立仓库和 `others/docs`、`others/sqls` 中的后端/数据库文档。
- 如果本地存在他人未提交改动，先确认改动来源和范围，不要覆盖、不回滚无关改动。

## Web V1 文件归档规则

- `帮涂/` 目录只作为旧小程序和 PHP 后台参考，不保存 Web V1 新代码、SQL 或规划文档。
- Web V1 文档统一放在 `others/docs/`。
- Web V1 数据库脚本统一放在 `others/sqls/`。
- SQL 迁移脚本文件名必须带时间戳，格式建议为 `YYMMDDHHmm-说明.sql`，例如 `2606191357-web-v1-schema.sql`，方便后续按顺序迁移到线上。
- 新增或修改数据库结构时，必须同步更新对应计划/接口文档，说明表边界、字段用途和迁移注意事项。

## Java 后端规范

- Java Web V1 代码统一放在 `dataserver-java/src/main/java/cn/example/dataserver/web/`，不要散落到旧接口包里。
- Web 包建议结构：`controller`、`services`、`entity`、`dto`、`mapper`、`config`、`interceptor`、`crypto`、`constant`。
- 数据库操作使用 MyBatis-Plus。基础 CRUD 使用 `IService`/`ServiceImpl`，复杂双源查询再使用 Mapper XML。
- Controller 只接收参数、做基础校验、调用 Service、返回结果；业务逻辑放在 `services/*BisService.java`。
- Web V1 API 统一返回 `cn.example.dataserver.common.Result` JSON。
- 加密响应统一使用 `{ "enc": true, "encData": "base64" }`，Base64 解码并 AES 解密后的内容必须是 `Result` JSON 字符串。
- 每次实现或修改后端接口，必须同步更新 `others/docs/web-v1-api-outline.md` 或后续正式接口文档。接口文档必须包含路径、方法、鉴权要求、请求参数、响应字段、错误情况、加密行为、关联表和前端 service 方法名。

## React 前端规范

- React Web 代码统一放在 `web/`。
- 可复用工具代码模板在 `E:\Projects\Node\utils\src\FallBack\pure\tailwind`，例如消息、通知、对话框等；需要时可以直接复制到当前前端项目中再按本项目结构整理。
- 前端需要弹窗、操作确认、重要提示时，优先复制并使用 `E:\Projects\Node\utils\src\FallBack\pure\MyDialog.ts`。
- 发布成功、保存成功、复制成功等轻提示，优先复制并使用 `E:\Projects\Node\utils\src\FallBack\pure\tailwind\message.ts`。
- 其他工具模板不要预先全量复制，有明确需求时再从模板目录复制进来。
- 请求必须集中封装到 `web/src/services/` 并导出类型安全方法。
- 页面和 UI 组件禁止直接写 `fetch('/xxx')`、`axios('/xxx')` 或硬编码 `/api/web/**` 请求。
- 加密解密、token 注入、Result 解析、401 处理必须在统一请求层完成。
- 前端实现前先阅读 `others/docs/web-v1-frontend-guide.md`。
- 网站视觉风格使用简约白蓝配色，整体应保持干净、轻量、偏移动 App 的实用界面，不做厚重营销风格。

## Current Web V1 Documents

- `others/docs/web-v1-plan.md`
- `others/docs/web-v1-frontend-guide.md`
- `others/docs/web-v1-api-outline.md`
- `others/sqls/2606191357-web-v1-schema.sql`
