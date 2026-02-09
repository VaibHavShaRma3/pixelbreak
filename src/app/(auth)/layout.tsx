import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Gamepad2 className="h-8 w-8 text-neon-cyan" />
        <span className="font-[family-name:var(--font-pixel)] text-lg text-neon-cyan glow-cyan">
          PixelBreak
        </span>
      </Link>
      {children}
    </div>
  );
}
