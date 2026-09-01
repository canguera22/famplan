import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      src="/mesa-logo.png"
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
