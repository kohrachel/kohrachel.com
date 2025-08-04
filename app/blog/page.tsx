import { Suspense } from "react";
import BlogList from "./BlogList";

export default function Blog() {
  return (
    <Suspense fallback={<div>Loading blog...</div>}>
      <BlogList />
    </Suspense>
  );
}
