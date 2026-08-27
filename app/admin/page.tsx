import { AdminDashboard } from "@/features/admin/components/AdminDashboard";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-cc-bg-page flex items-start justify-center p-6">
      <div className="w-full max-w-6xl pt-8">
        <AdminDashboard />
      </div>
    </main>
  );
}
