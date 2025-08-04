"use client";
import { postType } from "app/blog/page";
import React from "react";

export default function SinglePost({ post }: { post: postType }) {
  return (
    <div className="w-full h-full p-8 overflow-auto">
      <div className="flex flex-col items-center gap-1 pb-9">
        <p className="text-stone-900 text-6xl font-serif font-bold italic pb-3">
          {post.title}
        </p>
        <p className="text-xl">{post.description}</p>
        <p className="text-sm text-stone-500">{post.date}</p>
      </div>
      <div className="flex flex-col gap-2">
        {post.content.split("\n").map((chunk, index) => (
          <p key={index}>{chunk}</p>
        ))}
      </div>
    </div>
  );
}
