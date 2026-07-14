import { ReactNode } from 'react'

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-4 text-center text-sm">{footer}</div>}
      </div>
    </div>
  )
}
