import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminHealthResources } from "@/components/admin/AdminHealthResources";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const AdminResourcesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex pt-16 sm:pt-20">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <AdminHealthResources />
        </main>
      </div>
    </div>
  );
};

export default AdminResourcesPage;
