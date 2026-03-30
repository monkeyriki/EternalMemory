"use client";

import { useEffect } from "react";

/**
 * Server redirects cannot reliably carry a URL hash; client navigation ensures
 * /why-evermissed lands on the homepage section #why-evermissed.
 */
export function WhyEverMissedRedirect() {
  useEffect(() => {
    window.location.replace("/" + window.location.search + "#why-evermissed");
  }, []);
  return null;
}
