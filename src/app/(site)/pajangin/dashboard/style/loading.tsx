import { PageBackdrop } from "@/components/PageBackdrop";
import { Skeleton } from "@/components/ui/Skeleton";

export default function StyleLoading() {
  return (
    <div className="fk-app">
      <PageBackdrop variant="style" />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Skeleton className="w-28 h-8 mb-6" />
        <Skeleton className="w-32 h-3 mb-2" />
        <Skeleton className="w-56 h-9 mb-2" />
        <Skeleton className="w-80 h-4 mb-8" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-64" />
          ))}
        </div>
        <Skeleton className="w-40 h-11" />
      </div>
    </div>
  );
}
