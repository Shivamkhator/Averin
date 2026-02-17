import Navbar from "@/components/Navbar";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <ThemeToggle />
      <div className="md:mt-16">
        {children}
      </div>
    </>
  );
}