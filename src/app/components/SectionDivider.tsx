export default function SectionDivider({ className }: { className?: string }) {
  return (
    <div
      className={`section-divider${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    />
  );
}
