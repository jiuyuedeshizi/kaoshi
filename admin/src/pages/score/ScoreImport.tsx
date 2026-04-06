import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { scoreAPI } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText } from 'lucide-react'

export function ScoreImport() {
  const [file, setFile] = useState<File | null>(null)
  const [examId, setExamId] = useState<number>(0)

  const importMutation = useMutation({
    mutationFn: (formData: FormData) => scoreAPI.import(formData),
    onSuccess: () => {
      alert('成绩导入成功')
      setFile(null)
    },
    onError: () => {
      alert('成绩导入失败')
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleImport = () => {
    if (!file || !examId) {
      alert('请选择文件和考试')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('exam_id', examId.toString())
    importMutation.mutate(formData)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">成绩导入</h1>

      <Card>
        <CardHeader>
          <CardTitle>导入成绩文件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">选择考试</label>
              <input
                type="number"
                value={examId || ''}
                onChange={(e) => setExamId(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="输入考试ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">选择Excel文件</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-slate-600">{file.name}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      点击选择文件 或 拖拽文件到此处
                    </p>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleImport}
                disabled={importMutation.isPending || !file || !examId}
              >
                {importMutation.isPending ? '导入中...' : '开始导入'}
              </Button>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-sm">
              <p className="font-medium text-slate-700 mb-2">导入说明：</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>支持 .xlsx, .xls, .csv 格式的文件</li>
                <li>Excel文件第一行应为表头，包含考生姓名、身份证号、成绩等字段</li>
                <li>请确保文件编码为UTF-8</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
