import { Users, FileText, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Dashboard() {
  const stats = {
    totalUsers: 156,
    totalExams: 8,
    totalApplications: 423,
    totalOrders: 389,
  }

  const statCards = [
    { title: '考生总数', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { title: '考试项目', value: stats.totalExams, icon: FileText, color: 'bg-green-500' },
    { title: '报名总数', value: stats.totalApplications, icon: FileText, color: 'bg-purple-500' },
    { title: '缴费订单', value: stats.totalOrders, icon: DollarSign, color: 'bg-orange-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">控制台</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{card.title}</p>
                    <p className="text-3xl font-bold mt-1">{card.value}</p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pending review list */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>待审核报名</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">暂无待审核报名</p>
        </CardContent>
      </Card>
    </div>
  )
}
