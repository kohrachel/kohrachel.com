import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PostCard from "./PostCard";

export default function PostText({
  id,
  title,
  description,
}: {
  id: number;
  title: string;
  description: string;
}) {
  return (
    <Link href={`/${id}`} className="inline align-middle cursor-pointer">
      <Tooltip>
        <TooltipTrigger
          render={<span />}
          className="inline text-left cursor-pointer"
        >
          {title}
        </TooltipTrigger>
        <TooltipContent className="cursor-pointer">
          <PostCard title={title} description={description} />
        </TooltipContent>
      </Tooltip>
    </Link>
  );
}
