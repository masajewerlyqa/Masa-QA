export default function SiteLoading() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center" aria-live="polite" aria-busy="true">
      <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
