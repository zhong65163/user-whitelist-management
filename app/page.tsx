'use client'

import { useState, useEffect } from 'react'

interface User {
  username: string
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState('')
  const [users, setUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // 登录表单状态
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  })

  // 添加用户表单状态
  const [newUsername, setNewUsername] = useState('')

  // 检查本地存储的token
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token')
    if (savedToken) {
      setToken(savedToken)
      setIsLoggedIn(true)
      fetchUsers(savedToken)
    }
  }, [])

  // 管理员登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      })

      const data = await response.json()

      if (data.success) {
        setToken(data.token)
        setIsLoggedIn(true)
        localStorage.setItem('admin_token', data.token)
        fetchUsers(data.token)
        setMessage('登录成功')
      } else {
        setMessage(data.error || '登录失败')
      }
    } catch (error) {
      setMessage('网络错误，请稍后重试')
    }

    setLoading(false)
  }

  // 获取用户列表
  const fetchUsers = async (authToken?: string) => {
    const currentToken = authToken || token
    if (!currentToken) return

    try {
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      })

      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
      } else {
        setMessage(data.error || '获取用户列表失败')
      }
    } catch (error) {
      setMessage('获取用户列表失败')
    }
  }

  // 添加用户
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUsername.trim()) {
      setMessage('用户名不能为空')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: newUsername })
      })

      const data = await response.json()

      if (data.success) {
        setNewUsername('')
        fetchUsers()
        setMessage(`用户 "${data.username}" 添加成功`)
      } else {
        setMessage(data.error || '添加用户失败')
      }
    } catch (error) {
      setMessage('添加用户失败')
    }

    setLoading(false)
  }

  // 删除用户
  const handleDeleteUser = async (username: string) => {
    if (!confirm(`确定要删除用户 "${username}" 吗？`)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      })

      const data = await response.json()

      if (data.success) {
        fetchUsers()
        setMessage(`用户 "${username}" 删除成功`)
      } else {
        setMessage(data.error || '删除用户失败')
      }
    } catch (error) {
      setMessage('删除用户失败')
    }

    setLoading(false)
  }

  // 退出登录
  const handleLogout = () => {
    setIsLoggedIn(false)
    setToken('')
    setUsers([])
    localStorage.removeItem('admin_token')
    setMessage('已退出登录')
  }

  // 未登录显示登录界面
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            用户白名单管理系统
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                管理员用户名
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              message.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    )
  }

  // 已登录显示管理界面
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">用户白名单管理</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* 添加用户表单 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">添加新用户</h2>
          <form onSubmit={handleAddUser} className="flex gap-4">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="输入用户名"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '添加中...' : '添加用户'}
            </button>
          </form>
        </div>

        {/* 用户列表 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              已授权用户 ({users.length})
            </h2>
            <button
              onClick={() => fetchUsers()}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              刷新列表
            </button>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无授权用户
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((username) => (
                <div key={username} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-gray-800">{username}</span>
                  <button
                    onClick={() => handleDeleteUser(username)}
                    disabled={loading}
                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">API使用说明</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p><strong>验证用户API:</strong> POST /api/verify-user</p>
            <p><strong>请求参数:</strong> {"{"}"username": "用户名"{"}"}</p>
            <p><strong>返回:</strong> {"{"}"success": true/false, "message": "提示信息"{"}"}</p>
            <p className="mt-3 text-blue-600">
              在你的软件中调用此API验证用户是否在白名单中
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}