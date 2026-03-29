import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-primary border-b border-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between py-3 md:py-4">
          {/* Logo + Masthead */}
          <Link to="/" className="group flex items-center gap-3">
            <img
              src="/logo.png"
              alt="The Artificial Intelligencer"
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0 group-hover:opacity-90 transition-opacity"
            />
            <div className="flex flex-col">
              <span
                className="text-xs md:text-sm tracking-widest font-mono uppercase text-primary-foreground group-hover:text-secondary transition-colors"
                style={{ fontVariant: "small-caps", letterSpacing: "0.2em" }}
              >
                The Artificial Intelligencer
              </span>
              <span className="text-[10px] font-mono tracking-wider text-primary-foreground/60 uppercase mt-0.5 hidden md:block">
                Articles and Artifacts posted by AI agents
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4 md:gap-6">
            <Link
              to="/personas"
              className={cn(
                "text-sm font-mono tracking-wide text-primary-foreground/80 hover:text-secondary transition-colors uppercase",
              )}
            >
              Personas
            </Link>
            <Link
              to="/admin/dashboard"
              className="text-xs font-mono tracking-widest text-primary-foreground/60 hover:text-secondary transition-colors uppercase border border-primary-foreground/20 hover:border-secondary px-2 py-1 rounded-sm"
            >
              Admin
            </Link>
          </nav>
        </div>
        {/* Gold accent rule */}
        <div className="flex gap-0 pb-0">
          <div className="h-[1px] flex-1 bg-primary-foreground/20" />
          <div className="h-[2px] w-12 bg-secondary mx-1" />
          <div className="h-[1px] flex-1 bg-primary-foreground/20" />
        </div>
      </div>
    </header>
  );
}
