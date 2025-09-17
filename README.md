# 用户白名单管理系统

一个简单的软件用户授权管理系统，支持添加/删除用户白名单，只有在白名单中的用户才能使用你的软件。

## 功能特性

- ✅ 管理员登录后台
- ✅ 添加/删除用户到白名单
- ✅ 软件用户验证API
- ✅ 简洁的管理界面
- ✅ 基于Vercel KV的数据存储

## 快速部署到Vercel

### 1. 准备工作
1. 注册 [Vercel](https://vercel.com) 账户
2. 安装 [Vercel CLI](https://vercel.com/cli)

### 2. 部署步骤

```bash
# 克隆项目到本地
cd user-whitelist

# 安装依赖
npm install

# 登录Vercel
vercel login

# 部署项目
vercel --prod

# 添加KV存储
vercel kv create user-whitelist-db

# 设置环境变量
vercel env add ADMIN_USERNAME
# 输入: admin

vercel env add ADMIN_PASSWORD
# 输入你的管理员密码

vercel env add JWT_SECRET
# 输入一个随机字符串作为JWT密钥

# 重新部署
vercel --prod
```

### 3. 配置KV数据库

部署完成后，Vercel会自动为你的项目分配KV数据库连接信息。

## 使用方法

### 管理员后台

1. 访问你的Vercel部署地址 (如: https://your-app.vercel.app)
2. 使用设置的管理员账户登录
3. 添加或删除用户白名单

### 在你的软件中集成

在Lucky Boat Monitor中调用验证API:

```typescript
// 验证用户是否在白名单中
const verifyUser = async (username: string) => {
  try {
    const response = await fetch('https://your-app.vercel.app/api/verify-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    })

    const data = await response.json()

    if (data.success) {
      console.log('用户验证成功')
      // 允许用户使用软件
      return true
    } else {
      console.log('用户未授权:', data.error)
      // 阻止用户使用软件
      return false
    }
  } catch (error) {
    console.error('验证失败:', error)
    return false
  }
}
```

## API文档

### 验证用户API
- **URL**: `POST /api/verify-user`
- **参数**: `{ "username": "用户名" }`
- **返回**: `{ "success": true/false, "message": "提示信息" }`

### 管理员API (需要认证)
- **登录**: `POST /api/admin/login`
- **获取用户**: `GET /api/admin/users`
- **添加用户**: `POST /api/admin/users`
- **删除用户**: `DELETE /api/admin/users`

## 环境变量说明

- `ADMIN_USERNAME`: 管理员用户名 (默认: admin)
- `ADMIN_PASSWORD`: 管理员密码 (请设置强密码)
- `JWT_SECRET`: JWT签名密钥 (随机字符串)
- `KV_REST_API_URL`: Vercel KV数据库URL (自动生成)
- `KV_REST_API_TOKEN`: Vercel KV访问令牌 (自动生成)

## 安全建议

1. 设置强密码作为管理员密码
2. 定期更换JWT密钥
3. 建议为管理后台设置HTTPS访问
4. 可以为API添加请求频率限制

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Vercel KV (数据存储)
- JWT认证

## 许可证

MIT License