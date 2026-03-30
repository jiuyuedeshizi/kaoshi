import { TICKET_NOTICE_ITEMS, buildTicketArrivalTip, buildTicketSubjectName, buildTicketVenueHint } from "@/lib/ticket-template";
import type { AdmissionTicket, Application, ExamProject, User } from "@/lib/types";

function renderMultiline(text: string) {
  const lines = text.split("\n");
  return lines.map((line, index) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

export function TicketPreviewSheet({
  ticket,
  application,
  candidate,
  exam,
}: {
  ticket: AdmissionTicket;
  application: Application;
  candidate: User;
  exam: ExamProject;
}) {
  return (
    <article className="ticket-paper">
      <header className="ticket-paper-head">
        <p>{new Date().toLocaleString("zh-CN", { hour12: false })}</p>
        <p>邻泰考生网上报名系统</p>
      </header>

      <div className="ticket-paper-title">
        <h1>{exam.title}</h1>
        <h2>准 考 证</h2>
      </div>

      <table className="ticket-table ticket-info-table">
        <tbody>
          <tr>
            <th>报名序号</th>
            <td>{application.id}</td>
            <th>所属考区</th>
            <td>{exam.location}</td>
            <td rowSpan={5} className="ticket-photo-cell">
              {application.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={application.photoUrl} alt={`${candidate.name}证件照`} className="ticket-photo-image" />
              ) : null}
            </td>
          </tr>
          <tr>
            <th>考生姓名</th>
            <td>{candidate.name}</td>
            <th>性别</th>
            <td>{candidate.gender ?? "男"}</td>
          </tr>
          <tr>
            <th>身份证号</th>
            <td>{candidate.idCard}</td>
            <th>民族</th>
            <td>{candidate.ethnicity ?? "-"}</td>
          </tr>
          <tr>
            <th>岗位代码</th>
            <td>{ticket.jobCode ?? application.jobCode ?? ticket.ticketNo.slice(-8)}</td>
            <th>笔试类别</th>
            <td>{ticket.examSubject ?? application.subjectName ?? application.major}</td>
          </tr>
          <tr>
            <th>岗位名称</th>
            <td colSpan={3}>{ticket.jobName ?? application.major}</td>
          </tr>
        </tbody>
      </table>

      <table className="ticket-table ticket-exam-table">
        <tbody>
          <tr>
            <th colSpan={6} className="ticket-section-title">
              考 场 信 息
            </th>
          </tr>
          <tr>
            <th>准考证号</th>
            <th>考试科目</th>
            <th>考试时间</th>
            <th>考点名称</th>
            <th>考场</th>
            <th>座位</th>
          </tr>
          <tr>
            <td>{ticket.ticketNo}</td>
            <td>{buildTicketSubjectName(ticket.examSubject ?? application.subjectName ?? "", application.major)}</td>
            <td>{renderMultiline(buildTicketArrivalTip(ticket.examTime))}</td>
            <td>{ticket.venue}</td>
            <td>{ticket.room}</td>
            <td>{ticket.seatNo}</td>
          </tr>
          <tr>
            <td colSpan={6} className="ticket-venue-hint">
              {buildTicketVenueHint(ticket.venue)}
            </td>
          </tr>
          <tr>
            <th colSpan={6} className="ticket-section-title">
              注 意 事 项
            </th>
          </tr>
          <tr>
            <td colSpan={6} className="ticket-notice-cell">
              <ol className="ticket-notice-list">
                {TICKET_NOTICE_ITEMS.map((item) => (
                  <li key={item}>{item.replace(/^[^.]+\./, "")}</li>
                ))}
              </ol>
            </td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}
