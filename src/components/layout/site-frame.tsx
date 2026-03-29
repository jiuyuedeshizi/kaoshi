import Link from "next/link";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { getCurrentCandidate } from "@/lib/candidate-auth";

const mainNav = [
  { href: "/", label: "首页" },
  { href: "/exams", label: "考试报名" },
  { href: "/payments", label: "网上缴费" },
  { href: "/tickets", label: "准考证打印" },
  { href: "/scores", label: "成绩查询" },
  { href: "/admin/login", label: "后台管理" },
];

export async function SiteFrame({
  children,
  currentPath,
}: {
  children: ReactNode;
  currentPath?: string;
}) {
  const isAdminArea = currentPath?.startsWith("/admin");
  const currentAdmin = isAdminArea ? await getCurrentAdmin() : null;
  const currentCandidate = !isAdminArea ? await getCurrentCandidate() : null;

  return (
    <div className="site-shell">
      <div className="top-ribbon">
        <div className="top-ribbon-inner">
          <span>服务时间：工作日 09:00 - 18:00</span>
          <span>考务咨询：0471-1234567 | 技术支持：0471-7654321</span>
        </div>
      </div>
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="brand" href="/">
            <div className="brand-mark">考</div>
            <div className="brand-copy">
              <strong>邻泰人事考试服务平台</strong>
              <span>Personnel Examination Service Portal</span>
            </div>
          </Link>
          <nav className="nav-links">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx("nav-link", currentPath === item.href && "active")}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            {isAdminArea ? (
              <>
                {currentAdmin ? (
                  <div className="header-account-bar">
                    <div className="admin-identity">
                      <strong>{currentAdmin.user.name}</strong>
                      <span>{currentAdmin.roleLabel}</span>
                    </div>
                    <div className="header-account-links">
                      <Link className="button-ghost button-text" href="/admin">
                        后台首页
                      </Link>
                      <Link className="button-secondary button-text" href="/admin/logout">
                        退出后台
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Link className="button-secondary" href="/admin/login">
                    后台登录
                  </Link>
                )}
              </>
            ) : (
              <>
                {currentCandidate ? (
                  <div className="header-account-bar">
                    <div className="admin-identity">
                      <strong>{currentCandidate.user.name}</strong>
                      <span>已登录考生</span>
                    </div>
                    <div className="header-account-links">
                      <Link className="button button-text" href="/dashboard">
                        进入个人中心
                      </Link>
                      <Link className="button-secondary button-text" href="/logout">
                        退出登录
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link className="button-secondary" href="/login">
                      考生登录
                    </Link>
                    <Link className="button" href="/register">
                      实名注册
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div>
            <h3>平台说明</h3>
            <p>
              本平台面向各类公开招聘、人事考试、资格评价等场景，提供公告发布、网上报名、资格审核、缴费、准考证打印和成绩查询的一站式服务。
            </p>
          </div>
          <div>
            <h3>常用入口</h3>
            <ul>
              <li>考生注册与登录</li>
              <li>网上报名与资格审核</li>
              <li>缴费订单与支付回调</li>
              <li>准考证打印与成绩查询</li>
            </ul>
          </div>
          <div>
            <h3>联系信息</h3>
            <ul>
              <li>技术支持：0471-7654321</li>
              <li>考务咨询：0471-1234567</li>
              <li>邮箱：support@nmltrcjt.com</li>
              <li>地址：呼和浩特市新城区政务服务大厦 5 层</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
