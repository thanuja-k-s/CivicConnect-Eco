import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
  </div>
);

export default Layout;
