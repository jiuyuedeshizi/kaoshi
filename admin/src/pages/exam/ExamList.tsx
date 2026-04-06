import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { examAPI } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2 } from 'lucide-react'

export function ExamList() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: () => examAPI.list({ page: 1, page_size: 20 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => examAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] })
    },
  })

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>
  }

  const exams = data?.data?.items || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">考试管理</h1>
        <Link to="/exams/new">
          <Button><Plus className="w-4 h-4 mr-2" />新建考试</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">考试名称</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">报名时间</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">费用</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">状态</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam: any) => (
              <tr key={exam.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/exams/${exam.id}/edit`} className="text-blue-600 hover:underline">
                    {exam.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {exam.registration_start?.slice(0, 10)} ~ {exam.registration_end?.slice(0, 10)}
                </td>
                <td className="px-4 py-3">¥{exam.fee}</td>
                <td className="px-4 py-3">
                  <Badge variant={exam.published ? 'success' : 'secondary'}>
                    {exam.published ? '已发布' : '草稿'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/exams/${exam.id}/edit`}>
                    <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(exam.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
