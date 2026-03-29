import type { ReactNode } from "react";

export function PageHero({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="page-hero">
      <div className="page-section">
        <div className="page-hero-card">
          <span className="eyebrow">政务考试服务门户</span>
          <h1>{title}</h1>
          <p>{description}</p>
          {actions ? <div className="hero-actions">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}
