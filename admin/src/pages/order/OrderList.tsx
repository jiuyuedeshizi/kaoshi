import { useQuery } from '@tanstack/react-query'
import { orderAPI } from '@/api/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const statusMap: Record<string, { label: string; variant: 'secondary' | 'warning' | 'success' | 'destructive' }> = {
  PENDING: { label: '待支付', variant: 'warning' },
  PAID: { label: '已支付', variant: 'success' },
  FAILED: { label: '支付失败', variant: 'destructive' },
  CLOSED: { label: '已关闭', variant: 'secondary' },
}

const providerMap: Record<string, string> = {
  MOCK: '模拟支付',
  ALIPAY: '支付宝',
  WECHAT: '微信支付',
}

export function OrderList() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderAPI.list({ page: 1, page_size: 20 }),
  })

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>
  }

  const orders = data?.data?.items || []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">订单管理</h1>

      <Card>
        <CardHeader>
          <CardTitle>订单列表</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">订单号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">考生</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">考试项目</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">金额</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">支付方式</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">创建时间</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm">{order.order_no}</td>
                  <td className="px-4 py-3 text-sm">{order.application?.user?.name || '-'}</td>
                  <td className="px-4 py-3 text-sm">{order.application?.exam_project?.title || '-'}</td>
                  <td className="px-4 py-3 text-sm font-medium">¥{order.amount}</td>
                  <td className="px-4 py-3 text-sm">{providerMap[order.provider] || order.provider}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusMap[order.status]?.variant || 'secondary'}>
                      {statusMap[order.status]?.label || order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {order.created_at?.slice(0, 10) || '-'}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    暂无订单数据
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
