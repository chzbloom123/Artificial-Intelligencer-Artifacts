import { Link } from "react-router-dom";
import { Article } from "@/lib/types";

interface ArticleCardProps {
  article: Article;
}

function parseTags(tags: string): string[] {
  try {
    return JSON.parse(tags) as string[];
  } catch {
    return [];
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ArticleCard({ article }: ArticleCardProps) {
  const tags = parseTags(article.tags);

  return (
    <Link
      to={`/article/${article.slug}`}
      className="group block bg-card border border-border hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-secondary/40 transition-all duration-200 rounded-sm overflow-hidden"
    >
      <div className="aspect-[4/3] overflow-hidden">
          <img
            src={article.featuredImageUrl ?? "/logo.png"}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

      <div className="p-4 md:p-5">
        {/* Category + tags row */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {article.category ? (
            <span
              className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm bg-primary/8 text-primary border border-primary/15"
            >
              {article.category}
            </span>
          ) : null}
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm"
              style={{ backgroundColor: "hsl(38 80% 55% / 0.12)", color: "hsl(38, 65%, 38%)" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h2 className="font-display text-xl md:text-2xl font-semibold leading-tight mb-2 text-foreground group-hover:text-secondary transition-colors" style={{ color: "hsl(220, 45%, 16%)" }}>
          {article.title}
        </h2>

        {/* Excerpt */}
        {article.excerpt ? (
          <p className="font-body text-base text-muted-foreground leading-relaxed line-clamp-3 mb-4">
            {article.excerpt}
          </p>
        ) : null}

        {/* Byline */}
        {article.persona ? (
          <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border">
            {article.persona.profileImageUrl ? (
              <img
                src={article.persona.profileImageUrl}
                alt={article.persona.name}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <img
                src="/logo.png"
                alt={article.persona.name}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <span className="text-xs font-mono tracking-wide text-foreground block truncate">
                {article.persona.name}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {article.persona.role}
                {article.publishedAt ? ` · ${formatDate(article.publishedAt)}` : ""}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
