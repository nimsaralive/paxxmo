import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
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
import AdminDashboard from "./pages/AdminDashboard";
import BlogEditor from "./pages/BlogEditor";
import NotFound from "./pages/NotFound";
import WebDevelopmentSriLanka from "./pages/WebDevelopmentSriLanka";
import AppDevelopmentSriLanka from "./pages/AppDevelopmentSriLanka";
import DigitalMarketingSriLanka from "./pages/DigitalMarketingSriLanka";
import SocialMediaMarketingSriLanka from "./pages/SocialMediaMarketingSriLanka";
import SoftwareDevelopmentSriLanka from "./pages/SoftwareDevelopmentSriLanka";

gsap.registerPlugin(ScrollTrigger);

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/blog" element={<Blog />} />
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
              <Route path="/web-development-sri-lanka" element={<WebDevelopmentSriLanka />} />
              <Route path="/app-development-sri-lanka" element={<AppDevelopmentSriLanka />} />
              <Route path="/digital-marketing-sri-lanka" element={<DigitalMarketingSriLanka />} />
              <Route path="/social-media-marketing-sri-lanka" element={<SocialMediaMarketingSriLanka />} />
              <Route path="/software-development-sri-lanka" element={<SoftwareDevelopmentSriLanka />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatWidget />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
