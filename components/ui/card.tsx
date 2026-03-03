import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-(--radius-xl) bg-(--bg-surface-primary)',
  {
    variants: {
      surface: {
        default:       'border border-(--border-default) shadow-(--shadow-border)',
        'shadow-border': 'shadow-(--shadow-border) hover:shadow-(--shadow-border-hover) transition-shadow',
      },
    },
    defaultVariants: {
      surface: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, surface, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ surface }), className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-(--spacing-5xs) p-(--spacing-sm)', className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-(--font-size-lg) font-(--font-weight-semibold) text-(--text-primary)',
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-(--font-size-sm) text-(--text-secondary)', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-(--spacing-sm) pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center p-(--spacing-sm) pt-0', className)} {...props} />
  );
}

export { cardVariants };
