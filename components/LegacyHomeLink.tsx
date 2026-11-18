"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyHomeLink() {
  const router = useRouter();
  useEffect(() => {
    function followSectionLink() {
      const section = window.location.hash.slice(1);
      if (section === "market" || section === "token" || section === "community") {
        router.replace(`/${section}/`);
      }
    }
    followSectionLink();
    window.addEventListener("hashchange", followSectionLink);
    return () => window.removeEventListener("hashchange", followSectionLink);
  }, [router]);
  return null;
}
