import { afterEach, beforeEach, mock } from "bun:test";

export type Route = (init?: RequestInit) => Response | Promise<Response>;

/**
 * Replaces `fetch` for the tests in the calling file. Requests to a URL in
 * `network.routes` get its response; anything else gets a 404. Every
 * requested URL is recorded in `network.requested`.
 */
export function installFakeNetwork() {
  const network = {
    routes: {} as Record<string, Route>,
    requested: [] as string[],
  };
  const realFetch = globalThis.fetch;
  beforeEach(() => {
    network.routes = {};
    network.requested = [];
    globalThis.fetch = mock(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = input.toString();
        network.requested.push(url);
        const route = network.routes[url];
        return route ? route(init) : new Response("not found", { status: 404 });
      },
    ) as unknown as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
  });
  return network;
}

export const html = (body: string) => () =>
  new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
export const json = (body: unknown) => () =>
  new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
  });
export const redirect = (location: string) => () =>
  new Response(null, { status: 302, headers: { location } });
