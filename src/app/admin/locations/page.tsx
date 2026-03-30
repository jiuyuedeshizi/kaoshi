import { AdminLocationForms } from "@/components/admin/admin-location-forms";
import { SiteFrame } from "@/components/layout/site-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { repo } from "@/lib/repository";

export default async function AdminLocationsPage() {
  await requireAdminPageAccess("MANAGE_LOCATIONS", "/admin/locations");
  const [areas, venues, rooms] = await Promise.all([
    repo.listExamAreas(),
    repo.listExamVenues(),
    repo.listExamRooms(),
  ]);
  const areaMap = new Map(areas.map((item) => [item.id, item]));
  const venueMap = new Map(venues.map((item) => [item.id, item]));

  return (
    <SiteFrame currentPath="/admin">
      <PageHero title="考区考点管理" description="维护考区、考点和考场容量，为后续考场座位编排和准考证生成提供基础数据。" />
      <main className="page-section cards-2">
        <section className="card">
          <div className="panel-header">
            <h2>新增基础场地</h2>
            <span className="badge success">支持编排</span>
          </div>
          <AdminLocationForms areas={areas} venues={venues} />
        </section>
        <div className="content-stack">
          <section className="table-card">
            <div className="panel-header">
              <h2>考区与考点</h2>
            </div>
            {venues.length ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>考区</th>
                    <th>考点</th>
                    <th>地址</th>
                  </tr>
                </thead>
                <tbody>
                  {venues.map((venue) => (
                    <tr key={venue.id}>
                      <td>{areaMap.get(venue.areaId)?.name ?? "-"}</td>
                      <td>{venue.name}</td>
                      <td>{venue.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="暂无考点" description="先新增考区和考点，再配置考场容量。" />
            )}
          </section>
          <section className="table-card">
            <div className="panel-header">
              <h2>考场容量</h2>
            </div>
            {rooms.length ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>考点</th>
                    <th>考场</th>
                    <th>容量</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id}>
                      <td>{venueMap.get(room.venueId)?.name ?? "-"}</td>
                      <td>{room.name}</td>
                      <td>{room.capacity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="暂无考场" description="配置考场后，系统才可以自动生成考场和座位号。" />
            )}
          </section>
        </div>
      </main>
    </SiteFrame>
  );
}
