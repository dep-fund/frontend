import "./DashboardLayout.css";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import type { User } from "../types";

interface DashboardLayoutProps {
  title: string;
  user: User | null;
  children: React.ReactNode;
}

export default function DashboardLayout({ title, user, children }: DashboardLayoutProps) {
  return (
    <div className="dash-layout">
      <Sidebar />
      <div className="dash-main">
        <TopBar title={title} user={user} />
        <main className="dash-content">{children}</main>
      </div>
    </div>
  );
}
