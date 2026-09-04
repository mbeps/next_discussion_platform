"use client";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";
import { useState } from "react";

/**
 * A client-side component that manages the Emotion CSS-in-JS cache for the Next.js App Router.
 * Ensures that styles generated on the server are correctly hydrated and injected into the document.
 * @param children - The component tree that requires Emotion styling.
 * @returns A provider that supplies the Emotion cache to its descendants.
 */
export default function EmotionRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cache] = useState(() => {
    const cache = createCache({ key: "css" });
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    return (
      <style
        data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(" ")}`}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Emotion SSR style insertion
        dangerouslySetInnerHTML={{
          __html: Object.values(cache.inserted).join(" "),
        }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
