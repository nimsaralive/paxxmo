import { useEffect, useMemo, useState } from "react";
import { useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Search,
  Plus,
  FileText,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import AdminShell from "@/components/cms/AdminShell";
import {
  listPosts,
  deletePost,
  duplicatePost,
  setPostStatus,
  messageFor,
} from "@/lib/cms/api";
import {
  statusLabels,
  type PostRecord,
  type PostStatus,
} from "@/lib/cms/types";
import { useAuth } from "@/contexts/AuthContext";
export default function AdminDashboard() {
  const { user } = useAuth(),
    { pathname } = useLocation();
  const overview = pathname === "/px-manage";
  const [posts, setPosts] = useState<PostRecord[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState("all"),
    [category, setCategory] = useState("all"),
    [author, setAuthor] = useState("all"),
    [sort, setSort] = useState("newest"),
    [after, setAfter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set()),
    [busy, setBusy] = useState(false),
    [page, setPage] = useState(1);
  const canPublish = user?.role === "admin" || user?.role === "editor";
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await listPosts(true);
      setPosts(
        user?.role === "author"
          ? rows.filter((p) => p.author_id === user.id)
          : rows,
      );
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);
  useEffect(() => {
    void load();
  }, [load]);
  const filtered = useMemo(
    () =>
      posts
        .filter(
          (p) =>
            (status === "all" || p.status === status) &&
            (category === "all" || p.category === category) &&
            (author === "all" || p.author === author) &&
            (!after || p.created_at.slice(0, 10) >= after) &&
            `${p.title} ${p.excerpt} ${p.tags.join(" ")}`
              .toLowerCase()
              .includes(search.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "oldest"
            ? a.created_at.localeCompare(b.created_at)
            : sort === "edited"
              ? b.updated_at.localeCompare(a.updated_at)
              : b.created_at.localeCompare(a.created_at),
        ),
    [posts, status, category, author, after, search, sort],
  );
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [search, status, category, author, after, sort]);
  const visible = filtered.slice((page - 1) * 10, page * 10);
  const run = async (action: string, targets: PostRecord[]) => {
    if (!targets.length) return;
    if (
      ["delete", "archived", "draft"].includes(action) &&
      !window.confirm(
        `${action === "delete" ? "Permanently delete" : action === "archived" ? "Archive" : "Unpublish"} ${targets.length} article(s)? ${action === "delete" ? "Article revisions will also be deleted. Media files are retained." : ""}`,
      )
    )
      return;
    setBusy(true);
    let failures = 0;
    for (const post of targets)
      try {
        if (action === "delete") await deletePost(post.id);
        else if (action === "duplicate") await duplicatePost(post);
        else await setPostStatus(post, action as PostStatus);
      } catch (e) {
        failures++;
        toast.error(`${post.title}: ${messageFor(e)}`);
      }
    if (failures < targets.length)
      toast.success(`${targets.length - failures} article(s) updated.`);
    setSelected(new Set());
    await load();
    setBusy(false);
  };
  return (
    <AdminShell
      title={overview ? "Good ideas start here." : "All articles"}
      subtitle={
        overview
          ? "A little clarity for your next big story."
          : "Create, organize and publish stories worth reading."
      }
      action={
        <Link to="/px-manage/posts/new" className="cms-button primary">
          <Plus size={16} />
          New article
        </Link>
      }
    >
      {overview && (
        <>
          <div className="cms-stats">
            {(["all", "published", "draft", "scheduled"] as const).map((s) => (
              <button key={s} onClick={() => setStatus(s)} className="cms-stat">
                <span>{s === "all" ? "Total articles" : statusLabels[s]}</span>
                <strong>
                  {loading
                    ? "—"
                    : s === "all"
                      ? posts.length
                      : posts.filter((p) => p.status === s).length}
                </strong>
                <small>
                  {s === "scheduled"
                    ? "Ready for their moment"
                    : "In your editorial workspace"}
                </small>
              </button>
            ))}
          </div>
          <div className="cms-editorial-callout">
            <div>
              <small>YOUR NEXT CHAPTER</small>
              <h2>
                Make something
                <br />
                worth sharing.
              </h2>
              <p>
                From a first thought to a finished story.
                <br />
                Your writing space is ready.
              </p>
              <Link className="cms-button" to="/px-manage/posts/new">
                Start writing <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="cms-callout-art" aria-hidden="true">
              <FileText size={100} strokeWidth={0.6} />
              <span>Ideas. Words. Impact.</span>
            </div>
          </div>
        </>
      )}
      <section className="cms-panel">
        <div className="cms-panel-heading">
          <div>
            <h2>{overview ? "Recent stories" : "Your editorial library"}</h2>
            <p>{posts.length} articles in your workspace</p>
          </div>
          <button
            className="cms-button"
            onClick={load}
            disabled={loading}
            aria-label="Refresh articles"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="cms-filters">
          <label className="cms-search">
            <Search size={17} />
            <input
              aria-label="Search articles"
              placeholder="Search articles, topics, ideas…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select
            aria-label="Filter status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            {Object.entries(statusLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            {[...new Set(posts.map((p) => p.category))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            aria-label="Filter author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          >
            <option value="all">All authors</option>
            {[...new Set(posts.map((p) => p.author))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            type="date"
            aria-label="Created on or after"
            value={after}
            onChange={(e) => setAfter(e.target.value)}
          />
          <select
            aria-label="Sort articles"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="edited">Last edited</option>
          </select>
        </div>
        {selected.size > 0 && (
          <div className="cms-bulk">
            <span>{selected.size} selected</span>
            {[
              "in_review",
              ...(canPublish
                ? ["published", "draft", "archived", "delete"]
                : []),
            ].map((a) => (
              <button
                key={a}
                className="cms-button"
                disabled={busy}
                onClick={() =>
                  run(
                    a,
                    posts.filter((p) => selected.has(p.id)),
                  )
                }
              >
                {a === "delete" ? "Delete" : statusLabels[a as PostStatus]}
              </button>
            ))}
          </div>
        )}
        {error ? (
          <div className="cms-state error" role="alert">
            <h3>We couldn’t load your articles</h3>
            <p>{error}</p>
            <p>
              Check Supabase connectivity, your CMS role and the Blog 2.0
              migration.
            </p>
            <button className="cms-button" onClick={load}>
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="cms-state" role="status">
            Loading your stories…
          </div>
        ) : !visible.length ? (
          <div className="cms-state">
            <FileText size={32} />
            <h3>
              {posts.length
                ? "No matching articles"
                : "Your first story starts here"}
            </h3>
            <p>
              {posts.length
                ? "Try a different search or filter."
                : "Create a draft and give your ideas a place to grow."}
            </p>
            <Link className="cms-button primary" to="/px-manage/posts/new">
              Write an article
            </Link>
          </div>
        ) : (
          <div className="cms-table-wrap">
            <table className="cms-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      aria-label="Select page"
                      checked={visible.every((p) => selected.has(p.id))}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? new Set(visible.map((p) => p.id))
                            : new Set(),
                        )
                      }
                    />
                  </th>
                  <th>Article</th>
                  <th>Status</th>
                  <th>Author</th>
                  <th>Last edited</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Select ${p.title}`}
                        checked={selected.has(p.id)}
                        onChange={(e) => {
                          const next = new Set(selected);
                          if (e.target.checked) next.add(p.id);
                          else next.delete(p.id);
                          setSelected(next);
                        }}
                      />
                    </td>
                    <td>
                      <Link
                        to={`/px-manage/posts/${p.slug}/edit`}
                        className="cms-article-cell"
                      >
                        {p.image ? (
                          <img src={p.image} alt="" loading="lazy" />
                        ) : (
                          <span className="cms-thumbnail">
                            <FileText />
                          </span>
                        )}
                        <div>
                          <strong>{p.title}</strong>
                          <small>
                            {p.category} · {p.tags.slice(0, 2).join(", ")}
                          </small>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <span className={`cms-badge ${p.status}`}>
                        {statusLabels[p.status]}
                      </span>
                      {p.scheduled_at && p.status === "scheduled" && (
                        <small className="block mt-1">
                          {new Date(p.scheduled_at).toLocaleString()}
                        </small>
                      )}
                    </td>
                    <td>{p.author}</td>
                    <td>{new Date(p.updated_at).toLocaleDateString()}</td>
                    <td>
                      <details className="cms-actions">
                        <summary aria-label={`Actions for ${p.title}`}>
                          <MoreHorizontal size={18} />
                        </summary>
                        <div>
                          <Link to={`/px-manage/posts/${p.slug}/edit`}>
                            Edit article
                          </Link>
                          {p.status === "published" && (
                            <a
                              href={`/blog/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View article
                            </a>
                          )}
                          <button
                            disabled={busy}
                            onClick={() => run("duplicate", [p])}
                          >
                            Duplicate as draft
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => run("in_review", [p])}
                          >
                            Send for review
                          </button>
                          {canPublish && (
                            <>
                              <button
                                disabled={busy}
                                onClick={() =>
                                  run(
                                    p.status === "published"
                                      ? "draft"
                                      : "published",
                                    [p],
                                  )
                                }
                              >
                                {p.status === "published"
                                  ? "Unpublish"
                                  : "Publish"}
                              </button>
                              <button
                                disabled={busy}
                                onClick={() => run("archived", [p])}
                              >
                                Archive
                              </button>
                              <button
                                disabled={busy}
                                onClick={() => run("delete", [p])}
                              >
                                Delete permanently
                              </button>
                            </>
                          )}
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="cms-pagination">
          <small>
            {filtered.length
              ? `${(page - 1) * 10 + 1}–${Math.min(page * 10, filtered.length)} of ${filtered.length}`
              : "0 articles"}
          </small>
          <div>
            <button
              className="cms-button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <button
              className="cms-button"
              disabled={page * 10 >= filtered.length}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
