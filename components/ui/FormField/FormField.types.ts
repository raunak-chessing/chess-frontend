import type React from "react";

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  ref?: React.Ref<HTMLInputElement>;
}
