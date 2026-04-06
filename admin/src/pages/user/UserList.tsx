import { useQuery } from '@tanstack/react-query'
import { userAPI } from '@/api/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function UserList() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userAPI.list({ page: 1, page_size: 20 }),
  })

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>
  }

  const users = data?.data?.items || []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">用户管理</h1>

      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">用户名</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">姓名</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">角色</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">状态</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm">{user.id}</td>
                  <td className="px-4 py-3 text-sm">{user.username}</td>
                  <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-sm">{user.role}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.disabled ? 'destructive' : 'success'}>
                      {user.disabled ? '禁用' : '正常'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    暂无用户数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
