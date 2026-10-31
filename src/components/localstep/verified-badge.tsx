import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function VerifiedBadge() {
  return (
    <Badge variant="secondary" className="gap-1 border-success/30 text-success">
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verified employer
    </Badge>
  );
}
