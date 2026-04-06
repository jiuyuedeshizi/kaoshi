import { useQuery } from '@tanstack/react-query'
import { venueAPI } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, MapPin } from 'lucide-react'

export function VenueList() {
  const { data, isLoading } = useQuery({
    queryKey: ['venues'],
    queryFn: () => venueAPI.listVenues(),
  })

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>
  }

  const venues = data?.data || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">考点管理</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>考点列表</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">考点代码</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">考点名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">所属考区</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">容量</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">状态</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((venue: any) => (
                <tr key={venue.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm">{venue.code}</td>
                  <td className="px-4 py-3">{venue.name}</td>
                  <td className="px-4 py-3">{venue.area_name || '-'}</td>
                  <td className="px-4 py-3">{venue.capacity || 0}</td>
                  <td className="px-4 py-3">
                    <Badge variant={venue.enabled ? 'success' : 'secondary'}>
                      {venue.enabled ? '启用' : '禁用'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm">
                      <MapPin className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
              {venues.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    暂无考点数据
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
