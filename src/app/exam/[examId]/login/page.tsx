import { notFound } from "next/navigation";
import Link from "next/link";
import { repo } from "@/lib/repository";
import { ExamLoginForm } from "@/components/candidate/exam-login-form";

export default async function ExamLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { examId } = await params;
  const { next } = await searchParams;

  const exam = await repo.findExamById(examId);
  if (!exam) {
    notFound();
  }

  return (
    <div className="exam-login-page">
      {/* 考试 Header */}
      <div className="exam-header">
        <Link href="/" className="back-home">← 返回首页</Link>
        <div className="exam-info">
          <img src={exam.logoUrl || "/images/logo-default.png"} alt="" />
          <h1>{exam.title}</h1>
        </div>
      </div>

      {/* 登录表单 */}
      <div className="login-container">
        <div className="login-notice">
          <h3>注意事项</h3>
          <ol>
            <li>平台首次报名时，须点击"注册"按钮进行注册</li>
            <li>再次登录时，输入身份证号、密码、验证码即可</li>
            <li>报名通知将通过公众号发送，请勿取消关注</li>
          </ol>
        </div>

        <div className="login-form-area">
          <h2>考生登录</h2>
          <ExamLoginForm
            examId={exam.id}
            nextPath={next}
          />
          <div className="login-footer">
            <Link href={`/exam/${exam.id}/register`}>注册账户</Link>
            <Link href={`/exam/${exam.id}/forgot-password`}>忘记密码</Link>
          </div>
        </div>
      </div>

      {/* 底部 */}
      <footer className="login-footer-page">
        <p>Copyright © 2018-2026 邻泰人事考试服务中心 All Rights Reserved</p>
      </footer>
    </div>
  );
}
