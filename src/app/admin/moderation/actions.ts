"use server";

import { approveTributeAction as approveTributeFromMemorial } from "@/app/memorials/[slug]/tributes/actions";

/** Wrapper: Next.js requires named async exports in "use server" files (no re-exports). */
export async function approveTributeAction(id: string) {
  return approveTributeFromMemorial(id);
}
