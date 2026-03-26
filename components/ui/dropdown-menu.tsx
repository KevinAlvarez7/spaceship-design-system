"use client";

import * as React from 'react';
import { useState, createContext, useContext } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ━━━ Open state context ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Shared open state so DropdownMenuContent can animate entry/exit via AnimatePresence. */
const DropdownOpenContext = createContext(false);

// ━━━ DropdownMenu — root ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type DropdownMenuRootProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>;

/**
 * Root provider — tracks open state internally and exposes it via context
 * so DropdownMenuContent can run Motion exit animations via AnimatePresence.
 * Supports both controlled (`open` + `onOpenChange`) and uncontrolled usage.
 */
export function DropdownMenu({
  open,
  onOpenChange,
  defaultOpen,
  children,
  ...props
}: DropdownMenuRootProps) {
  const isControlled = open !== undefined;
  const [localOpen, setLocalOpen] = useState(defaultOpen ?? false);
  const isOpen = isControlled ? (open ?? false) : localOpen;

  function handleOpenChange(v: boolean) {
    if (!isControlled) setLocalOpen(v);
    onOpenChange?.(v);
  }

  return (
    <DropdownOpenContext.Provider value={isOpen}>
      <DropdownMenuPrimitive.Root
        open={isOpen}
        onOpenChange={handleOpenChange}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Root>
    </DropdownOpenContext.Provider>
  );
}

// ━━━ DropdownMenuTrigger ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Trigger element. Use `asChild` to compose with a DS Button. */
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

// ━━━ DropdownMenuContent ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Props for DropdownMenuContent */
export interface DropdownMenuContentProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {
  className?: string;
}

/**
 * Floating panel that contains menu items. Rendered in a portal.
 * Uses Motion AnimatePresence for smooth fade+scale enter/exit animations.
 * Transform origin tracks Radix's computed anchor point via CSS variable.
 */
export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(({ className, sideOffset = 6, align = 'end', children, ...props }, ref) => {
  const isOpen = useContext(DropdownOpenContext);
  return (
    <DropdownMenuPrimitive.Portal forceMount>
      <AnimatePresence>
        {isOpen && (
          <DropdownMenuPrimitive.Content
            ref={ref}
            forceMount
            sideOffset={sideOffset}
            align={align}
            {...props}
            className="z-50 outline-none"
          >
            <motion.div
              className={cn(
                'min-w-36 p-1 rounded',
                'bg-(--bg-surface-base) shadow-(--shadow-border)',
                className,
              )}
              style={{
                transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)',
                willChange: 'transform',
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.08, ease: 'easeIn' } }}
              transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </DropdownMenuPrimitive.Content>
        )}
      </AnimatePresence>
    </DropdownMenuPrimitive.Portal>
  );
});
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

// ━━━ DropdownMenuItem ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Constants ───────────────────────────────────────────────────────────────

/** Icon sizing for leading icons inside menu items. */
const ITEM_ICON_CLASSES = '[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:[stroke-width:2.25]';

// ─── CVA ─────────────────────────────────────────────────────────────────────

export const dropdownMenuItemVariants = cva(
  [
    'flex items-center gap-2 w-full px-2 py-1.5 rounded-md',
    'cursor-pointer outline-none select-none',
    'font-sans [font-size:var(--font-size-sm)] [line-height:var(--line-height-sm)]',
    'transition-colors duration-(--duration-base) ease-(--ease-in-out)',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ],
  {
    variants: {
      variant: {
        // Standard option — primary text, subtle hover background
        default:     'text-(--text-primary) data-[highlighted]:bg-(--bg-surface-primary)',
        // Destructive option — error text, light error hover background
        destructive: 'text-(--text-status-error) data-[highlighted]:bg-(--bg-status-error)',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

// ─── Props + Component ───────────────────────────────────────────────────────

/** Props for DropdownMenuItem */
export interface DropdownMenuItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>,
    VariantProps<typeof dropdownMenuItemVariants> {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Individual menu option. Leading icons can be placed inline as children.
 * Uses Radix `data-[highlighted]` for unified keyboard + mouse hover state.
 */
export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(({ className, variant, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(dropdownMenuItemVariants({ variant }), ITEM_ICON_CLASSES, className)}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.Item>
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

// ━━━ DropdownMenuSeparator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Props for DropdownMenuSeparator */
export interface DropdownMenuSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator> {
  className?: string;
}

/** Horizontal divider between groups of items. */
export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('my-1 h-px bg-(--bg-surface-tertiary)', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
