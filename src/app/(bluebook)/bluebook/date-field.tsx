"use client";

import { Popover } from "@base-ui/react/popover";
import { Select } from "@base-ui/react/select";
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ChangeEvent, useState } from "react";
import {
  type ChevronProps,
  DayPicker,
  type DropdownProps,
} from "react-day-picker";
import { formatDateLong } from "@/lib/bluebook/format";

/**
 * A day picked from a calendar. `value` is "YYYY-MM-DD", or "" for none,
 * the same as a native date input's.
 */
export function DateField({
  label,
  value,
  onChange,
  className = "",
}: {
  /** What the date is, for screen readers. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const picked = value ? fromIso(value) : undefined;
  const [month, setMonth] = useState(() => picked ?? new Date());
  const text = value ? formatDateLong(value, "day") : null;

  function pick(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setMonth(picked ?? new Date());
      }}
    >
      <Popover.Trigger
        aria-label={`${label}: ${text ?? "not set"}`}
        className={`bb-input bb-datepick ${className}`}
      >
        <span className={text ? "" : "bb-datepick__empty"}>
          {text ?? "Pick a date"}
        </span>
        <HugeiconsIcon icon={Calendar03Icon} size={18} strokeWidth={1.8} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          className="bb-select__positioner"
        >
          <Popover.Popup className="bb-cal">
            <DayPicker
              mode="single"
              required
              selected={picked}
              onSelect={(day) => pick(toIso(day))}
              month={month}
              onMonthChange={setMonth}
              captionLayout="dropdown"
              navLayout="after"
              startMonth={new Date(1900, 0)}
              endMonth={new Date(new Date().getFullYear() + 1, 11)}
              showOutsideDays
              fixedWeeks
              autoFocus
              classNames={{
                root: "bb-cal__root",
                month: "bb-cal__month",
                month_caption: "bb-cal__caption",
                dropdowns: "bb-cal__dropdowns",
                nav: "bb-cal__nav",
                button_previous: "bb-cal__navbtn",
                button_next: "bb-cal__navbtn",
                month_grid: "bb-cal__grid",
                weekday: "bb-cal__weekday",
                day: "bb-cal__day",
                day_button: "bb-cal__daybtn",
                selected: "bb-cal__day--selected",
                today: "bb-cal__day--today",
                outside: "bb-cal__day--outside",
              }}
              components={{ Chevron, Dropdown: CalendarSelect }}
            />
            <div className="bb-cal__foot">
              <button
                type="button"
                className="bb-btn bb-btn--quiet"
                onClick={() => pick("")}
              >
                Clear
              </button>
              <button
                type="button"
                className="bb-btn bb-btn--quiet"
                onClick={() => pick(toIso(new Date()))}
              >
                Today
              </button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function Chevron({ orientation }: ChevronProps) {
  return (
    <HugeiconsIcon
      icon={orientation === "left" ? ArrowLeft01Icon : ArrowRight01Icon}
      size={16}
      strokeWidth={2}
    />
  );
}

/** The month and year pickers, as bluebook selects instead of native ones. */
function CalendarSelect({
  options = [],
  value,
  onChange,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const items = options.map((option) => ({
    value: option.value,
    label: option.label,
  }));
  return (
    <Select.Root
      items={items}
      value={Number(value)}
      onValueChange={(next) =>
        onChange?.({
          target: { value: String(next) },
        } as ChangeEvent<HTMLSelectElement>)
      }
      modal={false}
    >
      <Select.Trigger aria-label={ariaLabel} className="bb-cal__select">
        <Select.Value />
        <Select.Icon className="bb-select__icon">
          <HugeiconsIcon icon={ArrowDown01Icon} size={14} strokeWidth={2} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          sideOffset={6}
          align="start"
          alignItemWithTrigger={false}
          className="bb-select__positioner"
        >
          <Select.Popup className="bb-select">
            <Select.List>
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="bb-select__opt"
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="bb-select__tick">
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      size={14}
                      strokeWidth={2}
                    />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

function fromIso(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toIso(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
