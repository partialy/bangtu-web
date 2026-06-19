ALTER TABLE `web_notice`
    ADD COLUMN `summary` varchar(255) DEFAULT NULL COMMENT '公告摘要' AFTER `content`,
    ADD COLUMN `content_type` varchar(20) NOT NULL DEFAULT 'html' COMMENT '内容类型：html富文本 text纯文本' AFTER `summary`,
    ADD COLUMN `popup_enabled` tinyint NOT NULL DEFAULT 0 COMMENT '是否进入首页弹窗显示0否1是' AFTER `is_top`;
