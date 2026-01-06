# LeanCloud 设置指南

## 1. 创建 LeanCloud 应用

1. 访问 [LeanCloud 控制台](https://console.leancloud.cn/)
2. 注册/登录账号
3. 创建新应用（选择开发版，免费）
4. 进入应用 → 设置 → 应用凭证，获取：
   - AppID
   - AppKey
   - REST API 服务器地址

## 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```
VITE_LEANCLOUD_APP_ID=你的AppId
VITE_LEANCLOUD_APP_KEY=你的AppKey
VITE_LEANCLOUD_SERVER_URL=https://xxx.lc-cn-n1-shared.com
```

## 3. 创建管理员账户

在 LeanCloud 控制台：
1. 进入 数据存储 → 结构化数据 → _User
2. 点击「添加行」
3. 填写 username 和 password（会自动加密）

## 4. 数据表说明

系统会自动创建以下数据表：
- `CoupleInfo` - 情侣信息
- `Anniversary` - 纪念日
- `Post` - 动态帖子
- `Comment` - 评论
- `_User` - 用户（管理员）

## 5. 安全设置（可选）

进入 设置 → 安全中心：
- 添加 Web 安全域名（你的网站域名）
- 开启 API 访问控制

## 免费额度

开发版免费额度：
- API 请求：30,000 次/天
- 数据存储：1 GB
- 文件存储：1 GB
- 完全够个人网站使用
