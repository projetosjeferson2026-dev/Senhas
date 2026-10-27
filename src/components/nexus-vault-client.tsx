"use client";

import { useState } from "react";

import { NexusVaultApp } from "@/components/nexus-vault-app";
import { getSupabaseConfiguration } from "@/lib/supabase";

export function NexusVaultClient() {
  const [configuration] = useState(getSupabaseConfiguration);
  return <NexusVaultApp configuration={configuration} />;
}
