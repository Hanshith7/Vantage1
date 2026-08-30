import AppSidebar from "@/components/app/AppSidebar";
import DemoController from "@/components/app/DemoController";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <AppSidebar />
      <main className="flex-1 lg:max-h-screen lg:overflow-y-auto">
        <div className="px-6 lg:px-12 py-8 lg:py-10 pt-20 lg:pt-10 max-w-6xl">
          {children}
        </div>
      </main>
      <DemoController />
    </div>
  );
}
