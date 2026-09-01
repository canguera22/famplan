import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary",
  danger: "bg-destructive/10 text-destructive hover:bg-destructive/20",
};

export function Button({
  variant = "primary",
  className,
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" }) {
  return (
    <button
      className={cn(
        "btn-base focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        size === "sm" && "px-3 py-1.5 text-[0.8rem]",
        size === "lg" && "px-6 py-3.5 text-base w-full",
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("surface p-5", className)}>{children}</div>;
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle ? <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p> : null}
    </div>
  );
}

export function Chip({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: "muted" | "adults" | "kids" | "shared";
  className?: string;
}) {
  const tones = {
    muted: "bg-secondary text-secondary-foreground",
    adults: "bg-adults-soft text-adults",
    kids: "bg-kids-soft text-kids",
    shared: "bg-shared-soft text-shared",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {hint ? <span className="block text-xs text-muted-foreground mt-0.5">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full min-h-11 rounded-xl border border-border bg-card px-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-ring focus:ring-4 focus:ring-ring/15",
        className,
      )}
      {...props}
    />
  );
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full min-h-11 rounded-xl border border-border bg-card px-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-ring focus:ring-4 focus:ring-ring/15 resize-none",
        className,
      )}
      {...props}
    />
  );
}

export function OptionRow<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "btn-base border text-[0.82rem]",
            value === o.value
              ? "bg-primary text-primary-foreground border-transparent"
              : "bg-card border-border text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
        checked ? "bg-primary" : "bg-border",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-6 w-6 rounded-full bg-card shadow-sm transition-all",
          checked ? "left-[1.4rem]" : "left-0.5",
        )}
      />
    </button>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Card className="text-center py-12">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5 mx-auto max-w-sm">{body}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </Card>
  );
}
