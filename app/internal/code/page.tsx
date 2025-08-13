import { Sandpack } from "@codesandbox/sandpack-react";
import { Dracula } from "./sandbox-theme";

export default function App() {
  return (
    <div className="p-5">
      <Sandpack
        theme={Dracula}
        template="react"
        files={{
          "/App.js": {
            code: `export default function App() { return <h1>Hello World!</h1>; }`,
            active: true, // This file will be the active tab
          },
          "/index.js": `import App from "./App";`,
          "/styles.css": `body { font-family: sans-serif; }`,
        }}
        options={{
          showInlineErrors: true, // default - false
          wrapContent: true, // default - false
          editorHeight: 700, // default - 300
        }}
      />
    </div>
  );
}
