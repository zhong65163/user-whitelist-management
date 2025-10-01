import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD
  const jwtSecret = process.env.JWT_SECRET

  return NextResponse.json({
    hasAdminUsername: !!adminUsername,
    hasAdminPassword: !!adminPassword,
    hasJwtSecret: !!jwtSecret,
    adminUsername: adminUsername || 'NOT_SET',
    // 不显示敏感信息的完整值
    passwordLength: adminPassword?.length || 0,
    secretLength: jwtSecret?.length || 0
  })
}