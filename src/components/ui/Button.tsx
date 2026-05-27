import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
const cls: Record<Variant, string> = {
  primary: 'btn-primary', secondary: 'btn-secondary', ghost: 'btn-ghost', danger: 'btn-danger',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; }

export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  return <button className={`${cls[variant]} ${className}`} {...rest} />;
}
