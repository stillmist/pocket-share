import { useEffect } from "react";
import { useSidebar } from "~/components/ui/sidebar";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Pocket Share" }, { name: "description", content: "Home" }];
}

export default function Home() {
  // Close sidebar after navigation
  const { isMobile, open, setOpenMobile } = useSidebar();
  useEffect(() => {
    if (isMobile && open) {
      setOpenMobile(false);
    }
  }, []);

  return <main>Home</main>;
}
