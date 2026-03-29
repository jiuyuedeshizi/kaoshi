import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getAdminDashboard } from "@/lib/site";

export default async function AdminPage() {
  const current = await requireAdminPageAccess("VIEW_DASHBOARD", "/admin");
  const data = await getAdminDashboard({
    name: current.user.name,
    role: current.user.role,
  });

  return <AdminDashboard {...data} />;
}
