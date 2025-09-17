import './globals.css'

export const metadata = {
  title: '用户白名单管理系统',
  description: '简单的软件用户授权管理系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}