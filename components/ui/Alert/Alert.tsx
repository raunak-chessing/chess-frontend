import type { AlertProps } from "./Alert.types";

const VARIANT_CLASSES = {
  error: "bg-red-500/10 border-red-500/20 text-red-400",
  success: "bg-green-500/10 border-green-500/20 text-green-400",
} as const;

export default function Alert({ variant, message, id }: AlertProps) {
  if (!message) return null;

  return (
    <div
      className={`border text-sm px-4 py-3 rounded-xl ${VARIANT_CLASSES[variant]}`}
      id={id}
    >
      {message}
    </div>
  );
}
