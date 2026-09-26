export default function StorePageLoading() {
  return (
    <div className="min-h-screen bg-bg-soft animate-pulse">
      <div className="bg-black/[0.08] h-52 w-full" />
      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-black/[0.06] h-56 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
