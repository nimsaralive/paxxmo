import { useEffect, useState } from "react";
import { toast } from "sonner";
import AdminShell from "@/components/cms/AdminShell";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { messageFor } from "@/lib/cms/api";
export default function CMSTeam() {
  const { user } = useAuth();
  const [members, setMembers] = useState<
      { user_id: string; display_name: string; role: string }[]
    >([]),
    [error, setError] = useState(""),
    [id, setId] = useState(""),
    [name, setName] = useState(""),
    [role, setRole] = useState("author");
  const load = async () => {
    const { data, error } = await supabase
      .from("cms_members")
      .select("user_id,display_name,role");
    if (error) setError(error.message);
    else setMembers(data || []);
  };
  useEffect(() => {
    void load();
  }, []);
  return (
    <AdminShell
      title="The people behind the stories."
      subtitle="Authors write. Editors publish. Administrators manage access."
    >
      <section className="cms-panel p-6">
        {error && <p role="alert">{error}</p>}
        <div className="cms-team-grid">
          {members.map((m) => (
            <div className="cms-team-card" key={m.user_id}>
              <span className="cms-avatar">{m.display_name.slice(0, 1)}</span>
              <h3>{m.display_name}</h3>
              <span className="cms-badge">{m.role}</span>
            </div>
          ))}
        </div>
        {user?.role === "admin" && (
          <form
            className="cms-form max-w-lg mt-8"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!/^[0-9a-f-]{36}$/i.test(id)) {
                toast.error("Enter an existing Supabase Auth user UUID.");
                return;
              }
              const existing=members.find(member=>member.user_id===id);
              if(existing&&existing.role!==role&&!window.confirm(`Change ${existing.display_name}'s role from ${existing.role} to ${role}?${id===user.id?' This changes your own access.':''}`))return;
              try {
                const { error } = await supabase
                  .from("cms_members")
                  .upsert({ user_id: id, display_name: name, role });
                if (error) throw error;
                toast.success("CMS role saved. The member must sign in again.");
                await load();
              } catch (e) {
                toast.error(messageFor(e));
              }
            }}
          >
            <h2>Assign an existing account</h2>
            <p className="text-sm text-muted-foreground">
              Create or invite the account through Supabase Auth, then paste its
              user ID. Roles are enforced by database policies.
            </p>
            <label>
              User UUID
              <input
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </label>
            <label>
              Display name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Role
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="author">Author</option>
                <option value="editor">Editor</option>
                <option value="admin">Administrator</option>
              </select>
            </label>
            <button className="cms-button primary">Save access</button>
          </form>
        )}
      </section>
    </AdminShell>
  );
}
