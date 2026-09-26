import { PageBackdrop } from "@/components/PageBackdrop";
import { Skeleton } from "@/components/ui/Skeleton";

// Next.js otomatis nampilin ini SEKETIKA pas user pindah ke /dashboard,
// sambil data asli (profile, daftar halaman) masih diambil dari
// Supabase di belakang layar. Begitu data siap, ini otomatis diganti
// konten aslinya. Efeknya: halaman kerasa langsung "gerak" pas diklik,
// bukan layar kosong nunggu.
export default function DashboardLoading() {
  return (
    <div className="relative min-h-screen">
      <PageBackdrop variant="dashboard" />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="w-28 h-8" />
          <Skeleton className="w-12 h-4" />
        </div>
        <Skeleton className="w-32 h-3 mb-2" />
        <Skeleton className="w-56 h-9 mb-2" />
        <Skeleton className="w-72 h-4 mb-8" />
        <div className="flex flex-col sm:flex-row gap-3.5 mb-8">
          <Skeleton className="flex-1 h-20" />
          <Skeleton className="flex-1 h-20" />
          <Skeleton className="sm:w-24 h-20" />
        </div>
        <Skeleton className="w-full h-20 mb-8" />
        <Skeleton className="w-full h-36 mb-8" />
        <Skeleton className="w-full h-20 mb-3" />
        <Skeleton className="w-full h-20 mb-3" />
      </div>
    </div>
  );
}
