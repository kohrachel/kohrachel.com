"use client";
import { postType } from "../blog/data";
import React from "react";
import { Title, Heading, Paragraph } from "./blog-components";

export default function SinglePost({ post }: { post: postType }) {
  const contentArray = post.content.split("\n");

  return (
    <div className="w-full h-full p-8 overflow-auto">
      <div className="flex flex-col items-center gap-1 pb-9">
        <Title>{post.title}</Title>
        <p className="text-xl">{post.description}</p>
        <p className="text-sm text-stone-500">{post.date}</p>
      </div>
      <div className="flex flex-col gap-3">
        {contentArray.map((chunk, index) => (
          <RenderedChunk key={index} chunk={chunk} />
        ))}
      </div>
    </div>
  );
}

function RenderedChunk({ chunk }: { chunk: string }) {
  const trimmedChunk = chunk.trim();
  if (trimmedChunk.startsWith("#")) {
    return <Heading>{trimmedChunk.substring(1).trim()}</Heading>;
  } else {
    return <Paragraph>{chunk}</Paragraph>;
  }
}
