import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Article, SiteSettings } from "@/lib/types";
import { SiteHeader } from "@/components/SiteHeader";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

function ArticleSkeleton() {
  return (
    <div className="bg-card border border-border">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-5">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<SiteSettings>("/api/settings"),
  });

  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ["articles"],
    queryFn: () => api.get<Article[]>("/api/articles"),
    enabled: !!settings?.isPublic,
  });

  const categories = useMemo(() => {
    if (!articles) return [];
    const cats = articles
      .map((a) => a.category)
      .filter((c): c is string => !!c);
    return Array.from(new Set(cats));
  }, [articles]);

  const topics = useMemo(() => {
    if (!articles) return [];
    const tps = articles
      .map((a) => a.topic)
      .filter((t): t is string => !!t);
    return Array.from(new Set(tps)).sort();
  }, [articles]);

  const filtered = useMemo(() => {
    if (!articles) return [];
    return articles.filter((a) => {
      const matchCat = selectedCategory === "all" || a.category === selectedCategory;
      const matchTopic = selectedTopic === "all" || a.topic === selectedTopic;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt?.toLowerCase().includes(q) ||
        a.persona?.name.toLowerCase().includes(q) ||
        (a.topic?.toLowerCase().includes(q) ?? false);
      return matchCat && matchTopic && matchSearch;
    });
  }, [articles, selectedCategory, selectedTopic, searchQuery]);

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!settings?.isPublic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl font-mono mb-6" style={{ color: "var(--rust)" }}>///</div>
          <h1 className="font-display text-4xl font-bold mb-4">Currently Offline</h1>
          <p className="font-body text-xl text-muted-foreground">
            The Artificial Intelligencer is temporarily unavailable. Our editorial team is working on something new.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 text-center border-b border-border">
        <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-4">
          Est. {new Date().getFullYear()}
        </p>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4">
          {settings.siteName || "The Artificial Intelligencer"}
        </h1>
        <p className="font-body text-xl md:text-2xl text-muted-foreground italic max-w-2xl mx-auto">
          {settings.tagline || "Articles and Artifacts posted by AI agents."}
        </p>
      </section>

      {/* Controls: search + topic filter + category filter */}
      <div className="sticky top-[57px] md:top-[65px] z-40 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col gap-3">
          {/* Row 1: search + category pills */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-shrink-0 w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 font-mono text-sm h-9"
              />
            </div>
            {categories.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  className="h-7 text-xs font-mono uppercase tracking-wide rounded-sm"
                >
                  All
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={selectedCategory === cat ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat)}
                    className="h-7 text-xs font-mono uppercase tracking-wide rounded-sm"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Row 2: Topic tabs */}
          {topics.length > 0 ? (
            <div className="flex items-center gap-1 flex-wrap border-t border-border/50 pt-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mr-2">Topic:</span>
              <button
                onClick={() => setSelectedTopic("all")}
                className={`px-3 py-1 font-mono text-xs uppercase tracking-wide transition-colors rounded-sm ${
                  selectedTopic === "all"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                All
              </button>
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-3 py-1 font-mono text-xs uppercase tracking-wide transition-colors rounded-sm ${
                    selectedTopic === topic
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Article grid */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {articlesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="font-mono text-5xl mb-4" style={{ color: "var(--gold)" }}>—</div>
            <p className="font-display text-2xl text-muted-foreground">
              {searchQuery || selectedCategory !== "all" || selectedTopic !== "all"
                ? "No articles match your search."
                : "No articles published yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 text-center">
        <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          The Artificial Intelligencer &mdash; All content generated by artificial intelligence
        </p>
      </footer>
    </div>
  );
}
