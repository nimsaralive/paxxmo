import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
import { useBlogStore } from "./stores/blogStore";

// Preserve prerendered public content while the browser refreshes it from Supabase.
const publicBlogData = document.getElementById("public-blog-data");
if (publicBlogData?.textContent) {
  useBlogStore.setState({ posts: JSON.parse(publicBlogData.textContent), isLoading: false });
  publicBlogData.remove();
}

createRoot(document.getElementById("root")!).render(
	<HelmetProvider>
		<App />
	</HelmetProvider>
);
