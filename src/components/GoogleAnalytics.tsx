import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function GoogleAnalytics() {
  const location = useLocation();
  const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";

  useEffect(() => {
    if (!isProduction) return;

    // Add Google Analytics script
    const script1 = document.createElement("script");
    script1.async = true;
    script1.src = "https://www.googletagmanager.com/gtag/js?id=G-YC641PMZ52";
    document.head.appendChild(script1);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag("js", new Date());
    gtag("config", "G-YC641PMZ52");

    window.gtag = gtag;

    return () => {
      // Clean up script
      document.head.removeChild(script1);
    };
  }, []);

  // Page view tracking
  useEffect(() => {
    if (!isProduction || !window.gtag) return;

    window.gtag("config", "G-YC641PMZ52", {
      page_path: location.pathname + location.search,
    });
  }, [location, isProduction]);

  return null;
}
