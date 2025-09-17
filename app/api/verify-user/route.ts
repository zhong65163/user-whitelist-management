import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

// 软件验证API - 检查用户是否在白名单中
export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({
        success: false,
        error: '用户名不能为空'
      }, { status: 400 })
    }

    // 从KV存储获取用户白名单
    const whitelist = await kv.get('user_whitelist') as string[] || []

    // 检查用户是否在白名单中
    const isAllowed = whitelist.includes(username.toLowerCase().trim())

    if (!isAllowed) {
      return NextResponse.json({
        success: false,
        error: '用户未授权，请联系管理员'
      }, { status: 403 })
    }

    // 记录登录日志
    const loginLogKey = `login:${username}:${Date.now()}`
    await kv.set(loginLogKey, {
      username,
      timestamp: new Date().toISOString(),
      ip: request.ip || 'unknown'
    }, { ex: 30 * 24 * 60 * 60 }) // 30天过期

    return NextResponse.json({
      success: true,
      message: '用户验证成功',
      username: username
    })

  } catch (error) {
    console.error('用户验证API错误:', error)
    return NextResponse.json({
      success: false,
      error: '服务器错误'
    }, { status: 500 })
  }
}

// 支持OPTIONS请求 (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}