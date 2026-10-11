import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import type { Editor } from "@tiptap/react";
import {
  ArrowLeft,
  Eye,
  Save,
  Maximize2,
  ImagePlus,
  History,
  Settings2,
  SearchCheck,
} from "lucide-react";
import { toast } from "sonner";
import RichEditor, { insertAsset } from "@/components/cms/RichEditor";
import SEOPanel from "@/components/cms/SEOPanel";
import MediaLibrary from "@/components/cms/MediaLibrary";
import { useAuth } from "@/contexts/AuthContext";
import {
  listPosts,
  savePost,
  saveWorkingCopy,
  workingCopy,
  clearWorkingCopy,
  revisions,
  messageFor,
} from "@/lib/cms/api";
import {
  cleanContent,
  plainText,
  readingTime,
  slugify,
} from "@/lib/cms/content";
import { analyzeSEO } from "@/lib/cms/seo";
import {
  statusLabels,
  type PostRecord,
  type PostStatus,
  type MediaAsset,
} from "@/lib/cms/types";
const createDraft = (): PostRecord => ({
  id: crypto.randomUUID(),
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  author: "",
  category: "General",
  tags: [],
  image: "",
  image_alt: "",
  status: "draft",
  published: false,
  created_at: new Date().toISOString(),
  updated_at: "",
  seo: {},
  featured: false,
  media_ids: [],
});
export default function BlogEditor() {
  const { id } = useParams(),
    navigate = useNavigate(),
    { user } = useAuth();
  const [post, setPost] = useState<PostRecord>(createDraft),
    [others, setOthers] = useState<PostRecord[]>([]),
    [loading, setLoading] = useState(!!id),
    [error, setError] = useState("");
  const [tab, setTab] = useState("story"),
    [preview, setPreview] = useState(false),
    [mobile, setMobile] = useState(false),
    [focus, setFocus] = useState(false),
    [saving, setSaving] = useState(false),
    [saveLabel, setSaveLabel] = useState("Unsaved draft"),
    [dirty, setDirty] = useState(false);
  const [media, setMedia] = useState<"inline" | "featured" | null>(null),
    [mediaFiles, setMediaFiles] = useState<File[]>([]),
    [history, setHistory] = useState<Awaited<ReturnType<typeof revisions>>>([]),
    [showHistory, setShowHistory] = useState(false);
  const editor = useRef<Editor | null>(null),
    current = useRef(post),
    version = useRef<string | undefined>(undefined),
    copyVersion = useRef<string | undefined>(undefined),
    savedStatus = useRef<PostStatus>("draft"),
    inFlight = useRef(false),
    editCounter = useRef(0);
  current.current = post;
  const canPublish = user?.role === "admin" || user?.role === "editor";
  const receive = useCallback((instance: Editor) => {
    editor.current = instance;
  }, []);
  const change = (next: PostRecord) => {
    editCounter.current++;
    setPost(next);
    setDirty(true);
    setSaveLabel("Unsaved changes");
  };
  useEffect(() => {
    let cancelled = false;
    setLoading(!!id);
    setError("");
    void (async () => {
      try {
        const rows = await listPosts(true);
        if (cancelled) return;
        setOthers(rows);
        if (id) {
          const found = rows.find((p) => p.slug === id || p.id === id);
          if (!found)
            throw new Error("Article not found or you do not have access.");
          const copy = await workingCopy(found.id);
          if (cancelled) return;
          version.current = found.updated_at;
          savedStatus.current = found.status;
          const validCopy = copy?.base_updated_at === found.updated_at;
          copyVersion.current = copy?.updated_at;
          if (copy && !validCopy)
            toast.warning(
              "A working draft exists for an older article version. Find it in revision history before restoring.",
            );
          const next = validCopy
            ? { ...copy.payload, updated_at: found.updated_at }
            : found;
          setPost(next);
          editCounter.current = 0;
          setDirty(false);
          setSaveLabel(
            validCopy ? "Working draft restored" : "All changes saved",
          );
          editor.current?.commands.setContent(cleanContent(next.content), {
            emitUpdate: false,
          });
        }
      } catch (e) {
        if (!cancelled) setError(messageFor(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);
  const persist = useCallback(
    async (mode: "autosave" | "draft" | "publish" | "review") => {
      if (inFlight.current) return;
      const snapshotCounter = editCounter.current;
      const snapshot = { ...current.current, seo: { ...current.current.seo } };
      if (!snapshot.title.trim()) {
        if (mode !== "autosave") toast.error("Give this story a title.");
        return;
      }
      if (!snapshot.slug)
        snapshot.slug =
          slugify(snapshot.title) || `article-${snapshot.id.slice(0, 8)}`;
      if (
        mode === "publish" &&
        (!plainText(snapshot.content).trim() ||
          !snapshot.excerpt.trim() ||
          (snapshot.image && !snapshot.image_alt.trim()))
      ) {
        toast.error(
          "Add article content, an excerpt and meaningful image alt text before publishing.",
        );
        return;
      }
      if (
        mode === "publish" &&
        snapshot.status === "scheduled" &&
        (!snapshot.scheduled_at ||
          new Date(snapshot.scheduled_at) <= new Date())
      ) {
        toast.error("Choose a future publication date.");
        return;
      }
      inFlight.current = true;
      setSaving(true);
      setSaveLabel("Saving…");
      try {
        const isLive =
          version.current &&
          ["published", "scheduled", "archived"].includes(savedStatus.current);
        if ((mode === "autosave" || mode === "draft") && isLive) {
          copyVersion.current = await saveWorkingCopy(
            snapshot,
            version.current!,
            copyVersion.current,
          );
        } else {
          const target =
            mode === "publish"
              ? ["scheduled", "archived", "in_review"].includes(snapshot.status)
                ? snapshot.status
                : "published"
              : mode === "review"
                ? "in_review"
                : mode === "draft"
                  ? "draft"
                  : savedStatus.current;
          const result = await savePost(
            { ...snapshot, status: target as PostStatus },
            version.current,
          );
          version.current = result.updated_at;
          savedStatus.current = result.status;
          if (editCounter.current === snapshotCounter)
            setPost(
              mode === "autosave"
                ? {
                    ...result,
                    status: snapshot.status,
                    scheduled_at: snapshot.scheduled_at,
                  }
                : result,
            );
          else setPost((p) => ({ ...p, updated_at: result.updated_at }));
          if (mode !== "autosave") {
            try {
              await clearWorkingCopy(result.id, copyVersion.current);
              copyVersion.current = undefined;
            } catch {
              toast.warning(
                "Article saved, but the old working copy could not be cleared. Reload to check revisions.",
              );
            }
          }
        }
        const unchanged = editCounter.current === snapshotCounter;
        setDirty(!unchanged);

        setSaveLabel("Saved to Supabase");
        if (mode !== "autosave") {
          toast.success(
            mode === "publish"
              ? snapshot.status === "scheduled"
                ? "Publication scheduled."
                : snapshot.status === "archived"
                  ? "Article archived."
                  : snapshot.status === "in_review"
                    ? "Article sent for review."
                    : "Article published. Static pages update when the deployment hook is configured and finishes."
              : "Draft saved.",
          );
          if (!id)
            navigate(`/px-manage/posts/${snapshot.slug}/edit`, {
              replace: true,
            });
        }
      } catch (e) {
        setSaveLabel("Save failed — changes remain in the editor");
        setDirty(true);
        toast.error(messageFor(e));
      } finally {
        inFlight.current = false;
        setSaving(false);
      }
    },
    [id, navigate],
  );
  useEffect(() => {
    if (
      !dirty ||
      loading ||
      saving ||
      error ||
      saveLabel.startsWith("Save failed")
    )
      return;
    const timer = setTimeout(() => {
      void persist("autosave");
    }, 1800);
    return () => clearTimeout(timer);
  }, [post, dirty, loading, saving, error, saveLabel, persist]);
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void persist("draft");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [persist]);
  const chooseAsset = (asset: MediaAsset) => {
    if (media === "featured")
      change({
        ...current.current,
        image: asset.url,
        image_alt: asset.alt,
        image_width: asset.width,
        image_height: asset.height,
        image_srcset: asset.srcset,
        media_ids: [...new Set([...current.current.media_ids, asset.id])],
      });
    else if (editor.current) {
      insertAsset(editor.current, asset);
      change({
        ...current.current,
        content: editor.current.getHTML(),
        editor_json: editor.current.getJSON(),
        media_ids: [...new Set([...current.current.media_ids, asset.id])],
      });
    }
    setMediaFiles([]);
  };
  const openHistory = async () => {
    setShowHistory(!showHistory);
    if (version.current)
      try {
        setHistory(await revisions(post.id));
      } catch (e) {
        toast.error(messageFor(e));
      }
  };
  const summary = analyzeSEO(post, others);
  if (loading)
    return (
      <main className="cms-state min-h-screen" role="status">
        Opening your writing space…
      </main>
    );
  if (error)
    return (
      <main className="cms-state min-h-screen">
        <h1>Writing space unavailable</h1>
        <p role="alert">{error}</p>
        <Link className="cms-button" to="/px-manage">
          Back to dashboard
        </Link>
      </main>
    );
  return (
    <div className={`cms-editor-page ${focus ? "focused" : ""}`}>
      <header className="cms-editor-header">
        <Link
          className="cms-editor-back"
          to="/px-manage/posts"
          onClick={(e) => {
            if (dirty && !window.confirm("Leave with unsaved changes?"))
              e.preventDefault();
          }}
        >
          <ArrowLeft size={18} />
          <span>All articles</span>
        </Link>
        <span className="cms-save-status" aria-live="polite">
          {saveLabel}
        </span>
        <div className="cms-editor-header-actions">
          <button
            className="cms-button"
            title="Toggle browser fullscreen"
            onClick={async () => {
              try {
                if (document.fullscreenElement) await document.exitFullscreen();
                else await document.documentElement.requestFullscreen();
              } catch {
                toast.error("Fullscreen is unavailable in this browser.");
              }
            }}
          >
            Fullscreen
          </button>
          <button
            className="cms-button"
            onClick={() => setFocus(!focus)}
            aria-pressed={focus}
          >
            <Maximize2 size={15} />
            <span>Focus</span>
          </button>
          <button className="cms-button" onClick={() => setPreview(!preview)}>
            <Eye size={15} />
            {preview ? "Write" : "Preview"}
          </button>
          <button
            className="cms-button"
            disabled={saving}
            onClick={() => persist("draft")}
          >
            <Save size={15} />
            Save draft
          </button>
          <button
            className="cms-button primary"
            disabled={saving}
            onClick={() => persist(canPublish ? "publish" : "review")}
          >
            {saving
              ? "Saving…"
              : canPublish
                ? post.status === "scheduled"
                  ? "Schedule"
                  : post.status === "published"
                    ? "Update article"
                    : post.status === "archived"
                      ? "Archive"
                      : post.status === "in_review"
                        ? "Send for review"
                        : "Publish"
                : "Send for review"}
          </button>
        </div>
      </header>
      <div className="cms-editor-layout">
        <main className="cms-editor-main">
          <div className="cms-editor-meta">
            <span className={`cms-badge ${post.status}`}>
              {statusLabels[post.status]}
            </span>
            <small>
              {summary.words} words · {summary.characters} characters ·{" "}
              {readingTime(post.content)}
            </small>
          </div>
          {preview ? (
            <>
              <div className="cms-preview-tabs">
                <button
                  onClick={() => setMobile(false)}
                  className={!mobile ? "active" : ""}
                >
                  Desktop
                </button>
                <button
                  onClick={() => setMobile(true)}
                  className={mobile ? "active" : ""}
                >
                  Mobile
                </button>
              </div>
              <article
                className={`cms-article-preview cms-prose ${mobile ? "mobile" : ""}`}
              >
                <small>
                  {post.category} · {post.author || user?.name}
                </small>
                <h1>{post.title || "Your story title"}</h1>
                <p className="cms-preview-excerpt">{post.excerpt}</p>
                {post.image && (
                  <figure>
                    <img
                      src={post.image}
                      alt={post.image_alt}
                      width={post.image_width || undefined}
                      height={post.image_height || undefined}
                    />
                  </figure>
                )}
                <div
                  dangerouslySetInnerHTML={{
                    __html: cleanContent(post.content),
                  }}
                />
              </article>
            </>
          ) : (
            <>
              <textarea
                aria-label="Article title"
                className="cms-title-input"
                rows={2}
                value={post.title}
                placeholder="A story worth telling…"
                onChange={(e) =>
                  change({
                    ...post,
                    title: e.target.value,
                    slug: version.current ? post.slug : slugify(e.target.value),
                  })
                }
              />
              <textarea
                className="cms-excerpt-input"
                aria-label="Article excerpt"
                placeholder="A short introduction that invites people in."
                value={post.excerpt}
                onChange={(e) => change({ ...post, excerpt: e.target.value })}
              />
              <RichEditor
                content={post.content}
                onReady={receive}
                onChange={(content, json) =>
                  change({ ...current.current, content, editor_json: json })
                }
                onImage={() => setMedia("inline")}
                onFiles={(files) => {
                  setMediaFiles(files);
                  setMedia("inline");
                }}
              />
            </>
          )}
        </main>
        <aside className="cms-editor-sidebar">
          <div className="cms-sidebar-tabs">
            <button
              className={tab === "story" ? "active" : ""}
              onClick={() => setTab("story")}
            >
              <Settings2 size={15} />
              Story
            </button>
            <button
              className={tab === "seo" ? "active" : ""}
              onClick={() => setTab("seo")}
            >
              <SearchCheck size={15} />
              SEO <span>{summary.score}</span>
            </button>
          </div>
          {tab === "seo" ? (
            <SEOPanel post={post} others={others} onChange={change} />
          ) : (
            <div className="cms-form cms-story-settings">
              <h3>Story settings</h3>
              <label>
                Category
                <input
                  list="cms-categories"
                  value={post.category}
                  onChange={(e) =>
                    change({ ...post, category: e.target.value })
                  }
                />
                <datalist id="cms-categories">
                  {[...new Set(others.map((p) => p.category))].map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </label>
              <label>
                Tags
                <input
                  value={post.tags.join(", ")}
                  placeholder="Design, Development…"
                  onChange={(e) =>
                    change({
                      ...post,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                />
                <small>Separate topics with commas.</small>
              </label>
              <label className="cms-check-label">
                <input
                  type="checkbox"
                  checked={post.featured}
                  onChange={(e) =>
                    change({ ...post, featured: e.target.checked })
                  }
                />
                Feature this article
              </label>
              <h3>Featured image</h3>
              {post.image ? (
                <div className="cms-featured-picker">
                  <img
                    src={post.image}
                    alt={post.image_alt || "Featured image preview"}
                  />
                  <button
                    className="cms-button"
                    onClick={() => setMedia("featured")}
                  >
                    Replace image
                  </button>
                  <button
                    className="cms-button danger"
                    onClick={() =>
                      change({
                        ...post,
                        image: "",
                        image_alt: "",
                        image_srcset: "",
                        image_width: null,
                        image_height: null,
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  className="cms-empty-image"
                  onClick={() => setMedia("featured")}
                >
                  <ImagePlus size={26} />
                  <span>Add a featured image</span>
                </button>
              )}
              <label>
                Image alt text
                <input
                  value={post.image_alt}
                  onChange={(e) =>
                    change({ ...post, image_alt: e.target.value })
                  }
                  placeholder="Describe the image for readers…"
                />
              </label>
              <label>
                Image URL
                <input
                  value={post.image}
                  onChange={(e) =>
                    change({
                      ...post,
                      image: e.target.value,
                      image_srcset: "",
                      image_width: null,
                      image_height: null,
                    })
                  }
                  placeholder="Or use an existing HTTPS URL"
                />
              </label>
              <h3>Publishing</h3>
              <label>
                Status
                <select
                  value={post.status}
                  onChange={(e) =>
                    change({ ...post, status: e.target.value as PostStatus })
                  }
                >
                  {Object.entries(statusLabels)
                    .filter(
                      ([key]) =>
                        canPublish || ["draft", "in_review"].includes(key),
                    )
                    .map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                </select>
              </label>
              {post.status === "scheduled" && (
                <label>
                  Publish date & time
                  <input
                    type="datetime-local"
                    value={
                      post.scheduled_at
                        ? new Date(
                            new Date(post.scheduled_at).getTime() -
                              new Date(post.scheduled_at).getTimezoneOffset() *
                                60000,
                          )
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      change({
                        ...post,
                        scheduled_at: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null,
                      })
                    }
                  />
                  <small>
                    Your browser time zone:{" "}
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}. Server
                    scheduling requires Supabase Cron.
                  </small>
                </label>
              )}
              <p className="text-xs text-muted-foreground">
                Public HTML and sitemap refresh through the configured
                deployment hook. Draft previews remain inside your authenticated
                workspace.
              </p>
              <button className="cms-button w-full" onClick={openHistory}>
                <History size={16} />
                Revision history
              </button>
              {showHistory && (
                <div className="cms-revisions">
                  {history.length ? (
                    history.map((revision) => (
                      <button
                        key={revision.id}
                        onClick={() => {
                          if (
                            !window.confirm(
                              "Restore this version into the editor? Save or publish to apply it.",
                            )
                          )
                            return;
                          const restored = {
                            ...revision.snapshot,
                            id: post.id,
                            slug: post.slug,
                            updated_at: post.updated_at,
                          };
                          change(restored);
                          editor.current?.commands.setContent(
                            cleanContent(restored.content),
                          );
                          toast.success("Revision restored into the editor.");
                        }}
                      >
                        <strong>{revision.snapshot.title}</strong>
                        <small>
                          {new Date(revision.created_at).toLocaleString()}
                        </small>
                      </button>
                    ))
                  ) : (
                    <p>Save an article to create its first revision.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
      {media && (
        <MediaLibrary
          initialFiles={mediaFiles}
          onSelect={chooseAsset}
          onClose={() => {
            setMedia(null);
            setMediaFiles([]);
          }}
        />
      )}
    </div>
  );
}
