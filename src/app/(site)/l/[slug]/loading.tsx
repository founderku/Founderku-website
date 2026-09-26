export default function ProductPageLoading() {
  return (
    <div className="min-h-screen bg-bg-soft animate-pulse">
      <div className="bg-black/[0.06] h-72 sm:h-96 w-full" />
      <div className="max-w-md mx-auto px-6 py-8 space-y-3">
        <div className="bg-black/[0.06] h-7 w-2/3 rounded-xl" />
        <div className="bg-black/[0.06] h-4 w-full rounded-xl" />
        <div className="bg-black/[0.06] h-4 w-1/2 rounded-xl" />
        <div className="bg-black/[0.06] h-8 w-1/3 rounded-xl mt-2" />
        <div className="bg-black/[0.06] h-12 w-full rounded-2xl mt-6" />
      </div>
    </div>
  );
}
