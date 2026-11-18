"use client";

import * as React from "react";
import { IconMail, IconUser, IconCircleCheck, IconAlertTriangle } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

type Status = "error" | "success" | "warning";

export type TextFieldProps = {
  id: string;
  label?: string;
  required?: boolean;
  optional?: boolean;
  description?: React.ReactNode;
  helper?: React.ReactNode;
  status?: Status;
  message?: React.ReactNode;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  maxLength?: number;
  showCount?: boolean;
  defaultValue?: string;
  placeholder?: string;
  type?: React.ComponentProps<"input">["type"];
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
};

/** Canonical text-input composition: Field + InputGroup with validation. */
export function TextField({
  id,
  label,
  required,
  optional,
  description,
  helper,
  status,
  message,
  leadingIcon,
  trailingIcon,
  maxLength,
  showCount,
  defaultValue = "",
  placeholder,
  type,
  disabled,
  readOnly,
  className,
}: TextFieldProps) {
  const [value, setValue] = React.useState(defaultValue);
  const invalid = status === "error";
  const descId = description ? `${id}-desc` : undefined;
  const msgId = message ? `${id}-msg` : undefined;

  const statusBorder =
    status === "success"
      ? "border-success focus-within:border-success"
      : status === "warning"
        ? "border-warning focus-within:border-warning"
        : "";
  const msgClass =
    status === "error"
      ? "text-destructive"
      : status === "success"
        ? "text-success"
        : status === "warning"
          ? "text-warning"
          : "text-muted-foreground";

  return (
    <Field data-invalid={invalid || undefined} className={cn("max-w-sm", className)}>
      {label ? (
        <FieldLabel htmlFor={id}>
          {label}
          {required ? (
            <span className="text-destructive" aria-hidden>
              *
            </span>
          ) : null}
          {optional ? (
            <span className="font-normal text-muted-foreground">(optional)</span>
          ) : null}
        </FieldLabel>
      ) : null}
      {description ? <FieldDescription id={descId}>{description}</FieldDescription> : null}

      <InputGroup className={cn(statusBorder, disabled && "opacity-60")}>
        {leadingIcon ? <InputGroupAddon>{leadingIcon}</InputGroupAddon> : null}
        <InputGroupInput
          id={id}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={cn(descId, msgId) || undefined}
        />
        {trailingIcon ? <InputGroupAddon align="inline-end">{trailingIcon}</InputGroupAddon> : null}
        {showCount && maxLength ? (
          <InputGroupAddon align="inline-end">
            <InputGroupText className="text-xs tabular-nums">
              {value.length}/{maxLength}
            </InputGroupText>
          </InputGroupAddon>
        ) : null}
      </InputGroup>

      {message ? (
        invalid ? (
          <FieldError id={msgId}>{message}</FieldError>
        ) : (
          <p id={msgId} className={cn("text-sm", msgClass)}>
            {message}
          </p>
        )
      ) : null}
      {helper && !message ? <FieldDescription>{helper}</FieldDescription> : null}
    </Field>
  );
}

export function TextFieldPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Form & Controls"
        title="Text Field"
        description={
          <>
            A complete text-input composition — <Mono>Field</Mono> (label, description, validation)
            around an <Mono>InputGroup</Mono> that hosts the <Mono>Input</Mono> atom plus leading/
            trailing adornments. This is how single inputs appear inside forms.
          </>
        }
      />

      <Section title="Basic example" description="Label, control and a short description.">
        <TextField
          id="tf-basic"
          label="Project name"
          description="Shown in the dashboard and used to generate the slug."
          placeholder="e.g. New Gen Wire"
          defaultValue="New Gen Wire"
        />
      </Section>

      <Section
        title="Anatomy"
        description="Label with a required indicator, description, control, and helper text below."
      >
        <TextField
          id="tf-anatomy"
          label="Workspace URL"
          required
          description="Lowercase letters, numbers and dashes."
          helper="You can change this later in settings."
          placeholder="acme"
          defaultValue="appcharge"
          leadingIcon={<IconUser aria-hidden />}
        />
      </Section>

      <Section title="States" description="Focus is live. The rest are shown explicitly.">
        <div className="flex flex-col gap-6">
          <Row label="Default" className="max-w-sm">
            <TextField id="tf-default" label="Label" placeholder="Placeholder" />
          </Row>
          <Row label="Filled" className="max-w-sm">
            <TextField id="tf-filled" label="Label" defaultValue="Filled value" />
          </Row>
          <Row label="Disabled" className="max-w-sm">
            <TextField id="tf-disabled" label="Label" defaultValue="Locked" disabled />
          </Row>
          <Row label="Read-only" className="max-w-sm">
            <TextField id="tf-ro" label="Organisation ID" defaultValue="org_8f3a21" readOnly />
          </Row>
          <Row label="Error" className="max-w-sm">
            <TextField
              id="tf-error"
              label="Email"
              status="error"
              message="Enter a valid email address."
              defaultValue="not-an-email"
              type="email"
            />
          </Row>
          <Row label="Success" className="max-w-sm">
            <TextField
              id="tf-success"
              label="Email"
              status="success"
              message="Looks good."
              defaultValue="pat@appcharge.com"
              trailingIcon={<IconCircleCheck className="text-success" aria-hidden />}
            />
          </Row>
          <Row label="Warning" className="max-w-sm">
            <TextField
              id="tf-warning"
              label="Subdomain"
              status="warning"
              message="This subdomain is close to another one."
              defaultValue="appcharge-io"
              trailingIcon={<IconAlertTriangle className="text-warning" aria-hidden />}
            />
          </Row>
        </div>
      </Section>

      <Section
        title="Adornments"
        description="Leading / trailing icons and a live character count via InputGroup addons."
      >
        <div className="flex flex-col gap-6">
          <Row label="Leading icon" className="max-w-sm">
            <TextField id="tf-lead" label="Email" type="email" placeholder="you@company.com" leadingIcon={<IconMail aria-hidden />} />
          </Row>
          <Row label="Character count" className="max-w-sm">
            <TextField
              id="tf-count"
              label="Display name"
              maxLength={32}
              showCount
              defaultValue="New Gen Wire"
              helper="Keep it short and recognisable."
            />
          </Row>
        </div>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              The <Mono>&lt;label&gt;</Mono> is associated to the input by <Mono>htmlFor</Mono>/
              <Mono>id</Mono>.
            </>,
            <>
              Description and validation messages are linked with <Mono>aria-describedby</Mono>;
              errors use <Mono>aria-invalid</Mono> and render in a <Mono>role=&quot;alert&quot;</Mono>.
            </>,
            "Required is marked visually and with the native required attribute.",
            "Status is never color-only — an icon and message accompany success/warning/error.",
            "Disabled and read-only are distinct, with visible focus preserved on editable fields.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
