import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function CategoryList() {
  // Mock data for category list
  const categories = [
    { id: 1, code: 'GWY', name: '公务员', exam_count: 5 },
    { id: 2, code: 'ZDZG', name: '执业资格', exam_count: 12 },
    { id: 3, code: 'ZYJS', name: '专业技术', exam_count: 8 },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">考试分类</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>分类列表</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">分类代码</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">分类名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">考试数量</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">状态</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm">{category.code}</td>
                  <td className="px-4 py-3">{category.name}</td>
                  <td className="px-4 py-3">{category.exam_count}</td>
                  <td className="px-4 py-3">
                    <Badge variant="success">启用</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
