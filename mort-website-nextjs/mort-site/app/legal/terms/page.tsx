import type { Metadata } from "next";
import TermsDoc from "@/components/TermsDoc";

export const metadata: Metadata = {
  title: "Master Terms of Service | MORT",
};

export default function TermsPage() {
  return <TermsDoc />;
}
