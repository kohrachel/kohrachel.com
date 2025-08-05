import { PostType } from "app/blog/data";
import React from "react";

type PostClickableProps = {
  post: PostType;
  setActivePost: React.Dispatch<React.SetStateAction<PostType>>;
};

export function PostClickable({ post, setActivePost }: PostClickableProps) {
  return (
    <button className="rounded-xl" onClick={() => setActivePost(post)}>
      <div className="group rounded-xl p-4 h-max outline-2 outline-dashed outline-purple-100 hover:outline-purple-700 hover:bg-purple-200 transition-all duration-700">
        <div className="flex flex-col gap-1">
          <p className="text-stone-900 text-3xl group-hover:text-stone-500 font-serif font-bold italic transition-all duration-300">
            {post.title}
          </p>
          <p className="text-stone-900 text-xs group-hover:text-md transition-all duration-300">
            {post.description}
          </p>
          <p className="text-xs uppercase text-stone-500">{post.date}</p>
        </div>
      </div>
    </button>
  );
}
