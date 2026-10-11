import { useEffect, useRef, useState, useCallback } from "react";
import { UploadCloud, Search, ImagePlus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import {
  listMedia,
  updateMedia,
  removeMedia,
  mediaUsage,
  messageFor,
} from "@/lib/cms/api";
import { uploadImage } from "@/lib/cms/media";
import type { MediaAsset } from "@/lib/cms/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
type QueueItem = {
  id: string;
  file: File;
  preview: string;
  alt: string;
  progress: number;
  error: string;
};
export default function MediaLibrary({
  onSelect,
  onClose,
  initialFiles = [],
}: {
  onSelect?: (asset: MediaAsset) => void;
  onClose?: () => void;
  initialFiles?: File[];
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([]),
    [queue, setQueue] = useState<QueueItem[]>([]),
    [query, setQuery] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [uploading, setUploading] = useState(false);
  const [active, setActive] = useState<MediaAsset | null>(null),
    [alt, setAlt] = useState(""),
    [caption, setCaption] = useState(""),
    [usage, setUsage] = useState<number | null>(null),
    [minimum, setMinimum] = useState("all");
  const input = useRef<HTMLInputElement>(null),
    objectURLs = useRef<string[]>([]),
    initialQueue = useRef(initialFiles);
  const load = async () => {
    setLoading(true);
    try {
      setAssets(await listMedia());
      setError("");
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setLoading(false);
    }
  };
  const addFiles = useCallback((files: File[]) => {
    const next = files.map((file) => {
      const preview = URL.createObjectURL(file);
      objectURLs.current.push(preview);
      return {
        id: crypto.randomUUID(),
        file,
        preview,
        alt: "",
        progress: 0,
        error: "",
      };
    });
    setQueue((q) => [...q, ...next]);
  }, []);
  useEffect(() => {
    const urls = objectURLs.current;
    void load();
    if (initialQueue.current.length) addFiles(initialQueue.current);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [addFiles]);
  const upload = async () => {
    setUploading(true);
    for (const item of queue) {
      try {
        await uploadImage(item.file, item.alt, (progress) =>
          setQueue((q) =>
            q.map((i) =>
              i.id === item.id ? { ...i, progress, error: "" } : i,
            ),
          ),
        );
        setQueue((q) => q.filter((i) => i.id !== item.id));
        toast.success(`${item.file.name} uploaded.`);
      } catch (e) {
        setQueue((q) =>
          q.map((i) => (i.id === item.id ? { ...i, error: messageFor(e) } : i)),
        );
      }
    }
    await load();
    setUploading(false);
  };
  const inspect = async (asset: MediaAsset) => {
    setActive(asset);
    setAlt(asset.alt);
    setCaption(asset.caption);
    setUsage(null);
    try {
      setUsage((await mediaUsage(asset.id)).length);
    } catch (e) {
      toast.error(messageFor(e));
    }
  };
  const remove = async () => {
    if (
      !active ||
      !window.confirm(
        `Delete “${active.name}” and its responsive files? This cannot be undone.`,
      )
    )
      return;
    try {
      await removeMedia(active);
      setActive(null);
      await load();
      toast.success("Image deleted.");
    } catch (e) {
      toast.error(messageFor(e));
      await load();
      // Deletion may have marked the asset before a storage request failed.
      // Reload that state so it cannot be inserted while awaiting a retry.
      try {
        const refreshed = await listMedia();
        setActive(refreshed.find((asset) => asset.id === active.id) || null);
      } catch {
        setActive(null);
      }
    }
  };
  const content = (
    <div
      className="cms-media-library"
      onPaste={(e) => {
        const files = Array.from(e.clipboardData.files);
        if (files.length) {
          e.preventDefault();
          addFiles(files);
        }
      }}
    >
      <div
        className="cms-dropzone"
        role="button"
        tabIndex={0}
        aria-label="Choose images to upload"
        onClick={() => input.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") input.current?.click();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(Array.from(e.dataTransfer.files));
        }}
      >
        <UploadCloud size={30} />
        <h3>Give your story a visual.</h3>
        <p>Drop images here, paste from your clipboard, or browse files.</p>
        <small>
          JPEG, PNG, WebP or AVIF · 10 MB maximum · Converted to responsive WebP
        </small>
        <input
          ref={input}
          hidden
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={(e) => {
            addFiles(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
      </div>
      {queue.length > 0 && (
        <section className="cms-upload-queue">
          <h3>Review before uploading</h3>
          {queue.map((item) => (
            <div key={item.id} className="cms-upload-item">
              <img src={item.preview} alt="Upload preview" />
              <div>
                <strong>{item.file.name}</strong>
                <label>
                  Image description (required, at least 8 characters)
                  <input
                    required
                    minLength={8}
                    disabled={uploading}
                    value={item.alt}
                    placeholder="Describe what the image shows…"
                    onChange={(e) =>
                      setQueue((q) =>
                        q.map((i) =>
                          i.id === item.id ? { ...i, alt: e.target.value } : i,
                        ),
                      )
                    }
                  />
                </label>
                {uploading && (
                  <progress
                    max={100}
                    value={item.progress}
                    aria-label={`Upload progress: ${item.file.name}`}
                  />
                )}
                <small>
                  {item.error ||
                    `${(item.file.size / 1024).toFixed(0)} KB · ${uploading ? `${item.progress}%` : "Waiting to upload"}`}
                </small>
              </div>
              <button
                className="cms-button"
                disabled={uploading}
                onClick={() =>
                  setQueue((q) => q.filter((i) => i.id !== item.id))
                }
                aria-label={`Remove ${item.file.name}`}
              >
                ×
              </button>
            </div>
          ))}
          {queue.some((item) => item.alt.trim().length < 8) && (
            <p role="status">
              Describe each image in at least 8 characters to enable uploading.
            </p>
          )}
          <button
            className="cms-button primary"
            disabled={uploading || queue.some((i) => i.alt.trim().length < 8)}
            onClick={upload}
          >
            {uploading ? "Uploading…" : "Upload reviewed images"}
          </button>
        </section>
      )}
      <div className="cms-filters">
        <label className="cms-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search image names, captions and alt text…"
            aria-label="Search media"
          />
        </label>
        <select
          aria-label="Filter by image dimensions"
          value={minimum}
          onChange={(e) => setMinimum(e.target.value)}
        >
          <option value="all">All dimensions</option>
          <option value="large">Large images (960px+)</option>
          <option value="small">Small images</option>
        </select>
      </div>
      {error ? (
        <div role="alert" className="cms-state error">
          <h3>Media library unavailable</h3>
          <p>{error}</p>
          <button className="cms-button" onClick={load}>
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="cms-state" role="status">
          Loading media…
        </div>
      ) : (
        <div className="cms-media-layout">
          <div className="cms-media-grid">
            {assets
              .filter(
                (a) =>
                  `${a.name} ${a.alt} ${a.caption}`
                    .toLowerCase()
                    .includes(query.toLowerCase()) &&
                  (minimum === "all" ||
                    (minimum === "large" ? a.width >= 960 : a.width < 960)),
              )
              .map((asset) => (
                <button
                  key={asset.id}
                  className={`cms-media-card ${active?.id === asset.id ? "selected" : ""}`}
                  onClick={() => inspect(asset)}
                >
                  <img
                    src={asset.url}
                    srcSet={asset.srcset}
                    sizes="240px"
                    alt={asset.alt}
                    width={asset.width}
                    height={asset.height}
                    loading="lazy"
                  />
                  <strong>{asset.name}</strong>
                  <small>
                    {asset.width} × {asset.height} ·{" "}
                    {(asset.size / 1024).toFixed(0)} KB
                  </small>
                </button>
              ))}
            {!assets.length && (
              <div className="cms-state">
                <ImagePlus size={30} />
                <p>Your reusable image library starts with the first upload.</p>
              </div>
            )}
          </div>
          {active && (
            <aside className="cms-media-details">
              <img src={active.url} alt={active.alt} />
              <h3>{active.name}</h3>
              <small>
                Uploaded {new Date(active.created_at).toLocaleDateString()} ·
                WebP
              </small>
              <label>
                Alt text
                <input value={alt} onChange={(e) => setAlt(e.target.value)} />
              </label>
              <label>
                Caption
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </label>
              <p>
                {usage === null
                  ? "Checking usage…"
                  : `Used by ${usage} article(s), including working drafts and retained revisions.`}
              </p>
              <button
                className="cms-button"
                onClick={async () => {
                  try {
                    const updated = await updateMedia(active.id, alt, caption);
                    setActive(updated);
                    await load();
                    toast.success(
                      "Image metadata saved. Existing article captions remain editorial snapshots.",
                    );
                  } catch (e) {
                    toast.error(messageFor(e));
                  }
                }}
              >
                Save metadata
              </button>
              {onSelect && (
                <button
                  className="cms-button primary"
                  disabled={active.state === "deleting"}
                  onClick={() => {
                    onSelect(active);
                    onClose?.();
                  }}
                >
                  <Check size={16} />
                  Use this image
                </button>
              )}
              <button
                className="cms-button danger"
                disabled={usage === null || usage > 0}
                onClick={remove}
              >
                <Trash2 size={15} />
                Delete image
              </button>
            </aside>
          )}
        </div>
      )}
    </div>
  );
  return onClose ? (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !uploading) onClose();
      }}
    >
      <DialogContent className="cms-media-modal">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
          <DialogDescription>
            Upload, organize and reuse your article images.
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  ) : (
    content
  );
}
