import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { noticeAPI } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function NoticeForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const queryClient = useQueryClient()
  const isEdit = !!id

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'NOTICE',
    pinned: false,
    published: false,
  })

  const { data: noticeData } = useQuery({
    queryKey: ['notice', id],
    queryFn: () => noticeAPI.get(Number(id)),
    enabled: isEdit,
  })

  // Populate form when editing
  useState(() => {
    if (noticeData?.data) {
      setForm({
        title: noticeData.data.title || '',
        content: noticeData.data.content || '',
        category: noticeData.data.category || 'NOTICE',
        pinned: noticeData.data.pinned || false,
        published: noticeData.data.published || false,
      })
    }
  })

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit ? noticeAPI.update(Number(id), data) : noticeAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] })
      navigate('/notices')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? '编辑公告' : '新建公告'}</h1>

      <Card>
        <CardHeader>
          <CardTitle>公告信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">标题</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">分类</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              >
                <option value="NOTICE">通知</option>
                <option value="RECRUITMENT">招聘</option>
                <option value="PUBLICITY">公示</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">内容</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={8}
                className="mt-1 block w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={form.pinned}
                  onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="pinned" className="text-sm font-medium text-slate-700">
                  置顶
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="published" className="text-sm font-medium text-slate-700">
                  发布
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? '保存中...' : '保存'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/notices')}>
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
