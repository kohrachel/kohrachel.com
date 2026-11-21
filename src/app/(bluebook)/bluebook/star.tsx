/** The gold star sticker for favorites. Without a `label` it's decoration. */
export function Star({
  className = "",
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <svg
      className={`bb-star ${className}`}
      viewBox="0 0 24 24"
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
    >
      <path d="M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />
    </svg>
  );
}
