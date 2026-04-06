import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react'

interface Job {
  id: number
  title: string
  department: string
  location: string
  salary_range: string
  status: 'OPEN' | 'CLOSED' | 'DRAFT'
  created_at: string
}

const statusMap: Record<string, { label: string; variant: 'success' | 'secondary' | 'warning' }> = {
  OPEN: { label: '招聘中', variant: 'success' },
  CLOSED: { label: '已结束', variant: 'secondary' },
  DRAFT: { label: '草稿', variant: 'warning' },
}

export function JobList() {
  // Mock data for demonstration - replace with actual API call
  const { data, isLoading } = useQuery<{ data: Job[] }>({
    queryKey: ['jobs'],
    queryFn: async () => {
      // Placeholder: replace with jobAPI.list() when available
      return { data: [] as Job[] }
    },
  })

  const jobs = data?.data || []

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">招聘岗位管理</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />新建岗位
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>岗位列表</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">岗位名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">部门</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">工作地点</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">薪资范围</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">发布时间</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span>{job.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{job.department}</td>
                  <td className="px-4 py-3">{job.location}</td>
                  <td className="px-4 py-3">{job.salary_range}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusMap[job.status]?.variant || 'secondary'}>
                      {statusMap[job.status]?.label || job.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {job.created_at?.slice(0, 10) || '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    暂无岗位数据
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
