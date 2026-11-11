"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updatePost } from "@/server/posts/update";

export function DeletePostButton({ id, title }: { id: number; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setPending(true);
    try {
      await updatePost({ id, patch: { deletedAt: new Date() } });
      router.refresh();
    } catch (error) {
      console.error("delete failed:", error);
      setPending(false);
      setConfirming(false);
    }
  }

  const label = confirming
    ? `Click again to delete ${title}`
    : `Delete ${title}`;

  return (
    <Button
      type="button"
      variant={confirming ? "destructive" : "ghost"}
      size={confirming ? "lg" : "icon-lg"}
      aria-label={label}
      title={label}
      onClick={handleClick}
      onBlur={() => setConfirming(false)}
      disabled={pending}
      className={cn(!confirming && "text-stone-400 hover:text-destructive")}
    >
      <HugeiconsIcon icon={Delete02Icon} className="size-5" />
      {confirming && <span>{pending ? "Deleting..." : "Delete?"}</span>}
    </Button>
  );
}
