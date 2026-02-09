import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/ui/back-to-top";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { ToastProvider } from "@/components/ui/neon-toast";
import { SoundProvider } from "@/components/ui/sound-toggle";
import { ActivityTicker } from "@/components/ui/activity-ticker";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SoundProvider>
      <ToastProvider>
        <div className="flex min-h-screen flex-col">
          <ActivityTicker />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <BackToTop />
          <CustomCursor />
        </div>
      </ToastProvider>
    </SoundProvider>
  );
}
