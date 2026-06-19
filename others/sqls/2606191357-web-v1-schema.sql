-- 帮涂 Web V1 数据库脚本
-- 基准：E:\Projects\xianyu\20260310\hsf.sql 当前结构
-- 原则：Web 新业务统一使用 web_ 前缀表；旧 tp_ 内容表只读展示，不写入 Web 新数据。
-- 注意：脚本按非破坏性方式编写，不删除已有 web_ 表；生产执行前仍必须备份数据库。

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- tp_users：补充 Web 登录标记字段
-- --------------------------------------------------------
DROP PROCEDURE IF EXISTS `add_web_v1_user_columns`;
DELIMITER $$
CREATE PROCEDURE `add_web_v1_user_columns`()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tp_users' AND COLUMN_NAME = 'web_login'
  ) THEN
    ALTER TABLE `tp_users` ADD COLUMN `web_login` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否在Web登录过0否1是' AFTER `dy_info`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tp_users' AND COLUMN_NAME = 'web_first_login_time'
  ) THEN
    ALTER TABLE `tp_users` ADD COLUMN `web_first_login_time` datetime NULL DEFAULT NULL COMMENT 'Web首次登录时间' AFTER `web_login`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tp_users' AND COLUMN_NAME = 'web_last_login_time'
  ) THEN
    ALTER TABLE `tp_users` ADD COLUMN `web_last_login_time` datetime NULL DEFAULT NULL COMMENT 'Web最后登录时间' AFTER `web_first_login_time`;
  END IF;
END$$
DELIMITER ;
CALL `add_web_v1_user_columns`();
DROP PROCEDURE IF EXISTS `add_web_v1_user_columns`;

-- --------------------------------------------------------
-- web_config：Web 独立配置表
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `web_config` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `config_key` varchar(100) NOT NULL COMMENT '配置键',
  `config_value` text NULL COMMENT '配置值',
  `value_type` varchar(20) NOT NULL DEFAULT 'string' COMMENT '值类型string字符串 number数字 boolean布尔 json对象',
  `group_name` varchar(50) NOT NULL DEFAULT 'default' COMMENT '配置分组',
  `remark` varchar(255) NULL DEFAULT NULL COMMENT '配置说明',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_web_config_key` (`config_key`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Web配置表';

-- --------------------------------------------------------
-- web_sms_code：Web 验证码记录表
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `web_sms_code` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '验证码ID',
  `mobile` varchar(20) NOT NULL COMMENT '手机号',
  `code` varchar(10) NOT NULL COMMENT '验证码',
  `scene` varchar(30) NOT NULL DEFAULT 'login' COMMENT '使用场景login登录',
  `expire_time` datetime NOT NULL COMMENT '过期时间',
  `used` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已使用0否1是',
  `used_at` datetime NULL DEFAULT NULL COMMENT '使用时间',
  `ip` varchar(64) NULL DEFAULT NULL COMMENT '请求IP',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_web_sms_mobile_scene` (`mobile`, `scene`, `created_at`) USING BTREE,
  KEY `idx_web_sms_expire` (`expire_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Web验证码记录表';

-- --------------------------------------------------------
-- web_info：Web 发布信息表
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `web_info` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '信息ID',
  `user_id` int unsigned NOT NULL DEFAULT 0 COMMENT '发布用户ID',
  `title` varchar(200) NOT NULL COMMENT '标题',
  `content` text NOT NULL COMMENT '内容',
  `category_id` int unsigned NOT NULL DEFAULT 0 COMMENT '分类ID',
  `category_name` varchar(100) NULL DEFAULT NULL COMMENT '分类名称',
  `images` longtext NULL COMMENT '图片JSON数组字符串',
  `contact_name` varchar(100) NULL DEFAULT NULL COMMENT '联系人',
  `contact_mobile` varchar(20) NULL DEFAULT NULL COMMENT '联系电话',
  `province` varchar(100) NULL DEFAULT NULL COMMENT '省份',
  `city` varchar(100) NULL DEFAULT NULL COMMENT '城市',
  `district` varchar(100) NULL DEFAULT NULL COMMENT '区县',
  `address` varchar(255) NULL DEFAULT NULL COMMENT '详细地址',
  `longitude` varchar(50) NULL DEFAULT NULL COMMENT '经度',
  `latitude` varchar(50) NULL DEFAULT NULL COMMENT '纬度',
  `audit_status` tinyint NOT NULL DEFAULT 0 COMMENT '审核状态0待审核1已通过2已拒绝3已下架',
  `audit_remark` varchar(255) NULL DEFAULT NULL COMMENT '审核备注',
  `is_top` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否置顶0否1是',
  `top_start_time` datetime NULL DEFAULT NULL COMMENT '置顶开始时间',
  `top_end_time` datetime NULL DEFAULT NULL COMMENT '置顶结束时间',
  `view_count` int unsigned NOT NULL DEFAULT 0 COMMENT '浏览次数',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_web_info_list` (`audit_status`, `is_top`, `created_at`) USING BTREE,
  KEY `idx_web_info_user` (`user_id`, `created_at`) USING BTREE,
  KEY `idx_web_info_category` (`category_id`, `audit_status`, `created_at`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Web发布信息表';

-- --------------------------------------------------------
-- web_project：Web 项目表
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `web_project` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '项目ID',
  `user_id` int unsigned NOT NULL DEFAULT 0 COMMENT '发布用户ID',
  `title` varchar(200) NOT NULL COMMENT '项目标题',
  `content` text NOT NULL COMMENT '项目内容',
  `budget_amount` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT '预算金额',
  `construction_time` varchar(100) NULL DEFAULT NULL COMMENT '施工时间',
  `contact_name` varchar(100) NULL DEFAULT NULL COMMENT '联系人',
  `contact_mobile` varchar(20) NULL DEFAULT NULL COMMENT '联系电话',
  `province` varchar(100) NULL DEFAULT NULL COMMENT '省份',
  `city` varchar(100) NULL DEFAULT NULL COMMENT '城市',
  `district` varchar(100) NULL DEFAULT NULL COMMENT '区县',
  `address` varchar(255) NULL DEFAULT NULL COMMENT '项目地址',
  `longitude` varchar(50) NULL DEFAULT NULL COMMENT '经度',
  `latitude` varchar(50) NULL DEFAULT NULL COMMENT '纬度',
  `images` longtext NULL COMMENT '图片JSON数组字符串',
  `audit_status` tinyint NOT NULL DEFAULT 0 COMMENT '审核状态0待审核1已通过2已拒绝3已下架',
  `audit_remark` varchar(255) NULL DEFAULT NULL COMMENT '审核备注',
  `is_top` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否置顶0否1是',
  `view_count` int unsigned NOT NULL DEFAULT 0 COMMENT '浏览次数',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_web_project_list` (`audit_status`, `is_top`, `created_at`) USING BTREE,
  KEY `idx_web_project_user` (`user_id`, `created_at`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Web项目表';

-- --------------------------------------------------------
-- web_project_order：Web 项目订单/意向单表
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `web_project_order` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(50) NOT NULL COMMENT '订单编号',
  `user_id` int unsigned NOT NULL DEFAULT 0 COMMENT '下单用户ID',
  `source_type` varchar(20) NOT NULL COMMENT '项目来源web网页 miniapp小程序',
  `source_id` bigint unsigned NOT NULL COMMENT '来源项目ID',
  `project_title` varchar(200) NULL DEFAULT NULL COMMENT '项目标题快照',
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT '订单金额',
  `contact_name` varchar(100) NULL DEFAULT NULL COMMENT '联系人',
  `contact_mobile` varchar(20) NULL DEFAULT NULL COMMENT '联系电话',
  `remark` varchar(500) NULL DEFAULT NULL COMMENT '下单备注',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '订单状态0待处理1已受理2已完成3已取消',
  `refund_status` tinyint NOT NULL DEFAULT 0 COMMENT '退款状态0无退款1申请中2已同意3已拒绝',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_web_order_no` (`order_no`) USING BTREE,
  KEY `idx_web_order_user` (`user_id`, `created_at`) USING BTREE,
  KEY `idx_web_order_source` (`source_type`, `source_id`) USING BTREE,
  KEY `idx_web_order_status` (`status`, `refund_status`, `created_at`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Web项目订单表';

-- --------------------------------------------------------
-- web_order_refund：Web 订单退款申请表
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `web_order_refund` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '退款申请ID',
  `order_id` bigint unsigned NOT NULL COMMENT 'Web订单ID',
  `user_id` int unsigned NOT NULL DEFAULT 0 COMMENT '申请用户ID',
  `reason` varchar(500) NOT NULL COMMENT '退款原因',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '处理状态0待处理1已同意2已拒绝',
  `admin_id` bigint unsigned NULL DEFAULT NULL COMMENT '处理管理员ID',
  `admin_remark` varchar(500) NULL DEFAULT NULL COMMENT '后台处理备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `handled_at` datetime NULL DEFAULT NULL COMMENT '处理时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_web_refund_order` (`order_id`) USING BTREE,
  KEY `idx_web_refund_user` (`user_id`, `created_at`) USING BTREE,
  KEY `idx_web_refund_status` (`status`, `created_at`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Web订单退款申请表';

-- --------------------------------------------------------
-- web_call_record：Web 拨打电话记录表
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `web_call_record` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '拨号记录ID',
  `user_id` int unsigned NOT NULL DEFAULT 0 COMMENT '用户ID',
  `target_type` varchar(20) NOT NULL COMMENT '目标类型info信息 project项目 store商家',
  `source_type` varchar(20) NOT NULL COMMENT '来源web网页 miniapp小程序',
  `source_id` bigint unsigned NOT NULL COMMENT '来源ID',
  `mobile` varchar(20) NOT NULL COMMENT '拨打手机号',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '拨打时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_web_call_user` (`user_id`, `created_at`) USING BTREE,
  KEY `idx_web_call_target` (`target_type`, `source_type`, `source_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Web拨打电话记录表';

-- --------------------------------------------------------
-- web_notice：Web 公告表
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `web_notice` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '公告ID',
  `title` varchar(200) NOT NULL COMMENT '公告标题',
  `content` text NOT NULL COMMENT '公告内容',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态0草稿1已发布2已下架',
  `is_top` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否置顶0否1是',
  `publish_time` datetime NULL DEFAULT NULL COMMENT '发布时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_web_notice_list` (`status`, `is_top`, `publish_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Web公告表';

-- --------------------------------------------------------
-- web_admin_user：Web 后台管理员表
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `web_admin_user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username` varchar(50) NOT NULL COMMENT '账号',
  `password_hash` varchar(100) NOT NULL COMMENT '密码哈希',
  `nickname` varchar(50) NULL DEFAULT NULL COMMENT '昵称',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态0禁用1启用',
  `last_login_time` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_web_admin_username` (`username`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Web后台管理员表';

-- --------------------------------------------------------
-- web_audit_log：Web 审核日志表
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `web_audit_log` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '审核日志ID',
  `admin_id` bigint unsigned NULL DEFAULT NULL COMMENT '管理员ID',
  `target_type` varchar(30) NOT NULL COMMENT '审核对象info信息 project项目 notice公告 refund退款',
  `target_id` bigint unsigned NOT NULL COMMENT '审核对象ID',
  `action` varchar(30) NOT NULL COMMENT '操作pass通过 reject拒绝 offline下架 handle处理',
  `before_status` varchar(30) NULL DEFAULT NULL COMMENT '操作前状态',
  `after_status` varchar(30) NULL DEFAULT NULL COMMENT '操作后状态',
  `remark` varchar(500) NULL DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_web_audit_target` (`target_type`, `target_id`) USING BTREE,
  KEY `idx_web_audit_admin` (`admin_id`, `created_at`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Web审核日志表';

-- --------------------------------------------------------
-- Web V1 默认配置
-- --------------------------------------------------------
INSERT INTO `web_config` (`config_key`, `config_value`, `value_type`, `group_name`, `remark`) VALUES
('phone_login_bypass_enabled', 'true', 'boolean', 'auth', '是否开启手机号免校验登录'),
('phone_login_bypass_code', '1', 'string', 'auth', '免校验登录固定验证码'),
('sms_send_enabled', 'false', 'boolean', 'sms', '是否真实发送短信开发环境默认关闭'),
('info_auto_audit', 'true', 'boolean', 'publish', 'Web发布信息是否自动审核通过'),
('project_auto_audit', 'true', 'boolean', 'publish', 'Web项目是否自动审核通过'),
('home_notice_limit', '3', 'number', 'home', '首页公告数量'),
('home_top_info_limit', '5', 'number', 'home', '首页置顶信息数量')
ON DUPLICATE KEY UPDATE
  `config_value` = VALUES(`config_value`),
  `value_type` = VALUES(`value_type`),
  `group_name` = VALUES(`group_name`),
  `remark` = VALUES(`remark`),
  `updated_at` = CURRENT_TIMESTAMP;

SET FOREIGN_KEY_CHECKS = 1;
