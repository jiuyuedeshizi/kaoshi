import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { scoreAPI } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ScorePublish() {
  const [examId, setExamId] = useState<number>(0)
  const [result, setResult] = useState<any>(null)

  const publishMutation = useMutation({
    mutationFn: (examId: number) => scoreAPI.publish(examId),
    onSuccess: (data) => {
      setResult(data)
      alert('成绩发布成功')
    },
    onError: () => {
      alert('成绩发布失败')
    },
  })

  const handlePublish = () => {
    if (!examId) {
      alert('请输入考试ID')
      return
    }
    publishMutation.mutate(examId)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">成绩发布</h1>

      <Card>
        <CardHeader>
          <CardTitle>发布考试成绩</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">考试ID</label>
              <input
                type="number"
                value={examId || ''}
                onChange={(e) => setExamId(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="输入要发布成绩的考试ID"
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handlePublish}
                disabled={publishMutation.isPending || !examId}
              >
                {publishMutation.isPending ? '发布中...' : '发布成绩'}
              </Button>
            </div>

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700">成绩发布成功！</p>
                <p className="text-sm text-green-600 mt-1">
                  已成功发布 {result.data?.count || 0} 名考生的成绩
                </p>
              </div>
            )}

            <div className="bg-slate-50 rounded-lg p-4 text-sm">
              <p className="font-medium text-slate-700 mb-2">发布说明：</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>发布成绩后，考生可以在前台查看自己的成绩</li>
                <li>请确保成绩数据已经正确导入系统</li>
                <li>发布前请确认成绩无误，发布后无法撤回</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
