import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  useEffect,
  type ReactNode,
  type ComponentType,
  lazy,
  Suspense,
} from "react";
import SEO from "./components/SEO";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatWidget from "./components/ChatWidget";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Login from "./pages/Login";
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const BlogEditor = lazy(() => import("./pages/BlogEditor"));
const CMSMedia = lazy(() => import("./pages/CMSMedia"));
const CMSTeam = lazy(() => import("./pages/CMSTeam"));
import NotFound from "./pages/NotFound";
import WebDevelopmentSriLanka from "./pages/WebDevelopmentSriLanka";
import AppDevelopmentSriLanka from "./pages/AppDevelopmentSriLanka";
import DigitalMarketingSriLanka from "./pages/DigitalMarketingSriLanka";
import SocialMediaMarketingSriLanka from "./pages/SocialMediaMarketingSriLanka";
import SoftwareDevelopmentSriLanka from "./pages/SoftwareDevelopmentSriLanka";

gsap.registerPlugin(ScrollTrigger);

const queryClient = new QueryClient();

const PrivateSEO = () => {
  const { pathname } = useLocation();
  return pathname.startsWith("/px-") ? (
    <SEO
      title="Paxxmo administration"
      description="Sign in to manage Paxxmo content."
      noindex
    />
  ) : null;
};

const SmoothScroll = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith("/blog") || pathname.startsWith("/px-")) return;
    const lenis = new Lenis({
      // Smoothing duration — lower = snappier, higher = floatier
      duration: 1.2,
      smoothWheel: true,
      gestureOrientation: "vertical",
      // Slow down wheel so it doesn't fly past sections
      wheelMultiplier: 0.75,
      touchMultiplier: 1.0,
      // Keep lerp gentle so arrow-key steps are smooth
      lerp: 0.08,
    });

    // Sync Lenis scroll position into GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis via GSAP ticker so both run on the same frame
    const lenisTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      gsap.ticker.remove(lenisTicker);
    };
  }, [pathname]);
  return null;
};
const PublicChat = () => {
  const { pathname } = useLocation();
  return pathname.startsWith("/px-") ? null : <ChatWidget />;
};

const App = ({
  router: Router = BrowserRouter,
}: {
  router?: ComponentType<{ children: ReactNode }>;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router>
            <PrivateSEO />
            <SmoothScroll />
            <Suspense
              fallback={
                <div
                  role="status"
                  className="min-h-screen flex items-center justify-center"
                >
                  Loading...
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Index />} />
                <Route
                  path="/px-manage/media"
                  element={
                    <ProtectedRoute>
                      <CMSMedia />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/px-manage/team"
                  element={
                    <ProtectedRoute>
                      <CMSTeam />
                    </ProtectedRoute>
                  }
                />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/page/:page" element={<Blog />} />
                <Route path="/blog/category/:slug" element={<Blog />} />
                <Route
                  path="/blog/category/:slug/page/:page"
                  element={<Blog />}
                />
                <Route path="/blog/tag/:slug" element={<Blog />} />
                <Route path="/blog/tag/:slug/page/:page" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/px-portal" element={<Login />} />
                <Route
                  path="/px-manage"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/px-manage/posts"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/px-manage/posts/new"
                  element={
                    <ProtectedRoute>
                      <BlogEditor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/px-manage/posts/:id/edit"
                  element={
                    <ProtectedRoute>
                      <BlogEditor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/web-development-sri-lanka"
                  element={<WebDevelopmentSriLanka />}
                />
                <Route
                  path="/app-development-sri-lanka"
                  element={<AppDevelopmentSriLanka />}
                />
                <Route
                  path="/digital-marketing-sri-lanka"
                  element={<DigitalMarketingSriLanka />}
                />
                <Route
                  path="/social-media-marketing-sri-lanka"
                  element={<SocialMediaMarketingSriLanka />}
                />
                <Route
                  path="/software-development-sri-lanka"
                  element={<SoftwareDevelopmentSriLanka />}
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <PublicChat />
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
