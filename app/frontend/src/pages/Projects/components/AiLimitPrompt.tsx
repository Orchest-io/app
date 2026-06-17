import { Link } from "react-router-dom";

interface AiLimitPromptProps {
  used: number;
  limit: number;
  tier: "free" | "pro";
}

export default function AiLimitPrompt({ used, limit, tier }: AiLimitPromptProps) {
  const tierLabel = tier === "free" ? "Free" : "Pro";

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-amber-400 text-[22px] mt-0.5 shrink-0">
          warning
        </span>
        <div className="flex-1">
          <p className="text-amber-400 font-semibold text-sm leading-snug">
            Monthly AI generation limit reached
          </p>
          <p className="text-amber-400/80 text-xs mt-1">
            You&apos;ve used{" "}
            <span className="font-bold text-amber-300">
              {used}/{limit}
            </span>{" "}
            AI task generations this month on the{" "}
            <span className="font-bold text-amber-300">{tierLabel}</span> plan.
          </p>
        </div>
      </div>

      {/* Reset info */}
      <p className="text-xs text-amber-400/60 pl-8">
        Resets at the start of next month.
      </p>

      {/* Upgrade CTA */}
      <div className="pl-8">
        <Link
          to="/settings/billing"
          className="inline-flex items-center gap-2 bg-electric-blue text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[14px]">
            workspace_premium
          </span>
          Upgrade Plan
        </Link>
      </div>
    </div>
  );
}
