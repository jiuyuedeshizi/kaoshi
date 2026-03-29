import { CandidateDashboard } from "@/components/candidate/candidate-dashboard";
import { requireCandidatePageAccess } from "@/lib/candidate-auth";
import { getCandidateDashboard } from "@/lib/site";

export default async function DashboardPage() {
  const current = await requireCandidatePageAccess("/dashboard");
  const data = await getCandidateDashboard(current.user.id);

  return <CandidateDashboard {...data} />;
}
