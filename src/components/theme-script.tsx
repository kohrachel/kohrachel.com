import { THEME_STORAGE_KEY } from "@/components/theme-provider";

/**
 * Blocking script rendered in <head> from the (server) root layout.
 *
 * Because it is rendered by a Server Component and lives in the initial HTML,
 * it runs before first paint (no theme flash) and does NOT trigger React's
 * "script tag while rendering" client-render warning.
 */
export function ThemeScript() {
  const script = `(function(){try{var k=${JSON.stringify(
    THEME_STORAGE_KEY,
  )};var t=localStorage.getItem(k)||"system";var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var r=t==="system"?(d?"dark":"light"):t;var e=document.documentElement;e.classList.remove("light","dark");e.classList.add(r);e.style.colorScheme=r;}catch(_){}})();`;

  return (
    <script
      // Injected before hydration; value never changes across renders.
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
