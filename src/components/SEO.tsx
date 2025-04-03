import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  canonicalPath?: string;
  title?: string;
  description?: string;
  keywords?: string;
}

export function SEO({ canonicalPath, title, description, keywords }: SEOProps) {
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

    // 更新 title 和 description
    if (title) {
      document.title = title;
    }

    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", description);
      } else {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = description;
        document.head.appendChild(meta);
      }
    }

    // 更新 keywords
    if (keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute("content", keywords);
      } else {
        const meta = document.createElement("meta");
        meta.name = "keywords";
        meta.content = keywords;
        document.head.appendChild(meta);
      }
    }

    // 清理函数
    return () => {
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.remove();
      }
    };
  }, [location.pathname, canonicalPath, title, description, keywords]);

  return null;
}
