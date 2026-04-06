import { notFound } from "next/navigation";
import Link from "next/link";
import { repo } from "@/lib/repository";
import { ExamRegisterForm } from "@/components/candidate/exam-register-form";

export default async function ExamRegisterPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const exam = await repo.findExamById(examId);

  if (!exam) {
    notFound();
  }

  return (
    <div className="exam-register-page">
      {/* Header */}
      <div className="exam-header">
        <Link href="/" className="back-home">← 返回首页</Link>
        <div className="exam-info">
          <img src={exam.logoUrl || "/images/logo-default.png"} alt="" />
          <h1>{exam.title}</h1>
        </div>
      </div>

      {/* 注册表单 */}
      <div className="register-container">
        <h2>考生注册</h2>
        <ExamRegisterForm examId={exam.id} />
        <p className="register-footer">
          已有账号？<Link href={`/exam/${exam.id}/login`}>立即登录</Link>
        </p>
      </div>

      <footer className="login-footer-page">
        <p>Copyright © 2018-2026 邻泰人事考试服务中心 All Rights Reserved</p>
      </footer>
    </div>
  );
}
