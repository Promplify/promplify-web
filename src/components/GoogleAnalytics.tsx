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

    // 添加 Google Analytics 脚本
    const script1 = document.createElement("script");
    script1.async = true;
    script1.src = "https://www.googletagmanager.com/gtag/js?id=G-YC641PMZ52";
    document.head.appendChild(script1);

    // 初始化 gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag("js", new Date());
    gtag("config", "G-YC641PMZ52");

    window.gtag = gtag;

    return () => {
      // 清理脚本
      document.head.removeChild(script1);
    };
  }, []);

  // 页面浏览追踪
  useEffect(() => {
    if (!isProduction || !window.gtag) return;

    window.gtag("config", "G-YC641PMZ52", {
      page_path: location.pathname + location.search,
    });
  }, [location, isProduction]);

  return null;
}
