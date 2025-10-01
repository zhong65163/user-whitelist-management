import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// 管理员登录
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD
    const jwtSecret = process.env.JWT_SECRET

    if (!adminUsername || !adminPassword || !jwtSecret) {
      console.log('Environment check:', {
        hasAdminUsername: !!adminUsername,
        hasAdminPassword: !!adminPassword,
        hasJwtSecret: !!jwtSecret,
        adminUsername: adminUsername || 'MISSING'
      })
      return NextResponse.json({
        success: false,
        error: '服务器配置错误'
      }, { status: 500 })
    }

    // 验证管理员账户
    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json({
        success: false,
        error: '用户名或密码错误'
      }, { status: 401 })
    }

    // 生成JWT token
    const token = jwt.sign(
      { username: adminUsername, role: 'admin' },
      jwtSecret,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      success: true,
      message: '登录成功',
      token
    })

  } catch (error) {
    console.error('管理员登录错误:', error)
    return NextResponse.json({
      success: false,
      error: '登录失败'
    }, { status: 500 })
  }
}