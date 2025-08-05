import Terminal from "@/components/Terminal";
import { Suspense } from "react";

export default function SecondChances() {
  return (
    <Suspense fallback={<div>Loading terminal...</div>}>
      <Terminal />
    </Suspense>
  );
}
