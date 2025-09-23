import { Sandpack } from "@codesandbox/sandpack-react";
import { redirect } from "next/navigation";
import { Dracula } from "./sandbox-theme";

export default function App() {
  if (process.env.NODE_ENV === "production") {
    redirect("/");
  }
  return (
    <div className="p-5">
      <Sandpack
        theme={Dracula}
        template="react"
        files={{
          "/App.js": {
            code: `export default function App() { return <h1>Hello World!</h1>; }`,
            active: true,
          },
          "/index.js": `import App from "./App";`,
          "/styles.css": `body { font-family: sans-serif; }`,
        }}
        options={{
          showInlineErrors: true,
          wrapContent: true,
          editorHeight: 800, // default - 300
        }}
      />
    </div>
  );
}
