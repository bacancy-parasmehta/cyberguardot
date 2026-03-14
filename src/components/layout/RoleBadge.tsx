import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";

const roleClasses: Record<UserRole, string> = {
  admin: "bg-purple-500/15 text-purple-300",
  engineer: "bg-sky-500/15 text-sky-300",
  analyst: "bg-green-500/15 text-green-300",
  operator: "bg-yellow-500/15 text-yellow-300",
  executive: "bg-slate-700 text-slate-200",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        roleClasses[role],
      )}
    >
      {role}
    </span>
  );
}

