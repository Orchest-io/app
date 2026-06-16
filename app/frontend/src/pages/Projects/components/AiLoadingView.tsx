export default function AiLoadingView() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mb-4" />
      <p className="text-on-surface-variant">Generating task...</p>
    </div>
  );
}
