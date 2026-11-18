"use client";

import { useParams, useSearchParams } from "next/navigation";
import { getClient, sectionLabel, ROOT_FOLDER_ID } from "@/lib/newgen";
import { FolderBody, FolderSectionBody, NotInTest } from "@/components/dashboard/bodies";

/** Folder-scoped section. Company is the root folder; any other folder comes
 *  from ?folder=. The client comes from ?client= (defaults to the primary
 *  client). Home is the roll-up; other tabs are aggregated scaffolds. The shell
 *  derives the title + path from the URL. */
export default function CompanySectionPage() {
  const params = useParams<{ section: string }>();
  const searchParams = useSearchParams();
  const client = getClient(searchParams.get("client"));
  const folderId = searchParams.get("folder") ?? ROOT_FOLDER_ID;
  const section = params.section ?? "home";

  if (section === "home") return <FolderBody client={client} folderId={folderId} />;
  // Orders isn't part of this test (FolderOrdersBody stays for later).
  if (section === "orders") return <NotInTest page="Orders" />;
  return <FolderSectionBody client={client} folderId={folderId} section={sectionLabel(client, section)} />;
}
