import { Fragment, type ReactNode } from "react";
import {
  MASONRY_COLUMNS,
  placeInColumns,
  placeTape,
  type Tape,
} from "@/lib/bluebook/masonry";

export type MasonryCell = {
  key: string | number;
  height: number;
  /** Picks which cards get tape; cells without one never do. */
  tapeSeed?: number;
  render: (tape: Tape | undefined) => ReactNode;
};

/**
 * Cards in columns, each at its own height, placed in order into the
 * shortest column. Heights are estimates known before images load, so one
 * placement per column count is rendered and the grid's width shows one.
 * Tape is spread over each placement separately.
 */
export function MasonryGrid({
  cells,
  label,
}: {
  cells: MasonryCell[];
  label?: string;
}) {
  const heights = cells.map((cell) => cell.height);
  const seeds = cells.map((cell) => cell.tapeSeed);
  return (
    <div className="bb-grid" aria-label={label}>
      {MASONRY_COLUMNS.map((columns) => {
        const placed = placeInColumns(heights, columns);
        const tapes = placeTape(heights, placed, seeds);
        return (
          <div key={columns} className="bb-masonry" data-columns={columns}>
            {placed.map((column, index) => (
              <div key={index} className="bb-masonry__col">
                {column.map((cellIndex) => (
                  <Fragment key={cells[cellIndex].key}>
                    {cells[cellIndex].render(tapes.get(cellIndex))}
                  </Fragment>
                ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
