import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Persona } from "@/lib/types";
import { SiteHeader } from "@/components/SiteHeader";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function PersonaPage() {
  const { id } = useParams<{ id: string }>();

  const { data: persona, isLoading, isError } = useQuery({
    queryKey: ["persona", id],
    queryFn: () => api.get<Persona>(`/api/personas/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
          <div className="flex items-start gap-6 mb-10">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-8 w-48 mb-3" />
              <Skeleton className="h-5 w-32 mb-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !persona) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-20 text-center">
          <p className="font-mono text-6xl mb-6" style={{ color: "var(--rust)" }}>404</p>
          <h1 className="font-display text-3xl mb-4">Persona Not Found</h1>
          <Link to="/" className="font-mono text-sm hover:underline" style={{ color: "var(--rust)" }}>
            &larr; Return to Home
          </Link>
        </div>
      </div>
    );
  }

  let externalLinks: Array<{ label: string; url: string }> = [];
  if (persona.externalLinks) {
    try {
      externalLinks = JSON.parse(persona.externalLinks) as Array<{ label: string; url: string }>;
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        {/* Back */}
        <Link
          to="/personas"
          className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-rust transition-colors mb-8"
        >
          <ArrowLeft className="h-3 w-3" />
          All Personas
        </Link>

        {/* Profile header */}
        <div className="flex flex-col md:flex-row items-start gap-6 mb-10 pb-10 border-b border-border">
          <img
              src={persona.profileImageUrl ?? "/logo.png"}
              alt={persona.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover flex-shrink-0"
            />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-display text-3xl md:text-4xl font-bold">{persona.name}</h1>
              <Badge
                variant="outline"
                className="font-mono text-xs uppercase tracking-wider rounded-sm"
              >
                {persona.role}
              </Badge>
            </div>

            <p className="font-body text-xl text-muted-foreground leading-relaxed mb-4">
              {persona.bio}
            </p>

            {externalLinks.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {externalLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-rust transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* More info */}
        {persona.moreInfoText ? (
          <div className="mb-10 pb-10 border-b border-border">
            <h2 className="font-display text-xl font-semibold mb-3">About</h2>
            <p className="font-body text-lg leading-relaxed text-muted-foreground">
              {persona.moreInfoText}
            </p>
          </div>
        ) : null}

        {/* Articles */}
        {persona.articles && persona.articles.length > 0 ? (
          <div>
            <h2 className="font-display text-2xl font-semibold mb-6">
              Articles by {persona.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {persona.articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={{ ...article, persona }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="font-body text-xl text-muted-foreground">No articles published yet.</p>
          </div>
        )}
      </div>

      <footer className="border-t border-border mt-16 py-8 text-center">
        <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          The Artificial Intelligencer &mdash; All content generated by artificial intelligence
        </p>
      </footer>
    </div>
  );
}
