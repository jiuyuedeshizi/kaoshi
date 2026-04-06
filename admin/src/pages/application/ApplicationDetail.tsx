import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationAPI } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [comment, setComment] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationAPI.get(Number(id)),
  })

  const reviewMutation = useMutation({
    mutationFn: (data: any) => applicationAPI.review(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] })
    },
  })

  const application = data?.data

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>
  }

  if (!application) {
    return <div className="text-center py-8">报名不存在</div>
  }

  const handleReview = (action: string) => {
    if (!comment && action !== 'approve') {
      alert('请填写审核意见')
      return
    }
    reviewMutation.mutate({ action, comment })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">报名详情</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex">
                <dt className="w-24 text-sm text-slate-500">考生姓名</dt>
                <dd className="text-sm font-medium">{application.user?.name}</dd>
              </div>
              <div className="flex">
                <dt className="w-24 text-sm text-slate-500">身份证号</dt>
                <dd className="text-sm">{application.user?.id_card}</dd>
              </div>
              <div className="flex">
                <dt className="w-24 text-sm text-slate-500">手机号</dt>
                <dd className="text-sm">{application.user?.phone}</dd>
              </div>
              <div className="flex">
                <dt className="w-24 text-sm text-slate-500">考试项目</dt>
                <dd className="text-sm">{application.exam_project?.title}</dd>
              </div>
              <div className="flex">
                <dt className="w-24 text-sm text-slate-500">报考职位</dt>
                <dd className="text-sm">{application.job_position?.name}</dd>
              </div>
              <div className="flex">
                <dt className="w-24 text-sm text-slate-500">学历</dt>
                <dd className="text-sm">{application.education}</dd>
              </div>
              <div className="flex">
                <dt className="w-24 text-sm text-slate-500">专业</dt>
                <dd className="text-sm">{application.major}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Review operation */}
        {application.status === 'SUBMITTED' && (
          <Card>
            <CardHeader>
              <CardTitle>审核操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">审核意见</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="请输入审核意见"
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleReview('approve')}
                    disabled={reviewMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    通过
                  </Button>
                  <Button
                    onClick={() => handleReview('reject')}
                    disabled={reviewMutation.isPending}
                    variant="destructive"
                  >
                    驳回
                  </Button>
                  <Button
                    onClick={() => handleReview('revise')}
                    disabled={reviewMutation.isPending}
                    variant="outline"
                  >
                    要求修改
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review record */}
        {application.review_note && (
          <Card>
            <CardHeader>
              <CardTitle>审核记录</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">{application.review_note}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={() => navigate('/applications')}>
          返回列表
        </Button>
      </div>
    </div>
  )
}
