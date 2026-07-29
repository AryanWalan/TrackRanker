import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ConfidencePage } from "./pages/ConfidencePage";
import { CreateSessionPage } from "./pages/CreateSessionPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EditSessionPage } from "./pages/EditSessionPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SessionDetailPage } from "./pages/SessionDetailPage";
import { SessionsPage } from "./pages/SessionsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="sessions/new" element={<CreateSessionPage />} />
        <Route path="sessions/:id" element={<SessionDetailPage />} />
        <Route path="sessions/:id/edit" element={<EditSessionPage />} />
        <Route path="confidence" element={<ConfidencePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
