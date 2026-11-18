import * as React from 'react';

import { cn } from '../../utils/cn';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'metric'
  | 'body-lg'
  | 'body'
  | 'body-sm'
  | 'caption'
  | 'code'
  | 'overline';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'code' | 'label';
  variant?: TypographyVariant;
  muted?: boolean;
  tabular?: boolean;
  required?: boolean;
  dataTestId?: string;
}

// Each variant uses a text style from the Figma "Typography" page (Desktop):
// H1 text-5xl/extrabold, H2 text-3xl/semibold, H3 text-2xl/semibold, H4 text-xl/semibold,
// Lead text-xl/normal, P text-base/normal, Small and Muted text-sm/medium,
// InlineCode Geist Mono 14. `metric` uses the text-3xl/semibold style; `overline` the
// text-xs/semibold style (uppercase is a text transform, not a token).
const VARIANT_CLASSES: Record<TypographyVariant, string> = {
  h1: 'text-5xl font-extrabold text-foreground',
  h2: 'text-3xl font-semibold text-foreground',
  h3: 'text-2xl font-semibold text-foreground',
  h4: 'text-xl font-semibold text-foreground',
  metric: 'text-3xl font-semibold tabular-nums text-foreground',
  'body-lg': 'text-xl text-foreground',
  body: 'text-base text-foreground',
  'body-sm': 'text-sm font-medium text-foreground',
  caption: 'text-sm font-medium text-muted-foreground',
  code: 'rounded-sm bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground',
  overline: 'text-xs font-semibold uppercase text-muted-foreground',
};

const TAG_DEFAULT_VARIANT: Record<NonNullable<TypographyProps['tag']>, TypographyVariant> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  p: 'body',
  span: 'body',
  div: 'body',
  code: 'code',
  label: 'body-sm',
};

export const Typography: React.FC<TypographyProps> = ({
  children,
  tag = 'p',
  variant,
  muted = false,
  tabular = false,
  required = false,
  className,
  dataTestId,
  ...props
}) => {
  if (children === undefined || children === null) return null;

  const resolvedVariant = variant ?? TAG_DEFAULT_VARIANT[tag];
  const Comp = tag as React.ElementType;

  return (
    <Comp
      data-testid={dataTestId}
      className={cn(
        VARIANT_CLASSES[resolvedVariant],
        muted && 'text-muted-foreground',
        tabular && 'tabular-nums',
        required &&
          'after:content-["*"] after:text-destructive after:text-xs after:ml-1 after:font-semibold',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
};
