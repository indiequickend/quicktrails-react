"use client";

import { useEffect } from "react";
import { recordPageView } from "@/lib/actions/analytics";

export default function TrackPageView({ path, slug, refType }) {
  useEffect(() => {
    const referrer = document.referrer;
    // Ignore same-origin navigations — not useful for traffic source analysis
    const isSameOrigin = referrer && referrer.startsWith(window.location.origin);
    const params = new URLSearchParams(window.location.search);

    recordPageView({
      path,
      slug: slug || "",
      refType: refType || "page",
      referrer: isSameOrigin ? "" : referrer,
      utmSource:   params.get("utm_source")   || "",
      utmMedium:   params.get("utm_medium")   || "",
      utmCampaign: params.get("utm_campaign") || "",
    });
  // path is stable per page mount; effect fires once per visit
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
