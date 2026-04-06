import Link from "next/link";

interface StatCardProps {
  /**
   * Large number to display (e.g. "30%", "186 → 10")
   */
  value: string;
  /**
   * Description below the number
   */
  description: string;
  /**
   * Card background color (any valid CSS color)
   * Default: 'bg-gray-100'
   */
  bgColorClass?: string;
  /**
   * Main number/text color (any valid CSS color class)
   * Default: 'text-foreground/50'
   */
  textColorClass?: string;
  /**
   * Optional inline background color (hex/rgba/css var), takes precedence over bgColorClass.
   */
  backgroundColor?: string;
  /**
   * Optional inline text color (hex/rgba/css var), takes precedence over textColorClass.
   */
  textColor?: string;
  /**
   * When set, the whole card links here. Pair with {@link linkLabel} for visible link copy.
   */
  href?: string;
  /**
   * Shown as underlined text at the bottom when `href` is set. Defaults to "Read more" if omitted.
   */
  linkLabel?: string;
}

export default function StatCard({
  value,
  description,
  bgColorClass = "bg-gray-100",
  textColorClass = "text-foreground/50",
  backgroundColor,
  textColor,
  href,
  linkLabel,
}: StatCardProps) {
  const style = backgroundColor ? { backgroundColor } : undefined;
  const colorStyle = textColor ? { color: textColor } : undefined;
  const linkLineText = href ? (linkLabel ?? "Read more") : undefined;

  const shellClass = `relative h-full min-h-0 w-full min-w-0 overflow-hidden rounded-lg ${bgColorClass}`;
  const valueClass = `absolute left-0 right-0 top-0 flex items-start justify-start p-4 text-4xl font-light sm:p-6 sm:text-5xl md:text-6xl ${textColorClass}`;
  const bodyClass = `absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-4 sm:p-6 ${textColorClass}`;
  const descClass = `text-pretty text-base font-light leading-snug sm:text-lg ${textColorClass}`;
  const linkLineClass = `text-sm font-medium underline underline-offset-[0.2em] ${textColorClass}`;

  const inner = (
    <>
      <span className={valueClass} style={colorStyle}>
        {value}
      </span>
      <div className={bodyClass}>
        <p className={descClass} style={colorStyle}>
          {description}
        </p>
        {linkLineText ? (
          <span className={linkLineClass} style={colorStyle}>
            {linkLineText}
          </span>
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${shellClass} block min-h-[11rem] cursor-pointer transition-[transform,opacity] duration-150 ease-out hover:opacity-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99]`}
        style={style}
        aria-label={`${value}. ${description}. ${linkLineText}`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className={shellClass} style={style}>
      {inner}
    </div>
  );
}
