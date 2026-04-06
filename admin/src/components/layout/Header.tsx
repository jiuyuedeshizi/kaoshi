import { useAuthStore } from '@/stores/authStore'
import { LogOut } from 'lucide-react'

export function Header() {
  const { user, logout } = useAuthStore()

  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">欢迎回来，{user?.name || '管理员'}</h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">{user?.role}</span>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <LogOut className="w-4 h-4" />
          退出
        </button>
      </div>
    </header>
  )
}
