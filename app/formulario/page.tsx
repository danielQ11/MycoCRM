"use client";

import Sidebar from "@/components/layout/Sidebar";
import FormsDashboard from "@/components/forms/FormsDashboard";

export default function FormularioPage() {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#050B07] text-white">
      <Sidebar theme="teal" />

      <section className="relative z-10 flex-1 pt-24 pb-8 px-4 md:p-10 md:pl-[360px] max-w-full overflow-x-hidden">
        <FormsDashboard />
      </section>
    </main>
  );
}
