"use client";

import { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Input } from "@/components/ui/input";
import { mediaPath } from "@/lib/media";

export function ImageNodeView({
  node,
  selected,
  updateAttributes,
}: NodeViewProps) {
  const { src, bucket, key, alt, title, width, height } = node.attrs;
  const [editingAlt, setEditingAlt] = useState(false);

  return (
    <NodeViewWrapper>
      <img
        src={bucket && key ? mediaPath(bucket, key) : (src ?? undefined)}
        alt={alt ?? ""}
        title={title ?? undefined}
        width={width ?? undefined}
        height={height ?? undefined}
        data-drag-handle
      />
      {(selected || editingAlt) && (
        <div contentEditable={false} data-not-typeset className="mt-2">
          <Input
            aria-label="Alt text"
            className="text-foreground"
            placeholder="Alt text: describe this image"
            value={alt ?? ""}
            onChange={(e) => updateAttributes({ alt: e.target.value })}
            onFocus={() => setEditingAlt(true)}
            onBlur={() => setEditingAlt(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") {
                e.currentTarget.blur();
              }
            }}
          />
        </div>
      )}
    </NodeViewWrapper>
  );
}
