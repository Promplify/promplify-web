import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  canonicalPath?: string;
  title?: string;
  description?: string;
  keywords?: string;
  imageUrl?: string;
}

export function SEO({ canonicalPath, title, description, keywords, imageUrl }: SEOProps) {
  const location = useLocation();
  const baseUrl = "https://promplify.com";
  const defaultImage = `${baseUrl}/og-image.jpg`;

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

    // 更新或添加Open Graph和Twitter卡片元数据
    const ogTags = {
      "og:url": canonicalPath ? `${baseUrl}${canonicalPath}` : `${baseUrl}${location.pathname}`,
      "og:type": "website",
      "og:title": title || document.title,
      "og:description": description || "",
      "og:image": imageUrl || defaultImage,
      "twitter:card": "summary_large_image",
      "twitter:title": title || document.title,
      "twitter:description": description || "",
      "twitter:image": imageUrl || defaultImage,
    };

    // 为每个OG和Twitter标签设置值
    Object.entries(ogTags).forEach(([property, content]) => {
      let meta = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);

      if (meta) {
        meta.setAttribute(property.startsWith("og:") ? "property" : "name", property);
        meta.setAttribute("content", content);
      } else {
        meta = document.createElement("meta");
        meta.setAttribute(property.startsWith("og:") ? "property" : "name", property);
        meta.setAttribute("content", content);
        document.head.appendChild(meta);
      }
    });

    // 清理函数
    return () => {
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.remove();
      }
    };
  }, [location.pathname, canonicalPath, title, description, keywords, imageUrl]);

  return null;
}
