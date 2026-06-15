import { useStartCheckout } from '../../hooks/useSubscription';
import { Card, Button } from '../ui';

interface AiUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature: 'project_planning' | 'description_generation';
}

export default function AiUpgradeModal({ open, onClose, feature }: AiUpgradeModalProps) {
  const { mutate: startCheckout, isPending } = useStartCheckout();

  if (!open) return null;

  const getFeatureMessage = () => {
    switch (feature) {
      case 'project_planning':
        return "You've reached your free limit of 3 AI project plans this month.";
      case 'description_generation':
        return "AI description generation requires an active subscription.";
      default:
        return "Upgrade to Orchest Pro to unlock advanced AI capabilities.";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
      <Card className="max-w-[480px] w-full border border-border-low bg-surface-glass shadow-2xl relative overflow-hidden" padding="lg">
        {/* Glow effect at the top */}
        <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-electric-blue/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-electric-blue flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <span className="material-symbols-outlined text-[36px] animate-pulse">auto_awesome</span>
          </div>

          <div>
            <h3 className="font-heading text-2xl font-bold text-on-surface tracking-tight">
              Upgrade to Orchest Pro
            </h3>
            <p className="text-sm text-on-surface-variant mt-2 max-w-sm mx-auto leading-relaxed">
              {getFeatureMessage()} Get Orchest Pro for just <span className="text-white font-semibold">$9/month</span> to keep collaborating with AI.
            </p>
          </div>

          {/* Pricing Table / Feature Comparison */}
          <div className="w-full bg-surface-container-low/50 rounded-xl border border-border-low p-4 text-left flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant pb-2 border-b border-border-low">
              <span>FEATURE</span>
              <div className="flex gap-4">
                <span className="w-12 text-center">FREE</span>
                <span className="w-12 text-center text-purple-400">PRO</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-electric-blue">calendar_today</span>
                AI Project Planning
              </span>
              <div className="flex gap-4 font-semibold">
                <span className="w-12 text-center text-on-surface-variant/70">3/mo</span>
                <span className="w-12 text-center text-purple-400">30/mo</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-electric-blue">description</span>
                AI Description Gen
              </span>
              <div className="flex gap-4 font-semibold">
                <span className="w-12 text-center text-on-surface-variant/70">3/mo</span>
                <span className="w-12 text-center text-purple-400">30/mo</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-electric-blue">support_agent</span>
                AI Team Assistant
              </span>
              <div className="flex gap-4 font-semibold">
                <span className="w-12 text-center text-on-surface-variant/70">Basic</span>
                <span className="w-12 text-center text-purple-400">Priority</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 order-2 sm:order-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 bg-gradient-to-r from-purple-600 to-electric-blue hover:from-purple-500 hover:to-blue-400 border-none text-white order-1 sm:order-2 flex justify-center items-center gap-2"
              onClick={() => startCheckout()}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Redirecting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  Upgrade to Pro
                </>
              )}
            </Button>
          </div>

          <p className="text-[10px] text-on-surface-variant/60">
            Powered by Stripe. Cancel anytime.
          </p>
        </div>
      </Card>
    </div>
  );
}
