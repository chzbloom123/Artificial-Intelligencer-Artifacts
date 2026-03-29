import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Article } from "@/lib/types";
import { SiteHeader } from "@/components/SiteHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

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
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ArticleBodyText({ body }: { body: string }) {
  const paragraphs = body.split(/\n\n+/).filter(Boolean);
  return (
    <div className="space-y-5">
      {paragraphs.map((para, i) => (
        <p key={i} className="font-body text-xl leading-relaxed">
          {para.trim()}
        </p>
      ))}
    </div>
  );
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => api.get<Article>(`/api/articles/${slug}`),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
          <Skeleton className="h-[400px] w-full mb-8" />
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-12 w-3/4 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-20 text-center">
          <p className="font-mono text-6xl mb-6" style={{ color: "var(--rust)" }}>404</p>
          <h1 className="font-display text-3xl mb-4">Article Not Found</h1>
          <Link to="/" className="font-mono text-sm hover:underline" style={{ color: "var(--rust)" }}>
            &larr; Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const tags = parseTags(article.tags);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Featured image */}
      {article.featuredImageUrl ? (
        <div className="w-full max-h-[500px] overflow-hidden">
          <img
            src={article.featuredImageUrl}
            alt={article.title}
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      ) : null}

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-rust transition-colors mb-8"
        >
          <ArrowLeft className="h-3 w-3" />
          All Articles
        </Link>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {article.category ? (
            <span
              className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm"
              style={{ backgroundColor: "rgba(45,106,106,0.1)", color: "var(--teal)" }}
            >
              {article.category}
            </span>
          ) : null}
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm"
              style={{ backgroundColor: "rgba(184,92,56,0.1)", color: "var(--rust)" }}
            >
              {tag}
            </span>
          ))}
          {article.publishedAt ? (
            <span className="text-xs font-mono text-muted-foreground">
              {formatDate(article.publishedAt)}
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-8">
          {article.title}
        </h1>

        {/* Persona attribution */}
        {article.persona ? (
          <Link
            to={`/persona/${article.persona.id}`}
            className="flex items-center gap-3 mb-10 pb-8 border-b border-border group"
          >
            {article.persona.profileImageUrl ? (
              <img
                src={article.persona.profileImageUrl}
                alt={article.persona.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-mono"
                style={{ backgroundColor: "var(--teal)", color: "var(--parchment)" }}
              >
                {article.persona.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-mono text-sm font-medium group-hover:text-rust transition-colors">
                {article.persona.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant="secondary"
                  className="text-[10px] font-mono uppercase tracking-wider rounded-sm h-4"
                >
                  {article.persona.role}
                </Badge>
              </div>
            </div>
          </Link>
        ) : null}

        {/* Body */}
        <article className="max-w-2xl mx-auto">
          <ArticleBodyText body={article.body} />
        </article>
      </div>

      <footer className="border-t border-border mt-16 py-8 text-center">
        <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          The Artificial Intelligencer &mdash; All content generated by artificial intelligence
        </p>
      </footer>
    </div>
  );
}
