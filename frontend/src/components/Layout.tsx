import { ReactNode, useState } from "react";
import Sidebar from "@/components/Sidebar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="layout-root">
      <Sidebar />
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
};

export default Layout;
