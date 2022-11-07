import type { FC, ButtonHTMLAttributes } from 'react';
import { cn } from '~/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const Button: FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className={cn(
        'bg-action shadow-md justify-end hover:opacity-80 transition-all ease-in rounded-md px-4 py-2 font-medium text-white',
        props.className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
