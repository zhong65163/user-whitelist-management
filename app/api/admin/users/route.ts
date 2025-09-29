import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import * as fs from 'fs'
import * as path from 'path'

// 验证管理员token
function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('缺少认证token')
  }

  const token = authHeader.substring(7)
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error('JWT密钥未配置')
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as any
    if (decoded.role !== 'admin') {
      throw new Error('权限不足')
    }
    return decoded
  } catch (error) {
    throw new Error('无效的认证token')
  }
}

// 本地存储文件路径
const DATA_FILE = path.join(process.cwd(), 'data', 'whitelist.json')

// 确保数据目录存在
function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// 获取白名单
function getWhitelist(): string[] {
  try {
    ensureDataDir()
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(data) || []
    }
    return []
  } catch (error) {
    console.error('读取白名单失败:', error)
    return []
  }
}

// 保存白名单
function saveWhitelist(whitelist: string[]) {
  try {
    ensureDataDir()
    fs.writeFileSync(DATA_FILE, JSON.stringify(whitelist, null, 2))
  } catch (error) {
    console.error('保存白名单失败:', error)
    throw error
  }
}

// 获取用户列表
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    verifyAdminToken(request)

    // 获取用户白名单
    const whitelist = getWhitelist()

    return NextResponse.json({
      success: true,
      users: whitelist,
      count: whitelist.length
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || '获取用户列表失败'
    }, { status: 401 })
  }
}

// 添加用户
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    verifyAdminToken(request)

    const { username } = await request.json()

    if (!username || username.trim() === '') {
      return NextResponse.json({
        success: false,
        error: '用户名不能为空'
      }, { status: 400 })
    }

    const cleanUsername = username.toLowerCase().trim()

    // 获取当前白名单
    const whitelist = getWhitelist()

    // 检查用户是否已存在
    if (whitelist.includes(cleanUsername)) {
      return NextResponse.json({
        success: false,
        error: '用户已存在'
      }, { status: 400 })
    }

    // 添加用户到白名单
    const newWhitelist = [...whitelist, cleanUsername]
    saveWhitelist(newWhitelist)

    return NextResponse.json({
      success: true,
      message: '用户添加成功',
      username: cleanUsername
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || '添加用户失败'
    }, { status: 401 })
  }
}

// 删除用户
export async function DELETE(request: NextRequest) {
  try {
    // 验证管理员权限
    verifyAdminToken(request)

    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({
        success: false,
        error: '用户名不能为空'
      }, { status: 400 })
    }

    const cleanUsername = username.toLowerCase().trim()

    // 获取当前白名单
    const whitelist = getWhitelist()

    // 检查用户是否存在
    if (!whitelist.includes(cleanUsername)) {
      return NextResponse.json({
        success: false,
        error: '用户不存在'
      }, { status: 404 })
    }

    // 从白名单中移除用户
    const newWhitelist = whitelist.filter(u => u !== cleanUsername)
    saveWhitelist(newWhitelist)

    return NextResponse.json({
      success: true,
      message: '用户删除成功',
      username: cleanUsername
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || '删除用户失败'
    }, { status: 401 })
  }
}