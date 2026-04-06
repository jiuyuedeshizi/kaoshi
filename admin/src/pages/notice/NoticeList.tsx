import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { noticeAPI } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, Pin } from 'lucide-react'

const categoryMap: Record<string, { label: string; variant: 'secondary' | 'warning' | 'success' }> = {
  RECRUITMENT: { label: '招聘', variant: 'warning' },
  PUBLICITY: { label: '公示', variant: 'success' },
  NOTICE: { label: '通知', variant: 'secondary' },
}

export function NoticeList() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: () => noticeAPI.list(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => noticeAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] })
    },
  })

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>
  }

  const notices = data?.data?.items || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">公告管理</h1>
        <Link to="/notices/new">
          <Button><Plus className="w-4 h-4 mr-2" />新建公告</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>公告列表</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">标题</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">分类</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">发布时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">状态</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((notice: any) => (
                <tr key={notice.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {notice.pinned && <Pin className="w-4 h-4 text-red-500" />}
                      <span>{notice.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={categoryMap[notice.category]?.variant || 'secondary'}>
                      {categoryMap[notice.category]?.label || notice.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {notice.published_at?.slice(0, 10) || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={notice.published ? 'success' : 'secondary'}>
                      {notice.published ? '已发布' : '草稿'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/notices/${notice.id}/edit`}>
                      <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(notice.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
              {notices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    暂无公告
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
