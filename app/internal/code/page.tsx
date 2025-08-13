import { Sandpack } from "@codesandbox/sandpack-react";
import { Dracula } from "./sandbox-theme";

export default function App() {
  return (
    <div className="p-5">
      <Sandpack
        theme={Dracula}
        template="react"
      />
    </div>
  );
}
