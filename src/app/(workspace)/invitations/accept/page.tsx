"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiMutate } from "@/lib/api-client";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AcceptInvitationPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing invitation token.");
      return;
    }
    (async () => {
      try {
        const data = await apiMutate<{ projectId: string }>("/api/invitations/accept", "POST", { token });
        setProjectId(data.projectId);
        setStatus("success");
      } catch (e: any) {
        setStatus("error");
        setMessage(e?.message || "Invitation could not be accepted.");
      }
    })();
  }, [token]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-lg p-6">
        <PageHeader eyebrow="Invitation" title="Invitation accepted" description="You now have access to the project." />
        <div className="mt-6">
          {projectId && (
            <Button asChild>
              <Link href={`/projects/${projectId}`}>Open project</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <PageHeader eyebrow="Invitation" title="Invitation unavailable" description={message} />
      <div className="mt-6">
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to overview</Link>
        </Button>
      </div>
    </div>
  );
}
