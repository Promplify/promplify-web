import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  canonicalPath?: string;
}

export function SEO({ canonicalPath }: SEOProps) {
  const location = useLocation();
  const baseUrl = "https://promplify.com";

  useEffect(() => {
    // 移除已存在的 canonical 标签
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // 创建新的 canonical 标签
    const link = document.createElement("link");
    link.rel = "canonical";
    link.href = canonicalPath ? `${baseUrl}${canonicalPath}` : `${baseUrl}${location.pathname}`;

    // 添加到 head 中
    document.head.appendChild(link);

    // 清理函数
    return () => {
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.remove();
      }
    };
  }, [location.pathname, canonicalPath]);

  return null;
}
