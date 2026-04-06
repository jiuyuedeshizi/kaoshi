import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { ExamList } from './pages/exam/ExamList'
import { ExamForm } from './pages/exam/ExamForm'
import { ApplicationList } from './pages/application/ApplicationList'
import { ApplicationDetail } from './pages/application/ApplicationDetail'
import { AreaList } from './pages/venue/AreaList'
import { VenueList } from './pages/venue/VenueList'
import { NoticeList } from './pages/notice/NoticeList'
import { NoticeForm } from './pages/notice/NoticeForm'
import { JobList } from './pages/job/JobList'
import { Scheduling } from './pages/scheduling/Scheduling'
import { TicketList } from './pages/ticket/TicketList'
import { ScoreImport } from './pages/score/ScoreImport'
import { ScorePublish } from './pages/score/ScorePublish'
import { UserList } from './pages/user/UserList'
import { OrderList } from './pages/order/OrderList'
import { Login } from './pages/Login'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/exams" element={<ExamList />} />
                <Route path="/exams/new" element={<ExamForm />} />
                <Route path="/exams/:id/edit" element={<ExamForm />} />
                <Route path="/applications" element={<ApplicationList />} />
                <Route path="/applications/:id" element={<ApplicationDetail />} />
                <Route path="/venues/areas" element={<AreaList />} />
                <Route path="/venues" element={<VenueList />} />
                <Route path="/scheduling" element={<Scheduling />} />
                <Route path="/tickets" element={<TicketList />} />
                <Route path="/jobs" element={<JobList />} />
                <Route path="/notices/new" element={<NoticeForm />} />
                <Route path="/notices/:id/edit" element={<NoticeForm />} />
                <Route path="/scores/import" element={<ScoreImport />} />
                <Route path="/scores/publish" element={<ScorePublish />} />
                <Route path="/notices" element={<NoticeList />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/orders" element={<OrderList />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
