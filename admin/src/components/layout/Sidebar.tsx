import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  FileText,
  Users,
  MapPin,
  Calendar,
  Ticket,
  BarChart,
  Settings,
  Bell,
  ShoppingCart,
  Briefcase,
} from 'lucide-react'

const menuItems = [
  { path: '/', label: '控制台', icon: LayoutDashboard },
  { path: '/exams', label: '考试管理', icon: FileText },
  { path: '/applications', label: '报名审核', icon: Users },
  { path: '/venues/areas', label: '考区管理', icon: MapPin },
  { path: '/venues', label: '考点管理', icon: MapPin },
  { path: '/scheduling', label: '考场编排', icon: Calendar },
  { path: '/tickets', label: '准考证', icon: Ticket },
  { path: '/jobs', label: '招聘岗位', icon: Briefcase },
  { path: '/scores/import', label: '成绩管理', icon: BarChart },
  { path: '/notices', label: '公告管理', icon: Bell },
  { path: '/orders', label: '订单管理', icon: ShoppingCart },
  { path: '/users', label: '用户管理', icon: Users },
  { path: '/settings', label: '系统设置', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold">考试管理系统</h1>
      </div>
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))

          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
