import { Skeleton } from "@/components/ui/Skeleton";
import { FkShell } from "@/components/shell/FkShell";

export default function NewPageLoading() {
  return (
    <FkShell>
      <div className="max-w-5xl mx-auto">
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
    </FkShell>
  );
}
