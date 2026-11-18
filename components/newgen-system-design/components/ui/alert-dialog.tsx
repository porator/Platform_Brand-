import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as React from 'react';

import { cn } from '../../utils/cn';
import { Button, type ButtonProps } from './button';

/*
 * The usability test's components/ui/alert-dialog.tsx (shadcn base-vega on Base UI's
 * AlertDialog), on Radix AlertDialog. Workspace look only (the package had no alert dialog).
 * Translated to Tailwind 3 / Radix as ui/dialog.tsx's workspace look: data-open / data-closed →
 * data-[state=…] (the 100ms repeated under them); supports-backdrop-filter →
 * supports-[backdrop-filter]; has-data-[x] → has-[[data-x]]; *:[svg] → [&>svg]; *:[a] → [&>a];
 * the centring translate feeds the CSS `translate` property ([transform:none]) so the popup
 * stays centred while it zooms. The title's two stacked group conditions (default size, has
 * media) become one arbitrary ancestor variant. AlertDialogAction is a plain workspace Button
 * (it doesn't close, as in the test); AlertDialogCancel closes.
 */
const WORKSPACE_ALERT_DIALOG = {
  overlay:
    'fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-[backdrop-filter]:backdrop-blur-xs data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:duration-100 data-[state=closed]:duration-100',
  content:
    'group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 [transform:none] [translate:var(--tw-translate-x)_var(--tw-translate-y)] gap-6 rounded-xl bg-popover p-6 text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:duration-100 data-[state=closed]:duration-100',
  header:
    'grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-[[data-slot=alert-dialog-media]]:grid-rows-[auto_auto_1fr] has-[[data-slot=alert-dialog-media]]:gap-x-6 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-[[data-slot=alert-dialog-media]]:grid-rows-[auto_1fr]',
  footer:
    'flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end',
  media:
    "mb-2 inline-flex size-16 items-center justify-center rounded-md bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 [&>svg:not([class*='size-'])]:size-8",
  title:
    'font-heading text-lg font-medium sm:[[data-slot=alert-dialog-content][data-size=default]:has([data-slot=alert-dialog-media])_&]:col-start-2',
  description:
    'text-sm text-balance text-muted-foreground md:text-pretty [&>a]:underline [&>a]:underline-offset-3 [&>a:hover]:text-foreground',
} as const;

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Trigger>
>((props, ref) => <AlertDialogPrimitive.Trigger ref={ref} data-slot="alert-dialog-trigger" {...props} />);
AlertDialogTrigger.displayName = 'AlertDialogTrigger';

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    data-slot="alert-dialog-overlay"
    className={cn(WORKSPACE_ALERT_DIALOG.overlay, className)}
    {...props}
  />
));
AlertDialogOverlay.displayName = 'AlertDialogOverlay';

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
    /** `sm` is the test's compact dialog (centred text, two-column footer). */
    size?: 'default' | 'sm';
  }
>(({ className, size = 'default', ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      data-slot="alert-dialog-content"
      data-size={size}
      className={cn(WORKSPACE_ALERT_DIALOG.content, className)}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = 'AlertDialogContent';

const AlertDialogHeader = ({ className, ...props }: React.ComponentProps<'div'>): React.ReactElement => (
  <div
    data-slot="alert-dialog-header"
    className={cn(WORKSPACE_ALERT_DIALOG.header, className)}
    {...props}
  />
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

const AlertDialogFooter = ({ className, ...props }: React.ComponentProps<'div'>): React.ReactElement => (
  <div
    data-slot="alert-dialog-footer"
    className={cn(WORKSPACE_ALERT_DIALOG.footer, className)}
    {...props}
  />
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

const AlertDialogMedia = ({ className, ...props }: React.ComponentProps<'div'>): React.ReactElement => (
  <div
    data-slot="alert-dialog-media"
    className={cn(WORKSPACE_ALERT_DIALOG.media, className)}
    {...props}
  />
);
AlertDialogMedia.displayName = 'AlertDialogMedia';

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    data-slot="alert-dialog-title"
    className={cn(WORKSPACE_ALERT_DIALOG.title, className)}
    {...props}
  />
));
AlertDialogTitle.displayName = 'AlertDialogTitle';

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    data-slot="alert-dialog-description"
    className={cn(WORKSPACE_ALERT_DIALOG.description, className)}
    {...props}
  />
));
AlertDialogDescription.displayName = 'AlertDialogDescription';

/** A workspace Button (default variant). It doesn't close the dialog by itself, as in the test. */
const AlertDialogAction = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'appearance'>>(
  ({ className, ...props }, ref) => (
    <Button
      ref={ref}
      appearance="workspace"
      data-slot="alert-dialog-action"
      className={cn(className)}
      {...props}
    />
  )
);
AlertDialogAction.displayName = 'AlertDialogAction';

/** Closes the dialog: a workspace Button, outline by default. */
const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'appearance'>
>(({ className, variant = 'outline', size = 'default', ...props }, ref) => (
  <AlertDialogPrimitive.Cancel asChild>
    <Button
      ref={ref}
      appearance="workspace"
      data-slot="alert-dialog-cancel"
      variant={variant}
      size={size}
      className={cn(className)}
      {...props}
    />
  </AlertDialogPrimitive.Cancel>
));
AlertDialogCancel.displayName = 'AlertDialogCancel';

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
