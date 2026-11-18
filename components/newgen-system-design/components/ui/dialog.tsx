import * as DialogPrimitive from '@radix-ui/react-dialog';
import { IconX } from '@/lib/icons';
import { IconX as X } from '@/lib/icons';
import * as React from 'react';

import { cn } from '../../utils/cn';
import { Button, type UIAppearance } from './button';

/*
 * workspace: the usability test's components/ui/dialog.tsx (base-vega), translated to Tailwind 3
 * / Radix: data-open / data-closed → data-[state=open|closed]; supports-backdrop-filter →
 * supports-[backdrop-filter]; *:[a] → [&>a]. tailwindcss-animate's animate-in / animate-out set
 * their own 150ms after the bare duration-100, so the duration is repeated under the state
 * variants. Tailwind 4 positions with the CSS `translate` property, which the keyframes'
 * transform composes with; here the -translate-*-1/2 values feed that property too
 * ([transform:none] + [translate:…]) so the popup stays centred while it fades and zooms, and
 * a caller's translate-y-0 (CommandDialog) works as in the test.
 * DialogContent passes the appearance to the header, footer, title and description.
 */
const WORKSPACE_DIALOG = {
  overlay:
    'fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-[backdrop-filter]:backdrop-blur-xs data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:duration-100 data-[state=closed]:duration-100',
  content:
    'fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 [transform:none] [translate:var(--tw-translate-x)_var(--tw-translate-y)] gap-6 rounded-xl bg-popover p-6 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:duration-100 data-[state=closed]:duration-100',
  header: 'flex flex-col gap-2',
  footer: 'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
  title: 'font-heading leading-none font-medium',
  description:
    'text-sm text-muted-foreground [&>a]:underline [&>a]:underline-offset-[3px] [&>a:hover]:text-foreground',
} as const;

const DialogAppearanceContext = React.createContext<UIAppearance>('default');

/** A part's appearance: its own prop, else the enclosing DialogContent's. */
function useDialogAppearance(own?: UIAppearance): UIAppearance {
  const inherited = React.useContext(DialogAppearanceContext);
  return own ?? inherited;
}

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & { appearance?: UIAppearance }
>(({ className, appearance = 'default', ...props }, ref) =>
  appearance === 'workspace' ? (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="dialog-overlay"
      className={cn(WORKSPACE_DIALOG.overlay, className)}
      {...props}
    />
  ) : (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
  )
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  hideCloseButton?: boolean;
  /** The test's name for the inverse of hideCloseButton; wins when both are set. */
  showCloseButton?: boolean;
  /**
   * `workspace` renders the usability test's base-vega dialog (overlay, popup, ghost icon close
   * button) and passes the appearance to its header, footer, title and description.
   */
  appearance?: UIAppearance;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ appearance = 'default', ...rest }, ref) =>
  appearance === 'workspace' ? (
    <WorkspaceDialogContent ref={ref} {...rest} />
  ) : (
    <DefaultDialogContent ref={ref} {...rest} />
  )
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const WorkspaceDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  Omit<DialogContentProps, 'appearance'>
>(({ className, children, hideCloseButton = false, showCloseButton, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay appearance="workspace" />
    <DialogPrimitive.Content
      ref={ref}
      data-slot="dialog-content"
      className={cn(WORKSPACE_DIALOG.content, className)}
      {...props}
    >
      <DialogAppearanceContext.Provider value="workspace">
        {children}
        {(showCloseButton ?? !hideCloseButton) && (
          <DialogPrimitive.Close asChild>
            <Button
              appearance="workspace"
              variant="ghost"
              size="icon-sm"
              className="absolute top-4 right-4"
              data-slot="dialog-close"
            >
              <IconX />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogAppearanceContext.Provider>
    </DialogPrimitive.Content>
  </DialogPortal>
));
WorkspaceDialogContent.displayName = 'WorkspaceDialogContent';

const DefaultDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  Omit<DialogContentProps, 'appearance'>
>(({ className, children, hideCloseButton = false, showCloseButton, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-lg duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        className
      )}
      {...props}
    >
      <DialogAppearanceContext.Provider value="default">{children}</DialogAppearanceContext.Provider>
      {(showCloseButton ?? !hideCloseButton) && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground opacity-75 transition-opacity hover:bg-accent hover:text-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring/25">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DefaultDialogContent.displayName = DialogPrimitive.Content.displayName;

export interface DialogPartProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Defaults to the enclosing DialogContent's appearance. */
  appearance?: UIAppearance;
}

const DialogHeader = ({ className, appearance, ...props }: DialogPartProps): React.ReactElement =>
  useDialogAppearance(appearance) === 'workspace' ? (
    <div data-slot="dialog-header" className={cn(WORKSPACE_DIALOG.header, className)} {...props} />
  ) : (
    <div className={cn('flex flex-col space-y-1.5 text-left', className)} {...props} />
  );
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
  className,
  appearance,
  showCloseButton = false,
  children,
  ...props
}: DialogPartProps & {
  /** Workspace only: appends the test's outline "Close" button. */
  showCloseButton?: boolean;
}): React.ReactElement =>
  useDialogAppearance(appearance) === 'workspace' ? (
    <div data-slot="dialog-footer" className={cn(WORKSPACE_DIALOG.footer, className)} {...props}>
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button appearance="workspace" variant="outline">
            Close
          </Button>
        </DialogPrimitive.Close>
      )}
    </div>
  ) : (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2', className)}
      {...props}
    >
      {children}
    </div>
  );
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & { appearance?: UIAppearance }
>(({ className, appearance, ...props }, ref) =>
  useDialogAppearance(appearance) === 'workspace' ? (
    <DialogPrimitive.Title
      ref={ref}
      data-slot="dialog-title"
      className={cn(WORKSPACE_DIALOG.title, className)}
      {...props}
    />
  ) : (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-base font-semibold leading-none text-foreground', className)}
    {...props}
  />
  )
);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & {
    appearance?: UIAppearance;
  }
>(({ className, appearance, ...props }, ref) =>
  useDialogAppearance(appearance) === 'workspace' ? (
    <DialogPrimitive.Description
      ref={ref}
      data-slot="dialog-description"
      className={cn(WORKSPACE_DIALOG.description, className)}
      {...props}
    />
  ) : (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm leading-5 text-muted-foreground', className)}
    {...props}
  />
  )
);
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export interface DialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  primaryVariant?: 'default' | 'destructive' | 'success';
  isLoading?: boolean;
  dataTestId?: string;
}

export const DialogModal: React.FC<DialogModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  primaryButtonText = 'Confirm',
  secondaryButtonText = 'Cancel',
  onPrimaryClick,
  onSecondaryClick,
  primaryVariant = 'default',
  isLoading = false,
  dataTestId,
}) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent data-testid={dataTestId} className="max-w-[460px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      {children && <div className="py-1">{children}</div>}
      <DialogFooter>
        {secondaryButtonText && (
          <Button variant="outline" onClick={onSecondaryClick ?? onClose} disabled={isLoading}>
            {secondaryButtonText}
          </Button>
        )}
        {primaryButtonText && (
          <Button variant={primaryVariant} onClick={onPrimaryClick} isLoading={isLoading}>
            {primaryButtonText}
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
