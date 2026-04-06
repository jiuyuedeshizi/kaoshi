import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users } from 'lucide-react'

interface ScheduledExam {
  id: number
  exam_id: number
  exam_title: string
  venue_name: string
  room_name: string
  scheduled_date: string
  capacity: number
  assigned_count: number
}

export function Scheduling() {
  const { data, isLoading } = useQuery<{ data: ScheduledExam[] }>({
    queryKey: ['scheduled-exams'],
    queryFn: async () => {
      // Placeholder: replace with actual API call
      return { data: [] as ScheduledExam[] }
    },
  })

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>
  }

  const scheduledExams = data?.data || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">考场编排</h1>
        <Button>
          <Calendar className="w-4 h-4 mr-2" />自动编排
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">待编排考试</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">已安排考点</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">已安排座位</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>编排列表</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">考试名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">考点</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">考场</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">考试日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">容量</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">已安排</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">状态</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {scheduledExams.map((item) => (
                <tr key={item.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3">{item.exam_title}</td>
                  <td className="px-4 py-3">{item.venue_name}</td>
                  <td className="px-4 py-3">{item.room_name}</td>
                  <td className="px-4 py-3 text-sm">{item.scheduled_date?.slice(0, 10)}</td>
                  <td className="px-4 py-3">{item.capacity}</td>
                  <td className="px-4 py-3">{item.assigned_count}</td>
                  <td className="px-4 py-3">
                    <Badge variant={item.assigned_count >= item.capacity ? 'success' : 'warning'}>
                      {item.assigned_count >= item.capacity ? '已满' : '未满'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm">
                      调整
                    </Button>
                  </td>
                </tr>
              ))}
              {scheduledExams.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    暂无编排数据
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
