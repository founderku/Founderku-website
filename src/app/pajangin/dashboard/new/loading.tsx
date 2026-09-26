import { PageBackdrop } from "@/components/PageBackdrop";
import { Skeleton } from "@/components/ui/Skeleton";

export default function NewPageLoading() {
  return (
    <div className="relative min-h-screen">
      <PageBackdrop variant="form" />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Skeleton className="w-28 h-8 mb-6" />
        <Skeleton className="w-32 h-3 mb-2" />
        <Skeleton className="w-64 h-9 mb-2" />
        <Skeleton className="w-72 h-4 mb-8" />
        <div className="grid md:grid-cols-2 gap-9">
          <div className="space-y-4">
            <Skeleton className="w-full h-11" />
            <Skeleton className="w-full h-11" />
            <div className="flex gap-3">
              <Skeleton className="flex-1 h-11" />
              <Skeleton className="flex-1 h-11" />
            </div>
            <Skeleton className="w-full h-11" />
            <Skeleton className="w-full h-11" />
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-full h-11" />
            <Skeleton className="w-full h-11" />
          </div>
          <Skeleton className="w-full h-80" />
        </div>
      </div>
    </div>
  );
}
