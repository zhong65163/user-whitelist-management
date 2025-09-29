import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

// 本地存储文件路径
const DATA_FILE = path.join(process.cwd(), 'data', 'whitelist.json')
const LOGS_FILE = path.join(process.cwd(), 'data', 'logs.json')

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

// 记录日志
function logAccess(username: string, ip: string, success: boolean) {
  try {
    ensureDataDir()
    const logEntry = {
      username,
      timestamp: new Date().toISOString(),
      ip: ip || 'unknown',
      success
    }

    let logs = []
    if (fs.existsSync(LOGS_FILE)) {
      const data = fs.readFileSync(LOGS_FILE, 'utf8')
      logs = JSON.parse(data) || []
    }

    logs.push(logEntry)
    // 只保留最近1000条日志
    if (logs.length > 1000) {
      logs = logs.slice(-1000)
    }

    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2))
  } catch (error) {
    console.error('记录日志失败:', error)
  }
}

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

    // 从本地文件获取用户白名单
    const whitelist = getWhitelist()

    // 检查用户是否在白名单中
    const isAllowed = whitelist.includes(username.toLowerCase().trim())

    // 记录访问日志
    logAccess(username, request.ip || '', isAllowed)

    if (!isAllowed) {
      return NextResponse.json({
        success: false,
        error: '用户未授权，请联系管理员'
      }, { status: 403 })
    }

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