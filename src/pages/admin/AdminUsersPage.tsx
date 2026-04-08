import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const AdminUsersPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex pt-16 sm:pt-20">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <AdminUsers />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminUsersPage;
