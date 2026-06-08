"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Link2, 
  MousePointerClick, 
  Wrench, 
  RefreshCw, 
  AlertCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";

interface AdminStats {
  totalUrls: number;
  totalClicks: number;
  totalUsers: number;
  recentUrls: Array<{ id: string; originalUrl: string; slug: string; clicks: number; createdAt: string }>;
  toolUsages: Array<{ name: string; count: number }>;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const fetchStats = React.useCallback(async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load admin stats");
      }
      setStats(data.stats);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const isAdmin = (session?.user as any)?.role === "ADMIN";
      if (!isAdmin) {
        setErrorMsg("Access denied. Admin privileges required.");
        setLoading(false);
      } else {
        fetchStats();
      }
    }
  }, [status, session, router, fetchStats]);

  if (status === "loading" || loading) {
    return (
      <div className="space-y-8 py-8 animate-pulse">
        <div className="h-10 w-48 bg-secondary rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-secondary rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-64 bg-secondary rounded-2xl" />
          <div className="h-64 bg-secondary rounded-2xl" />
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold">{errorMsg}</h2>
        <p className="text-sm text-muted-foreground max-w-md">Please ensure you are signed in with an authorized administrator account.</p>
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/95 transition-all"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor real-time URL shortening links click counters and utility tools hits analytics.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold text-foreground transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Shortened URLs</span>
              <p className="text-3xl font-extrabold text-foreground font-mono">{stats.totalUrls}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-primary/10 text-primary">
              <Link2 className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Redirect Clicks</span>
              <p className="text-3xl font-extrabold text-foreground font-mono">{stats.totalClicks}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-primary/10 text-primary">
              <MousePointerClick className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">System Users</span>
              <p className="text-3xl font-extrabold text-foreground font-mono">{stats.totalUsers}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Tool Executions</span>
              <p className="text-3xl font-extrabold text-foreground font-mono">
                {stats.toolUsages.reduce((sum, item) => sum + item.count, 0)}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-primary/10 text-primary">
              <Wrench className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {/* Grid columns */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left panel URLs */}
          <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base border-b border-border pb-2 flex items-center gap-1.5">
              <Link2 className="h-4.5 w-4.5 text-primary" />
              Recent Shortened URLs
            </h3>
            
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {stats.recentUrls.length > 0 ? (
                stats.recentUrls.map((link) => (
                  <div key={link.slug} className="p-3 rounded-xl border border-border bg-background flex flex-col justify-between sm:flex-row sm:items-center gap-3">
                    <div className="space-y-0.5 max-w-[280px] sm:max-w-[320px]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary font-mono select-all">/{link.slug}</span>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(link.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate select-all">{link.originalUrl}</p>
                    </div>
                    
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground font-bold font-mono">
                        {link.clicks} clicks
                      </span>
                      <a
                        href={`/${link.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-secondary rounded text-primary"
                        title="Visit Link"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground text-xs">No redirect links registered in database.</div>
              )}
            </div>
          </div>

          {/* Right panel Tool Usage Hits */}
          <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base border-b border-border pb-2 flex items-center gap-1.5">
              <Wrench className="h-4.5 w-4.5 text-primary" />
              Tool Usage Logs
            </h3>

            <div className="space-y-3">
              {stats.toolUsages.length > 0 ? (
                stats.toolUsages.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-border bg-background">
                    <span className="text-xs font-bold flex items-center gap-2">
                      <ChevronRight className="h-3.5 w-3.5 text-primary" />
                      {item.name}
                    </span>
                    <span className="text-xs font-extrabold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {item.count} hits
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground text-xs">No tool hits logged. Try visiting tool directories first.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
