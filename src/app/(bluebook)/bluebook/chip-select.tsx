"use client";

import { Select } from "@base-ui/react/select";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type Option<T> = { value: T | null; label: string };

/**
 * A filter chip that opens a list to pick one option from. The chip is
 * filled in while anything but the `null` option is picked.
 */
export function ChipSelect<T>({
  label,
  value,
  options,
  onChange,
}: {
  /** What it picks, for screen readers. */
  label: string;
  value: T | null;
  options: Option<T>[];
  onChange: (value: T | null) => void;
}) {
  return (
    <Select.Root
      items={options}
      value={value}
      onValueChange={(next) => onChange(next as T | null)}
      modal={false}
    >
      <Select.Trigger
        aria-label={label}
        className={`bb-chip ${value === null ? "" : "bb-chip--on"}`}
      >
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
                  key={String(option.value)}
                  value={option.value}
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
