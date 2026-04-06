import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Eye, Search } from 'lucide-react'

interface Ticket {
  id: number
  ticket_number: string
  candidate_name: string
  id_number: string
  exam_title: string
  venue_name: string
  room_name: string
  seat_number: string
  exam_date: string
  status: 'ISSUED' | 'USED' | 'CANCELLED'
}

const statusMap: Record<string, { label: string; variant: 'success' | 'secondary' | 'warning' }> = {
  ISSUED: { label: '已发放', variant: 'success' },
  USED: { label: '已使用', variant: 'secondary' },
  CANCELLED: { label: '已取消', variant: 'warning' },
}

export function TicketList() {
  const { data, isLoading } = useQuery<{ data: Ticket[] }>({
    queryKey: ['tickets'],
    queryFn: async () => {
      // Placeholder: replace with actual API call
      return { data: [] as Ticket[] }
    },
  })

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>
  }

  const tickets = data?.data || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">准考证管理</h1>
        <Button>
          <Download className="w-4 h-4 mr-2" />批量导出
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索准考证号、考生姓名、身份证号..."
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
            </div>
            <Button variant="outline">筛选</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>准考证列表</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">准考证号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">考生姓名</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">考试名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">考点</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">考场</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">座位号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">考试日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">状态</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm">{ticket.ticket_number}</td>
                  <td className="px-4 py-3">{ticket.candidate_name}</td>
                  <td className="px-4 py-3">{ticket.exam_title}</td>
                  <td className="px-4 py-3">{ticket.venue_name}</td>
                  <td className="px-4 py-3">{ticket.room_name}</td>
                  <td className="px-4 py-3">{ticket.seat_number}</td>
                  <td className="px-4 py-3 text-sm">{ticket.exam_date?.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusMap[ticket.status]?.variant || 'secondary'}>
                      {statusMap[ticket.status]?.label || ticket.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    暂无准考证数据
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
