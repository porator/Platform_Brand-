"use client";

import * as React from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { IconCalendar, IconX } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "@/components/atoms/_kit";

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  invalid,
  id,
}: {
  value?: Date;
  onChange?: (d?: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            aria-invalid={invalid || undefined}
            className={cn("w-56 justify-start gap-2 font-normal", !value && "text-muted-foreground")}
          />
        }
      >
        <IconCalendar className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        {value ? format(value, "PPP") : placeholder}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            onChange?.(d);
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a range",
}: {
  value?: DateRange;
  onChange?: (r?: DateRange) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const label =
    value?.from && value?.to
      ? `${format(value.from, "MMM d")} – ${format(value.to, "MMM d, yyyy")}`
      : value?.from
        ? format(value.from, "MMM d, yyyy")
        : placeholder;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn("w-72 justify-start gap-2 font-normal", !value?.from && "text-muted-foreground")}
          />
        }
      >
        <IconCalendar className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        {label}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar mode="range" selected={value} onSelect={onChange} numberOfMonths={2} autoFocus />
      </PopoverContent>
    </Popover>
  );
}

export function DatePickerPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 9, 6));
  const [clearable, setClearable] = React.useState<Date | undefined>(new Date(2026, 9, 20));
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 9, 1),
    to: new Date(2026, 9, 7),
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="Form & Controls"
        title="Date Picker"
        description={
          <>
            Selects a date from a calendar in a popover — the shadcn <Mono>Calendar</Mono>{" "}
            (react-day-picker) inside a <Mono>Popover</Mono>, triggered by a button that shows the
            formatted value.
          </>
        }
      />

      <Section title="Basic example" description="A single date, formatted in the trigger.">
        <Field className="max-w-fit">
          <FieldLabel htmlFor="dp-basic">Release date</FieldLabel>
          <DatePicker id="dp-basic" value={date} onChange={setDate} />
        </Field>
      </Section>

      <Section title="States" description="Open and calendar navigation are live. The rest are explicit.">
        <div className="flex flex-col gap-6">
          <Row label="Empty" className="max-w-fit">
            <DatePicker value={undefined} onChange={() => {}} />
          </Row>
          <Row label="Selected" className="max-w-fit">
            <DatePicker value={new Date(2026, 9, 6)} onChange={() => {}} />
          </Row>
          <Row label="Disabled" className="max-w-fit">
            <DatePicker value={new Date(2026, 9, 6)} disabled />
          </Row>
          <Row label="Invalid" hint="aria-invalid with a destructive message." className="max-w-fit">
            <Field data-invalid className="max-w-fit">
              <DatePicker value={undefined} invalid placeholder="Pick a date" />
              <FieldError>A release date is required.</FieldError>
            </Field>
          </Row>
          <Row label="Clearable" hint="A reset action appears once a date is set." className="max-w-fit">
            <div className="flex items-center gap-2">
              <DatePicker value={clearable} onChange={setClearable} />
              {clearable ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Clear date"
                  onClick={() => setClearable(undefined)}
                >
                  <IconX />
                </Button>
              ) : null}
            </div>
          </Row>
        </div>
      </Section>

      <Section
        title="Date range"
        description="The same primitive in range mode across two months — for filtering builds or releases by period."
      >
        <Field className="max-w-fit">
          <FieldLabel>Reporting period</FieldLabel>
          <DateRangePicker value={range} onChange={setRange} />
        </Field>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            "The grid is fully keyboard navigable — arrows move by day, PageUp/Down by month.",
            "The trigger is labelled and shows the selected date as text, not only visually.",
            "Opening the popover moves focus into the calendar; Esc closes and restores focus.",
            "Invalid state uses aria-invalid with a message; disabled is non-interactive.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
