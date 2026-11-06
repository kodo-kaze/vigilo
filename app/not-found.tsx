import type { Metadata } from "next";
import NotFoundExperience from "@/src/components/ui/NotFoundExperience";

export const metadata: Metadata = {
  title: "404 // Coordinate Dissolved — Vigilo",
  description:
    "The requested sensor coordinate or surveillance stream does not exist on the Vigilo Conflux mesh.",
};

export default function NotFound() {
  return <NotFoundExperience />;
}
