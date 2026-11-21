import { Fragment, type ReactNode } from "react";
import { MASONRY_COLUMNS, placeInColumns } from "@/lib/bluebook/masonry";

export type MasonryCell = {
  key: string | number;
  height: number;
  node: ReactNode;
};

/**
 * Cards in columns, each at its own height, placed in order into the
 * shortest column. Heights are estimates known before images load, so one
 * placement per column count is rendered and the grid's width shows one.
 */
export function MasonryGrid({
  cells,
  label,
}: {
  cells: MasonryCell[];
  label?: string;
}) {
  const heights = cells.map((cell) => cell.height);
  return (
    <div className="bb-grid" aria-label={label}>
      {MASONRY_COLUMNS.map((columns) => (
        <div key={columns} className="bb-masonry" data-columns={columns}>
          {placeInColumns(heights, columns).map((column, index) => (
            <div key={index} className="bb-masonry__col">
              {column.map((cellIndex) => (
                <Fragment key={cells[cellIndex].key}>
                  {cells[cellIndex].node}
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
