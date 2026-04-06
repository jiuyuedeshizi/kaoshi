import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { applicationAPI } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const statusMap: Record<string, { label: string; variant: 'secondary' | 'warning' | 'success' | 'destructive' }> = {
  DRAFT: { label: '草稿', variant: 'secondary' },
  SUBMITTED: { label: '待审核', variant: 'warning' },
  APPROVED: { label: '已通过', variant: 'success' },
  REJECTED: { label: '已驳回', variant: 'destructive' },
  PAID: { label: '已缴费', variant: 'secondary' },
}

export function ApplicationList() {
  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationAPI.list({ page: 1, page_size: 20 }),
  })

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>
  }

  const applications = data?.data?.items || []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">报名审核</h1>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">考生</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">考试项目</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">职位</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">提交时间</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app: any) => (
              <tr key={app.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium">{app.user?.name}</div>
                  <div className="text-xs text-slate-500">{app.user?.id_card}</div>
                </td>
                <td className="px-4 py-3 text-sm">{app.exam_project?.title}</td>
                <td className="px-4 py-3 text-sm">{app.job_position?.name || '-'}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusMap[app.status]?.variant || 'secondary'}>
                    {statusMap[app.status]?.label || app.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {app.submitted_at?.slice(0, 10) || '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/applications/${app.id}`}>
                    <Button variant="ghost" size="sm">查看详情</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
