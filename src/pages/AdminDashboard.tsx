import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  LogOut,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Globe,
  FileEdit,
  Search,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBlogStore, BlogPost } from "@/stores/blogStore";
import { revealInView, revealTransition } from "@/lib/motion";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { posts, deletePost, publishPost, unpublishPost, fetchPosts, isLoading } = useBlogStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || post.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(id);
    }
    setActiveMenu(null);
  };

  const togglePublish = async (post: BlogPost) => {
    if (post.status === "published") {
      await unpublishPost(post.id);
    } else {
      await publishPost(post.id);
    }
    setActiveMenu(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 flex flex-col">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="font-display text-2xl text-foreground">Paxxmo</h1>
          <p className="text-xs text-muted-foreground">Admin Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <Link
            to="/px-manage"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            to="/px-manage/posts"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <FileText className="w-5 h-5" />
            All Posts
          </Link>
          <Link
            to="/px-manage/posts/new"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            New Post
          </Link>
        </nav>

        {/* User Info */}
        <div className="pt-6 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <motion.div {...revealInView} transition={revealTransition}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl text-foreground">Dashboard</h2>
              <p className="text-muted-foreground">Manage your blog posts</p>
            </div>
            <Link
              to="/px-manage/posts/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              New Post
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display text-foreground">{posts.length}</p>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-display text-foreground">{publishedCount}</p>
                  <p className="text-sm text-muted-foreground">Published</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <FileEdit className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-display text-foreground">{draftCount}</p>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Posts</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>

          {/* Posts Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Tags</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate max-w-[300px]">{post.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[300px]">{post.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.status === "published"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {post.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{post.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="px-2 py-0.5 text-xs text-muted-foreground">
                            +{post.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 relative">
                        <Link
                          to={`/blog/${post.id}`}
                          target="_blank"
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/px-manage/posts/${post.id}/edit`}
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === post.id ? null : post.id)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {activeMenu === post.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg py-1 z-10">
                              <button
                                onClick={() => togglePublish(post)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                              >
                                {post.status === "published" ? "Unpublish" : "Publish"}
                              </button>
                              <button
                                onClick={() => handleDelete(post.id)}
                                className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No posts found</p>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="mt-6 flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View Website →
            </Link>
            <Link
              to="/blog"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View Blog →
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
