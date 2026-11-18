"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldDescription, FieldContent } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SplitView } from "@/components/layout/primitives";
import { AppPreview } from "@/components/product/app-preview";
import { AppFrame } from "./_frame";

function EditorControls({ onChange }: { onChange: () => void }) {
  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      <h2 className="text-base font-semibold text-foreground">Store configuration</h2>

      <Field>
        <FieldLabel htmlFor="ed-title">Store title</FieldLabel>
        <Input id="ed-title" defaultValue="Project Alpha Store" onChange={onChange} />
      </Field>

      <Field>
        <FieldLabel htmlFor="ed-featured">Featured pack</FieldLabel>
        <Select items={{ starter: "Starter Pack", coins: "Coin Bundle", mega: "Mega Deal" }} defaultValue="starter" onValueChange={onChange}>
          <SelectTrigger id="ed-featured" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="starter">Starter Pack</SelectItem>
            <SelectItem value="coins">Coin Bundle</SelectItem>
            <SelectItem value="mega">Mega Deal</SelectItem>
          </SelectContent>
        </Select>
        <FieldDescription>Shown first in the store.</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="ed-cta">Primary button label</FieldLabel>
        <Input id="ed-cta" defaultValue="Buy now" onChange={onChange} />
      </Field>

      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel>Show “Best value” badge</FieldLabel>
          <FieldDescription>Highlights the featured pack.</FieldDescription>
        </FieldContent>
        <Switch defaultChecked onCheckedChange={onChange} aria-label="Show best value badge" />
      </Field>
    </div>
  );
}

export function EditorPage() {
  const [dirty, setDirty] = React.useState(false);
  const markDirty = () => setDirty(true);
  const save = () => {
    setDirty(false);
    toast.success("Store configuration saved");
  };

  return (
    <AppFrame
      sidebarActive="Projects"
      resource="editor"
      title="Editor"
      description="Configure the Appcharge store for Project Alpha in Production, with a live preview."
      actions={
        <>
          <Button variant="outline" size="sm" disabled={!dirty} onClick={() => setDirty(false)}>
            Discard
          </Button>
          <Button size="sm" disabled={!dirty} onClick={save}>
            Save changes
          </Button>
        </>
      }
      contentClassName="p-0"
    >
      <SplitView
        className="min-h-[32rem]"
        primaryClassName="lg:w-96"
        primary={<EditorControls onChange={markDirty} />}
        secondary={
          <div className="flex flex-col gap-3 p-4 sm:p-6">
            <h2 className="text-base font-semibold text-foreground">Preview</h2>
            <AppPreview environment="Production" defaultDevice="mobile" />
          </div>
        }
      />
    </AppFrame>
  );
}
