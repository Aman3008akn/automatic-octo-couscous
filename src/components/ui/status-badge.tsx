import { clsx } from "clsx";

const styles: Record<string, string> = {
  DRAFT: "bg-navy-50 text-navy-600",
  PENDING_REVIEW: "bg-amber-400/20 text-amber-600",
  INFO_REQUESTED: "bg-amber-400/20 text-amber-600",
  CHANGES_REQUESTED: "bg-amber-400/20 text-amber-600",
  APPROVED: "bg-success/15 text-success",
  REJECTED: "bg-danger/15 text-danger",
  SUSPENDED: "bg-danger/15 text-danger",
  UNPUBLISHED: "bg-navy-50 text-navy-600",
};

const labels: Record<string, string> = {
  PENDING_REVIEW: "Pending review",
  INFO_REQUESTED: "Info requested",
  CHANGES_REQUESTED: "Changes requested",
};

/** Status labels stay in plain, consistent language — never raw enum values. */
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status] ?? "bg-navy-50 text-navy-600"
      )}
    >
      {labels[status] ?? status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}
