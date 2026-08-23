import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";

type PageProps = {
  searchParams: {
    actor?: string;
  };
};

export default async function AdminAuditLogsPage({ searchParams }: PageProps) {
  await requireRole(["MODERATOR", "SUPPORT", "FINANCE", "ADMIN", "SUPER_ADMIN"]);

  const actorFilter = searchParams.actor || "ALL";

  const whereClause: Record<string, unknown> = {};
  if (actorFilter !== "ALL") {
    whereClause.actor = { email: actorFilter };
  }

  let logs: any[] = [];
  try {
    logs = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch (error) {
    console.error("Database connection error in AdminAuditLogsPage:", error);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-medium text-amber-500 uppercase tracking-wider">
            Compliance & Security
          </span>
          <h1 className="text-3xl font-display font-bold text-ink">System Audit Trail</h1>
        </div>

        {/* Actor Surveillance Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/audit"
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
              actorFilter === "ALL"
                ? "bg-navy-900 text-amber-400 shadow-sm"
                : "bg-navy-50 text-navy-600 hover:bg-navy-100"
            }`}
          >
            All System Events
          </Link>
          <Link
            href="/admin/audit?actor=sumitgautam@cartigo.admin"
            className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${
              actorFilter === "sumitgautam@cartigo.admin"
                ? "bg-amber-500 text-navy-900 shadow-sm"
                : "bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100"
            }`}
          >
            🕵️ Monitor Sumit Gautam
          </Link>
          <Link
            href="/admin/audit?actor=amanshukla@cartigo.admin"
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
              actorFilter === "amanshukla@cartigo.admin"
                ? "bg-navy-900 text-white shadow-sm"
                : "bg-navy-50 text-navy-600 hover:bg-navy-100"
            }`}
          >
            Aman Shukla Actions
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-line pb-3">
          <CardTitle className="text-lg">Audit Events Log ({logs.length})</CardTitle>
          <CardDescription>Immutable trail of administrative decisions, moderation actions, and financial transactions</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {logs.length === 0 ? (
            <p className="p-8 text-center text-xs text-navy-400">No audit events recorded yet.</p>
          ) : (
            <div className="divide-y divide-line">
              {logs.map((log) => (
                <div key={log.id} className="p-4 space-y-2 hover:bg-navy-50/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-navy-900 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-400">
                        {log.action}
                      </span>
                      <span className="text-xs font-semibold text-ink">
                        Entity: {log.entityType} ({log.entityId.slice(0, 12)}...)
                      </span>
                    </div>

                    <div className="text-xs text-navy-600 flex items-center gap-4">
                      <span>Actor: <strong className="text-ink">{log.actor?.name || log.actor?.email || "System"}</strong></span>
                      <span className="font-mono text-navy-400">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {(log.beforeJson || log.afterJson) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                      {log.beforeJson && (
                        <div className="bg-navy-50 p-2 rounded border border-line overflow-x-auto">
                          <span className="text-navy-400 block font-bold mb-0.5">Before:</span>
                          <pre className="text-navy-600">{JSON.stringify(log.beforeJson, null, 2)}</pre>
                        </div>
                      )}
                      {log.afterJson && (
                        <div className="bg-success/5 p-2 rounded border border-success/20 overflow-x-auto">
                          <span className="text-success block font-bold mb-0.5">After:</span>
                          <pre className="text-ink">{JSON.stringify(log.afterJson, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
