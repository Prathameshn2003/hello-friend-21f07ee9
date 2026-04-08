import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminSchemes } from "@/components/admin/AdminSchemes";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const AdminSchemesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex pt-16 sm:pt-20">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <AdminSchemes />
        </main>
      </div>
    </div>
  );
};

export default AdminSchemesPage;
