"use client";

import * as React from "react";
import { IconUser } from "@/lib/icons";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { PageShell, PageHeader, Section, Mono, Row, A11yList } from "./_kit";

/** Flat placeholder "photo" as a data-URI SVG (stand-in imagery, not a token). */
function photo(bg: string, initials: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="${bg}"/><text x="50%" y="52%" font-family="sans-serif" font-size="38" fill="#fafaf9" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const AVA = photo("#44403c", "AM");
const AVB = photo("#292524", "JD");
const AVC = photo("#57534e", "KP");

export function AvatarPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Atoms"
        title="Avatar"
        description={
          <>
            Represents a user or entity with a photo, initials, or an icon fallback. Built on the
            shadcn <Mono>Avatar</Mono> (Base UI), with status indicators and grouping.
          </>
        }
      />

      <Section title="Basic usage">
        <Row label="Image">
          <Avatar>
            <AvatarImage src={AVA} alt="Ava Morgan" />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
        </Row>
      </Section>

      <Section
        title="Image, initials & fallback"
        description="Show a photo when available; fall back to initials, then to a neutral icon."
      >
        <Row label="Three sources">
          <Avatar>
            <AvatarImage src={AVB} alt="Jordan Diaz" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>KP</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback role="img" aria-label="Unknown user">
              <IconUser className="size-4" aria-hidden />
            </AvatarFallback>
          </Avatar>
        </Row>
      </Section>

      <Section title="Sizes" description="Three sizes: small, default and large.">
        <Row label="Scale">
          <Avatar size="sm">
            <AvatarImage src={AVA} alt="Ava Morgan" />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
          <Avatar size="default">
            <AvatarImage src={AVA} alt="Ava Morgan" />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarImage src={AVA} alt="Ava Morgan" />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
        </Row>
      </Section>

      <Section
        title="Status indicator"
        description="A small badge communicates presence. Color is token-based; pair with a title/label for non-visual users."
      >
        <Row label="Presence">
          <Avatar>
            <AvatarImage src={AVA} alt="Ava Morgan — online" />
            <AvatarFallback>AM</AvatarFallback>
            <AvatarBadge className="bg-success" title="Online" />
          </Avatar>
          <Avatar>
            <AvatarImage src={AVB} alt="Jordan Diaz — away" />
            <AvatarFallback>JD</AvatarFallback>
            <AvatarBadge className="bg-warning" title="Away" />
          </Avatar>
          <Avatar>
            <AvatarImage src={AVC} alt="Kai Price — offline" />
            <AvatarFallback>KP</AvatarFallback>
            <AvatarBadge className="bg-muted-foreground" title="Offline" />
          </Avatar>
        </Row>
      </Section>

      <Section
        title="Avatar group"
        description="Overlap avatars to represent a set; cap the visible count with an overflow tally."
      >
        <Row label="Group">
          <AvatarGroup>
            <Avatar>
              <AvatarImage src={AVA} alt="Ava Morgan" />
              <AvatarFallback>AM</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src={AVB} alt="Jordan Diaz" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src={AVC} alt="Kai Price" />
              <AvatarFallback>KP</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+5</AvatarGroupCount>
          </AvatarGroup>
        </Row>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              Provide a meaningful <Mono>alt</Mono> on the image (the person&apos;s name); the image
              falls back to initials automatically if it fails to load.
            </>,
            "Icon-only fallbacks carry an aria-label so the avatar still has a name.",
            "Status dots include a title and should be reinforced by nearby text, not color alone.",
            "Initials and fallbacks meet AA contrast on the muted surface in both themes.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
