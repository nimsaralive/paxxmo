import { useEffect } from "react";

// Tawk.to Live Chat Integration
// 
// HOW TO SET UP:
// 1. Go to https://www.tawk.to and create a FREE account
// 2. Add your website (paxxmo.com)
// 3. Go to Administration → Channels → Chat Widget
// 4. Copy your Property ID and Widget ID from the widget code
//    The code looks like: https://embed.tawk.to/PROPERTY_ID/WIDGET_ID
// 5. Add to your .env file:
//    VITE_TAWK_PROPERTY_ID=your_property_id
//    VITE_TAWK_WIDGET_ID=your_widget_id
//
// FEATURES (all FREE):
// - Unlimited agents
// - Unlimited chat history
// - Mobile apps for iOS/Android
// - Desktop notifications
// - Visitor tracking
// - Canned responses
// - File sharing
// - Screen sharing
// - Video + voice calls

const TAWK_PROPERTY_ID = import.meta.env.VITE_TAWK_PROPERTY_ID || "";
const TAWK_WIDGET_ID = import.meta.env.VITE_TAWK_WIDGET_ID || "default";

declare global {
  interface Window {
    Tawk_API?: {
      toggle?: () => void;
      maximize?: () => void;
      minimize?: () => void;
      hideWidget?: () => void;
      showWidget?: () => void;
      popup?: () => void;
      getWindowType?: () => string;
      getStatus?: () => string;
      isChatMaximized?: () => boolean;
      isChatMinimized?: () => boolean;
      isChatHidden?: () => boolean;
      isChatOngoing?: () => boolean;
      isVisitorEngaged?: () => boolean;
      onLoad?: () => void;
      onStatusChange?: (status: string) => void;
      onBeforeLoad?: () => void;
      onChatMaximized?: () => void;
      onChatMinimized?: () => void;
      onChatHidden?: () => void;
      onChatStarted?: () => void;
      onChatEnded?: () => void;
      onPrechatSubmit?: (data: unknown) => void;
      onOfflineSubmit?: (data: unknown) => void;
      setAttributes?: (attributes: Record<string, string>, callback?: (error?: unknown) => void) => void;
      addEvent?: (event: string, metadata?: Record<string, unknown>, callback?: (error?: unknown) => void) => void;
      addTags?: (tags: string[], callback?: (error?: unknown) => void) => void;
      removeTags?: (tags: string[], callback?: (error?: unknown) => void) => void;
    };
    Tawk_LoadStart?: Date;
  }
}

const ChatWidget = () => {
  useEffect(() => {
    // Don't load if Property ID isn't configured
    if (!TAWK_PROPERTY_ID) {
      console.info(
        "💬 Tawk.to live chat not configured.\n" +
        "To enable:\n" +
        "1. Sign up at https://www.tawk.to (free)\n" +
        "2. Add VITE_TAWK_PROPERTY_ID and VITE_TAWK_WIDGET_ID to your .env file"
      );
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="embed.tawk.to"]`);
    if (existingScript) return;

    // Initialize Tawk.to API
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Optional: Customize widget behavior
    window.Tawk_API.onLoad = function() {
      console.log("Tawk.to chat widget loaded");
    };

    // Create and inject the script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.querySelector(`script[src*="embed.tawk.to"]`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
      // Clean up Tawk iframe
      const tawkIframe = document.querySelector('iframe[title*="chat"]');
      if (tawkIframe) {
        tawkIframe.remove();
      }
    };
  }, []);

  // Tawk.to renders its own widget, nothing to render here
  return null;
};

export default ChatWidget;

// Optional: Export helper functions to control chat programmatically
export const openChat = () => window.Tawk_API?.maximize?.();
export const closeChat = () => window.Tawk_API?.minimize?.();
export const toggleChat = () => window.Tawk_API?.toggle?.();
export const hideChat = () => window.Tawk_API?.hideWidget?.();
export const showChat = () => window.Tawk_API?.showWidget?.();
