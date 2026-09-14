import { Suspense } from "react"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"

export default function Page() {
  // The Tiptap editor is a client component that reads unstable values
  // (e.g. Math.random()) during render. Under Cache Components/PPR this must
  // stream as dynamic content rather than be prerendered into the static shell.
  return (
    <Suspense fallback={null}>
      <SimpleEditor />
    </Suspense>
  )
}
