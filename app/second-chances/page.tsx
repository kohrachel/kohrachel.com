import Terminal from "@/components/Terminal";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function SecondChances() {
  redirect("/");

  return (
    <Suspense fallback={<div>Loading terminal...</div>}>
      <Terminal />
    </Suspense>
  );
}
