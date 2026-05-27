import { InputHTMLAttributes, ReactNode } from 'react';

export function Label({ children }: { children: ReactNode }) {
  return <label className="eyebrow mb-1.5 block">{children}</label>;
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input-field" {...props} />;
}
