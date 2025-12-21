export default function SkeletonCard() {
  return (
    <div className="h-64 rounded-2xl bg-zinc-900/50 border border-white/5 overflow-hidden relative">
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      <div className="h-40 bg-zinc-800/50" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-2/3 bg-zinc-800 rounded" />
        <div className="h-3 w-1/3 bg-zinc-800 rounded" />
      </div>
    </div>
  );
}