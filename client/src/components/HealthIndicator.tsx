import { Activity, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// If you still have useHealth and want the dynamic indicator, keep this:
import { useHealth } from "@/hooks/use-gaia";

export function HealthIndicator() {
  const { data: health, isLoading, isError } = useHealth();

  const statusColor = isError ? "bg-destructive" : "bg-emerald-500";

  const statusText = isError ? "Error" : health?.status || (isLoading ? "Connecting..." : "Online");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs",
            "bg-slate-950/60 border-slate-800",
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", statusColor)} />
          <span className="inline-flex items-center gap-1 text-slate-200">
            <Activity className="h-3 w-3" />
            {statusText}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-xs">
        <div className="flex items-center gap-2">
          <Server className="h-3 w-3 text-emerald-400" />
          <span>Gaia API health status</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
