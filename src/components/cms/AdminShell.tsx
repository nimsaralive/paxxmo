import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Images,
  ArrowUpRight,
  LogOut,
  Users,
  Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";
export default function AdminShell({
  children,
  title,
  subtitle,
  action,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const { user, logout } = useAuth();
  const links = [
    { to: "/px-manage", label: "Overview", icon: LayoutDashboard },
    { to: "/px-manage/posts", label: "All articles", icon: FileText },
    { to: "/px-manage/media", label: "Media library", icon: Images },
    { to: "/px-manage/team", label: "Team & access", icon: Users },
  ];
  return (
    <div className="cms-app">
      <aside className="cms-sidebar">
        <Link to="/px-manage" className="cms-brand">
          Paxxmo<span>STUDIO</span>
        </Link>
        <div className="cms-workspace">
          <span className="cms-avatar">P</span>
          <div>
            Paxxmo journal<small>Editorial workspace</small>
          </div>
        </div>
        <nav aria-label="Content management">
          <small className="cms-nav-label">WORKSPACE</small>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              end
              to={to}
              className={({ isActive }) =>
                `cms-nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <Link className="cms-button primary mt-6" to="/px-manage/posts/new">
          <Plus size={16} />
          Write an article
        </Link>
        <div className="cms-sidebar-bottom">
          <a
            href="/blog"
            target="_blank"
            rel="noreferrer"
            className="cms-nav-link"
          >
            View journal <ArrowUpRight size={16} />
          </a>
          <div className="cms-account">
            <span className="cms-avatar">{user?.name?.slice(0, 1)}</span>
            <div>
              {user?.name}
              <small>{user?.role}</small>
            </div>
            <button aria-label="Sign out" onClick={logout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main className="cms-main">
        <header className="cms-page-header">
          <div>
            <div className="cms-eyebrow">PAXXMO / CONTENT STUDIO</div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </header>
        {children}
      </main>
    </div>
  );
}
