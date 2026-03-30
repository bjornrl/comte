"use client";

export default function StepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-12 md:mb-8">
      <h1 className="font-bold tracking-tight text-[#1F3A32]">{title}</h1>
      {subtitle && (
        <p className="text-lg text-[#676160] mt-2 md:text-lg max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
