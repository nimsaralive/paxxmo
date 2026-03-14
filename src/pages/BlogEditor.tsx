import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Eye,
  Image as ImageIcon,
  Tag,
  X,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Link as LinkIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBlogStore, BLOG_IMAGES } from "@/stores/blogStore";
import { revealInView, revealTransition } from "@/lib/motion";

const BlogEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts, addPost, updatePost, getPost, fetchPosts } = useBlogStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const isEditing = !!id;
  const existingPost = isEditing ? getPost(id) : null;

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [image, setImage] = useState(BLOG_IMAGES.default1);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load existing post data
  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setExcerpt(existingPost.excerpt);
      setContent(existingPost.content);
      setTags(existingPost.tags);
      setImage(existingPost.image);
      setStatus(existingPost.status);
    }
  }, [existingPost]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const insertFormatting = (before: string, after: string = before) => {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    setContent(newContent);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleSave = async (saveStatus: "draft" | "published") => {
    if (!title.trim() || !content.trim()) {
      alert("Please fill in the title and content");
      return;
    }

    setIsSaving(true);

    const postData = {
      title: title.trim(),
      excerpt: excerpt.trim() || title.trim().substring(0, 150) + "...",
      content: content.trim(),
      tags,
      image,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      readTime: "5 min read", // Will be recalculated by store
      author: user?.name || "Nimsara Liyanage",
      authorRole: user?.role || "CEO & Founder",
      status: saveStatus,
    };

    try {
      if (isEditing && id) {
        await updatePost(id, postData);
      } else {
        await addPost(postData);
      }
      navigate("/px-manage");
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/px-manage"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-xl text-foreground">
                {isEditing ? "Edit Post" : "New Post"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {status === "draft" ? "Draft" : "Published"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? "Editor" : "Preview"}
            </button>
            <button
              onClick={() => handleSave("draft")}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave("published")}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Publish"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <motion.div {...revealInView} transition={revealTransition}>
          {showPreview ? (
            // Preview Mode
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="max-w-3xl mx-auto">
                {image && (
                  <img
                    src={image}
                    alt={title}
                    className="w-full aspect-[21/9] object-cover rounded-xl mb-8"
                  />
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
                  {title || "Untitled Post"}
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  {excerpt || "No excerpt provided"}
                </p>
                <div
                  className="prose prose-lg prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: content || "<p>No content yet</p>" }}
                />
              </div>
            </div>
          ) : (
            // Editor Mode
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Editor */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter post title..."
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-xl font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief description for listings..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Content
                  </label>
                  
                  {/* Toolbar */}
                  <div className="flex items-center gap-1 p-2 border border-border border-b-0 rounded-t-lg bg-muted/30">
                    <button
                      type="button"
                      onClick={() => insertFormatting("<strong>", "</strong>")}
                      className="p-2 rounded hover:bg-muted transition-colors"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("<em>", "</em>")}
                      className="p-2 rounded hover:bg-muted transition-colors"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <button
                      type="button"
                      onClick={() => insertFormatting("<h2>", "</h2>")}
                      className="p-2 rounded hover:bg-muted transition-colors"
                      title="Heading"
                    >
                      <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("<blockquote>", "</blockquote>")}
                      className="p-2 rounded hover:bg-muted transition-colors"
                      title="Quote"
                    >
                      <Quote className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <button
                      type="button"
                      onClick={() => insertFormatting("<ul>\n  <li>", "</li>\n</ul>")}
                      className="p-2 rounded hover:bg-muted transition-colors"
                      title="Bullet List"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("<ol>\n  <li>", "</li>\n</ol>")}
                      className="p-2 rounded hover:bg-muted transition-colors"
                      title="Numbered List"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <button
                      type="button"
                      onClick={() => insertFormatting('<a href="url">', "</a>")}
                      className="p-2 rounded hover:bg-muted transition-colors"
                      title="Link"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("<p>", "</p>")}
                      className="p-2 rounded hover:bg-muted transition-colors"
                      title="Paragraph"
                    >
                      <span className="text-xs font-medium">¶</span>
                    </button>
                  </div>

                  <textarea
                    id="content-editor"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your content using HTML tags...

Example:
<p>Your paragraph text here.</p>

<h2>Section Heading</h2>
<p>More content...</p>

<ul>
  <li><strong>Bold item:</strong> Description</li>
  <li>Another list item</li>
</ul>"
                    rows={20}
                    className="w-full px-4 py-3 rounded-b-lg border border-border bg-background text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Featured Image */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <label className="block text-sm font-medium text-foreground mb-4">
                    <ImageIcon className="w-4 h-4 inline mr-2" />
                    Featured Image
                  </label>
                  <div className="space-y-3">
                    <img
                      src={image}
                      alt="Featured"
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setImage(BLOG_IMAGES.default1)}
                        className={`p-2 rounded-lg border transition-colors ${
                          image === BLOG_IMAGES.default1
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={BLOG_IMAGES.default1}
                          alt="Option 1"
                          className="w-full aspect-video object-cover rounded"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => setImage(BLOG_IMAGES.default2)}
                        className={`p-2 rounded-lg border transition-colors ${
                          image === BLOG_IMAGES.default2
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={BLOG_IMAGES.default2}
                          alt="Option 2"
                          className="w-full aspect-video object-cover rounded"
                        />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Or enter custom image URL..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <label className="block text-sm font-medium text-foreground mb-4">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add a tag..."
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {/* Suggested Tags */}
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Suggested:</p>
                    <div className="flex flex-wrap gap-1">
                      {["Design", "Branding", "UX", "Strategy", "Marketing", "Web Design"].map(
                        (suggestion) =>
                          !tags.includes(suggestion) && (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setTags([...tags, suggestion])}
                              className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              {suggestion}
                            </button>
                          )
                      )}
                    </div>
                  </div>
                </div>

                {/* Help */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-sm font-medium text-foreground mb-3">HTML Tips</h3>
                  <div className="text-xs text-muted-foreground space-y-2">
                    <p><code className="text-primary">&lt;p&gt;</code> Paragraph</p>
                    <p><code className="text-primary">&lt;h2&gt;</code> Heading</p>
                    <p><code className="text-primary">&lt;strong&gt;</code> Bold</p>
                    <p><code className="text-primary">&lt;em&gt;</code> Italic</p>
                    <p><code className="text-primary">&lt;ul&gt;&lt;li&gt;</code> List</p>
                    <p><code className="text-primary">&lt;a href=""&gt;</code> Link</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default BlogEditor;
