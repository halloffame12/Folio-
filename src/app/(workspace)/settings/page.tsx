"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "next-themes";
import {
  Bell,
  BookOpen,
  Check,
  Copy,
  Database,
  Download,
  FileJson,
  Fingerprint,
  LayoutGrid,
  Mail,
  Moon,
  Palette,
  PencilLine,
  Quote,
  RotateCcw,
  Save,
  Settings2,
  Sun,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import type { CitationStyle } from "@/types";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { papers } from "@/lib/client-registry";
import {
  citationStyleLabels,
  citationStyleShort,
  generateCitation,
} from "@/lib/citations";
import { copyToClipboard, formatDate, initials as toInitials, cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(80, "Keep your name under 80 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  title: z.string().trim().min(2, "Add your role or academic title").max(90),
  affiliation: z
    .string()
    .trim()
    .min(2, "Add your institution or department")
    .max(140),
  interests: z.string().trim().max(240, "Keep interests under 240 characters"),
  orcid: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) =>
        !value || /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i.test(value.replace(/\s/g, "")),
      "Use the format 0000-0000-0000-0000"
    ),
});

type ProfileValues = z.infer<typeof profileSchema>;

const styleNotes: Record<CitationStyle, string> = {
  apa: "Author–date · social sciences, education",
  mla: "Author–page · humanities and language",
  ieee: "Numeric · engineering and computing",
  chicago: "Notes & bibliography · history, arts",
};

function themePreview(theme: "light" | "dark") {
  return theme === "light"
    ? {
        shell: "#F7F6F2",
        panel: "#FFFFFF",
        edge: "#DEDCD4",
        ink: "#354C43",
        soft: "#E9E6DE",
      }
    : {
        shell: "#141715",
        panel: "#1B1F1C",
        edge: "#303630",
        ink: "#8FB39E",
        soft: "#242925",
      };
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 px-4 py-3.5">
      <div className="flex min-w-0 gap-3">
        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="text-[12.5px] font-medium text-foreground">{title}</p>
          <p className="mt-0.5 max-w-md text-[11px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="shrink-0 pt-0.5">{children}</div>
    </div>
  );
}

function SectionCard({
  title,
  eyebrow,
  description,
  children,
  footer,
}: {
  title: string;
  eyebrow: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-1 font-display text-[15px] font-semibold tracking-[-0.01em]">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
      {footer && (
        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface/40 px-4 py-3">
          {footer}
        </div>
      )}
    </section>
  );
}

export default function SettingsPage() {
  const profile = useWorkspaceStore((s) => s.profile);
  const settings = useWorkspaceStore((s) => s.settings);
  const data = useWorkspaceStore((s) => s.data);
  const updateProfile = useWorkspaceStore((s) => s.updateProfile);
  const updateSettings = useWorkspaceStore((s) => s.updateSettings);
  const resetWorkspace = useWorkspaceStore((s) => s.resetWorkspace);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState("profile");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    const allowed = ["profile", "appearance", "notifications", "citations", "data"];
    if (requested && allowed.includes(requested)) setTab(requested);
  }, []);

  const changeTab = (value: string) => {
    setTab(value);
    const url =
      value === "profile" ? window.location.pathname : `${window.location.pathname}?tab=${value}`;
    window.history.replaceState(null, "", url);
  };

  const toFormValues = (source: typeof profile): ProfileValues => ({
    name: source.name,
    email: source.email,
    title: source.title,
    affiliation: source.affiliation,
    interests: source.researchInterests.join(", "),
    orcid: source.orcid ?? "",
  });

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toFormValues(profile),
    mode: "onBlur",
  });

  const { reset, formState } = form;

  useEffect(() => {
    reset(toFormValues(profile));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, reset]);

  const activeTheme = mounted && theme === "dark" ? "dark" : "light";
  const defaultPaper = papers[0];
  const defaultCitation = defaultPaper
    ? generateCitation(defaultPaper, settings.citationStyle)
    : "";

  const counts = useMemo(
    () => [
      { label: "Library papers", value: data.library.length },
      { label: "Collections", value: data.collections.length },
      { label: "Notes", value: data.notes.length },
      { label: "Projects", value: data.projects.length },
      { label: "Tasks", value: data.tasks.length },
      { label: "Milestones", value: data.milestones.length },
      { label: "Reviews", value: data.literatureReviews.length },
      { label: "Notifications", value: data.notifications.length },
    ],
    [data]
  );

  const onSubmit = async (values: ProfileValues) => {
    const interests = values.interests
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8);

    updateProfile({
      name: values.name,
      email: values.email,
      title: values.title,
      affiliation: values.affiliation,
      researchInterests: interests,
      orcid: values.orcid?.trim() || undefined,
      initials: toInitials(values.name),
    });
    toast.success("Profile updated", {
      description: "Your changes are stored locally in this demo workspace.",
    });
  };

  const exportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      note: "Folio frontend demonstration — all records are mock data.",
      profile,
      settings,
      data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `folio-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success("Workspace exported", {
      description: "A JSON snapshot of the demo data was downloaded.",
    });
  };

  const savedAuto = (key: string) => (
    <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
      <Check className="size-3 text-success" /> {key}
    </span>
  );

  return (
    <div>
      <PageHeader
        eyebrow="Personal"
        title="Settings"
        description="Your profile, reading preferences, and interface defaults. Everything here is local to this browser demonstration."
        actions={
          <Badge variant="outline" className="h-7 gap-1.5 px-2.5">
            <Fingerprint className="size-3" /> Local demo identity
          </Badge>
        }
      />

      <Tabs value={tab} onValueChange={changeTab} className="gap-0">
        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <TabsList className="h-auto w-max justify-start p-1">
            <TabsTrigger value="profile" className="gap-2 px-3 py-1.5">
              <UserRound /> Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 px-3 py-1.5">
              <Palette /> Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 px-3 py-1.5">
              <Bell /> Notifications
            </TabsTrigger>
            <TabsTrigger value="citations" className="gap-2 px-3 py-1.5">
              <Quote /> Citations
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2 px-3 py-1.5">
              <Database /> Data
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Profile ---------------------------------------------------------- */}
        <TabsContent value="profile" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">
            <SectionCard
              eyebrow="01 · Profile"
              title="Academic identity"
              description="Shown on comments, project rosters, and exported citations."
              footer={
                <>
                  <span className="hidden text-[10.5px] text-muted-foreground sm:inline">
                    {formState.isDirty
                      ? "Unsaved changes"
                      : `Last reviewed ${formatDate(profile.joinedAt, {
                          month: "short",
                          year: "numeric",
                        })}`}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => reset(toFormValues(profile))}
                      disabled={!formState.isDirty || formState.isSubmitting}
                    >
                      Discard
                    </Button>
                    <Button
                      type="submit"
                      form="profile-form"
                      size="sm"
                      disabled={!formState.isDirty || formState.isSubmitting}
                    >
                      {formState.isSubmitting ? (
                        <PencilLine className="animate-pulse" />
                      ) : (
                        <Save />
                      )}
                      Save profile
                    </Button>
                  </div>
                </>
              }
            >
              <form
                id="profile-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4 px-4 py-4 sm:grid-cols-2"
                noValidate
              >
                <div className="space-y-1.5">
                  <Label htmlFor="profile-name">Full name</Label>
                  <Input
                    id="profile-name"
                    autoComplete="name"
                    placeholder="Mira Srinivasan"
                    {...form.register("name")}
                  />
                  {formState.errors.name && (
                    <p className="text-[10.5px] text-destructive" role="alert">
                      {formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@university.edu"
                    {...form.register("email")}
                  />
                  {formState.errors.email && (
                    <p className="text-[10.5px] text-destructive" role="alert">
                      {formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-title">Role or title</Label>
                  <Input
                    id="profile-title"
                    autoComplete="organization-title"
                    placeholder="PhD Candidate & Research Lead"
                    {...form.register("title")}
                  />
                  {formState.errors.title && (
                    <p className="text-[10.5px] text-destructive" role="alert">
                      {formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-orcid">
                    ORCID <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="profile-orcid"
                    className="font-mono text-[12px]"
                    placeholder="0000-0000-0000-0000"
                    inputMode="numeric"
                    {...form.register("orcid")}
                  />
                  {formState.errors.orcid && (
                    <p className="text-[10.5px] text-destructive" role="alert">
                      {formState.errors.orcid.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="profile-affiliation">Affiliation</Label>
                  <Input
                    id="profile-affiliation"
                    autoComplete="organization"
                    placeholder="University · Department"
                    {...form.register("affiliation")}
                  />
                  {formState.errors.affiliation && (
                    <p className="text-[10.5px] text-destructive" role="alert">
                      {formState.errors.affiliation.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="profile-interests">Research interests</Label>
                  <Input
                    id="profile-interests"
                    placeholder="Scholarly communication, Digital libraries"
                    {...form.register("interests")}
                  />
                  <p className="text-[10.5px] text-muted-foreground">
                    Separate interests with commas. These feed discovery suggestions in the demo.
                  </p>
                  {formState.errors.interests && (
                    <p className="text-[10.5px] text-destructive" role="alert">
                      {formState.errors.interests.message}
                    </p>
                  )}
                </div>
              </form>
            </SectionCard>

            <div className="space-y-4">
              <section className="rounded border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/12 font-display text-sm font-semibold text-primary">
                    {profile.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-[15px] font-semibold leading-tight">
                      {profile.name}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      {profile.title}
                    </p>
                  </div>
                </div>
                <Separator className="my-3.5" />
                <dl className="space-y-2.5 text-[11px]">
                  <div>
                    <dt className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground">
                      Affiliation
                    </dt>
                    <dd className="mt-0.5 leading-snug text-foreground/85">
                      {profile.affiliation}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground">
                      Email
                    </dt>
                    <dd className="mt-0.5 break-all font-mono text-[10.5px] text-foreground/85">
                      {profile.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground">
                      ORCID
                    </dt>
                    <dd className="mt-0.5 font-mono text-[10.5px] text-foreground/85">
                      {profile.orcid ?? "Not provided"}
                    </dd>
                  </div>
                </dl>
                <Separator className="my-3.5" />
                <div className="flex flex-wrap gap-1">
                  {profile.researchInterests.length > 0 ? (
                    profile.researchInterests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="font-normal">
                        {interest}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[10.5px] text-muted-foreground">
                      No interests listed yet.
                    </span>
                  )}
                </div>
              </section>

              <section className="rounded border border-dashed border-border bg-surface/30 p-4">
                <h2 className="section-title flex items-center gap-1.5 text-[13px]">
                  <BookOpen className="size-3.5 text-muted-foreground" /> Workspace footprint
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { label: "Saved papers", value: data.library.length },
                    { label: "Notes", value: data.notes.length },
                    { label: "Projects", value: data.projects.length },
                    { label: "Open tasks", value: data.tasks.filter((t) => t.status !== "completed").length },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded border border-border/70 bg-card px-2.5 py-2"
                    >
                      <p className="font-display text-lg font-semibold leading-none">
                        {item.value}
                      </p>
                      <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </TabsContent>

        {/* Appearance ------------------------------------------------------- */}
        <TabsContent value="appearance" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">
            <div className="space-y-4">
              <SectionCard
                eyebrow="02 · Appearance"
                title="Theme"
                description="A warm paper palette by default. Dark mode keeps the same quiet, low-contrast character."
                footer={savedAuto("Theme saved to this browser")}
              >
                <div className="grid gap-3 px-4 py-4 sm:grid-cols-2">
                  {(["light", "dark"] as const).map((option) => {
                    const colors = themePreview(option);
                    const active = activeTheme === option;
                    const Icon = option === "light" ? Sun : Moon;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setTheme(option);
                          toast(`Switched to ${option} theme`, {
                            description: "Applied immediately and remembered on this device.",
                          });
                        }}
                        aria-pressed={active}
                        className={cn(
                          "group overflow-hidden rounded border p-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "border-primary ring-1 ring-primary/20"
                            : "border-border hover:border-foreground/25"
                        )}
                      >
                        <div
                          className="flex h-24 overflow-hidden rounded-[3px] border"
                          style={{
                            backgroundColor: colors.shell,
                            borderColor: colors.edge,
                          }}
                          aria-hidden
                        >
                          <div
                            className="hidden w-16 flex-col gap-1.5 border-r p-2 sm:flex"
                            style={{
                              borderColor: colors.edge,
                              backgroundColor: option === "light" ? "#F1EFE9" : "#101312",
                            }}
                          >
                            <div
                              className="h-1.5 w-7 rounded-full"
                              style={{ backgroundColor: colors.ink, opacity: 0.75 }}
                            />
                            <div
                              className="h-1 w-9 rounded-full"
                              style={{ backgroundColor: colors.edge }}
                            />
                            <div
                              className="h-1 w-8 rounded-full"
                              style={{ backgroundColor: colors.edge }}
                            />
                            <div
                              className="h-1 w-9 rounded-full"
                              style={{ backgroundColor: colors.edge }}
                            />
                          </div>
                          <div className="flex flex-1 flex-col gap-1.5 p-2.5">
                            <div className="flex items-center justify-between">
                              <div
                                className="h-1.5 w-14 rounded-full"
                                style={{ backgroundColor: colors.ink }}
                              />
                              <div
                                className="size-2 rounded-full"
                                style={{ backgroundColor: colors.edge }}
                              />
                            </div>
                            <div
                              className="h-5 w-full rounded-[2px] border"
                              style={{
                                backgroundColor: colors.panel,
                                borderColor: colors.edge,
                              }}
                            />
                            <div className="grid grid-cols-2 gap-1.5">
                              <div
                                className="h-6 rounded-[2px] border"
                                style={{
                                  backgroundColor: colors.panel,
                                  borderColor: colors.edge,
                                }}
                              />
                              <div
                                className="h-6 rounded-[2px] border"
                                style={{
                                  backgroundColor: colors.soft,
                                  borderColor: colors.edge,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-1 pb-0.5 pt-2">
                          <span className="flex items-center gap-1.5 text-[12px] font-medium capitalize">
                            <Icon className="size-3.5 text-muted-foreground" />
                            {option}
                          </span>
                          <span
                            className={cn(
                              "flex size-4 items-center justify-center rounded-full border",
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-transparent"
                            )}
                          >
                            <Check className="size-2.5" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard
                eyebrow="Reading comfort"
                title="Interface behaviour"
                description="Small adjustments that apply across the workspace."
                footer={savedAuto("Preferences applied")}
              >
                <div className="divide-y divide-border">
                  <SettingRow
                    icon={LayoutGrid}
                    title="Compact tables"
                    description="Reduce row padding in the library, discover results, and task tables so more records fit on screen."
                  >
                    <Switch
                      id="compact-tables"
                      checked={settings.compactTables}
                      onCheckedChange={(checked) => {
                        updateSettings({ compactTables: checked });
                        toast(checked ? "Compact tables enabled" : "Comfortable spacing restored");
                      }}
                      aria-label="Compact tables"
                    />
                  </SettingRow>
                  <SettingRow
                    icon={Settings2}
                    title="Reduced motion"
                    description="Disable page transitions and hover movement. Your system preference is always respected, even when this is off."
                  >
                    <Switch
                      id="reduced-motion"
                      checked={settings.reducedMotion}
                      onCheckedChange={(checked) => {
                        updateSettings({ reducedMotion: checked });
                        toast(checked ? "Motion reduced" : "Motion restored");
                      }}
                      aria-label="Reduce motion"
                    />
                  </SettingRow>
                </div>
              </SectionCard>
            </div>

            <aside className="space-y-4">
              <section className="overflow-hidden rounded border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    Type specimen
                  </p>
                </div>
                <div className="space-y-4 px-4 py-4">
                  <div>
                    <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground">
                      Manrope · Display
                    </p>
                    <p className="mt-1 font-display text-2xl font-semibold leading-tight tracking-[-0.03em]">
                      Research, composed.
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground">
                      Newsreader · Editorial
                    </p>
                    <p className="mt-1 font-serif text-[17px] leading-snug">
                      A quiet place for careful reading and slow thinking.
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground">
                      Inter · Interface
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-foreground/80">
                      Metadata, navigation, and controls set at a calm reading size.
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground">
                      IBM Plex Mono · Metadata
                    </p>
                    <p className="mt-1 font-mono text-[11px] tracking-wide text-foreground/80">
                      10.5555/fol.2026.0142
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded border border-dashed border-border bg-surface/30 p-4">
                <h2 className="section-title flex items-center gap-1.5 text-[13px]">
                  <Sun className="size-3.5 text-muted-foreground" /> Theme note
                </h2>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  Folio opens in light mode by design. Dark mode is tuned for evening reading and
                  persists per browser; it is not stored in the demo workspace data.
                </p>
              </section>
            </aside>
          </div>
        </TabsContent>

        {/* Notifications ---------------------------------------------------- */}
        <TabsContent value="notifications" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">
            <SectionCard
              eyebrow="03 · Notifications"
              title="What reaches you"
              description="These preferences only affect the simulated notification feed in this demonstration."
              footer={
                <>
                  {savedAuto("Saved automatically")}
                  <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground/70">
                    No email is ever sent
                  </span>
                </>
              }
            >
              <div className="divide-y divide-border">
                <SettingRow
                  icon={Mail}
                  title="Email notifications"
                  description="Send a digest of invitations, assignments, and mentions to your academic address."
                >
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => {
                      updateSettings({ emailNotifications: checked });
                      toast(checked ? "Email notifications on" : "Email notifications off");
                    }}
                    aria-label="Email notifications"
                  />
                </SettingRow>
                <SettingRow
                  icon={Bell}
                  title="Project updates"
                  description="New members, task movement, and project edits from collaborators."
                >
                  <Switch
                    checked={settings.projectUpdates}
                    onCheckedChange={(checked) => {
                      updateSettings({ projectUpdates: checked });
                      toast(checked ? "Project updates on" : "Project updates off");
                    }}
                    disabled={!settings.emailNotifications}
                    aria-label="Project updates"
                  />
                </SettingRow>
                <SettingRow
                  icon={Bell}
                  title="Deadline reminders"
                  description="A reminder 72 hours and 24 hours before a task or milestone is due."
                >
                  <Switch
                    checked={settings.deadlineReminders}
                    onCheckedChange={(checked) => {
                      updateSettings({ deadlineReminders: checked });
                      toast(checked ? "Deadline reminders on" : "Deadline reminders off");
                    }}
                    disabled={!settings.emailNotifications}
                    aria-label="Deadline reminders"
                  />
                </SettingRow>
                <SettingRow
                  icon={Mail}
                  title="Weekly digest"
                  description="A Monday summary of reading progress, upcoming work, and new papers in your fields."
                >
                  <Switch
                    checked={settings.weeklyDigest}
                    onCheckedChange={(checked) => {
                      updateSettings({ weeklyDigest: checked });
                      toast(checked ? "Weekly digest on" : "Weekly digest off");
                    }}
                    disabled={!settings.emailNotifications}
                    aria-label="Weekly digest"
                  />
                </SettingRow>
              </div>
            </SectionCard>

            <aside className="space-y-4">
              <section className="rounded border border-border bg-card p-4">
                <h2 className="section-title flex items-center gap-1.5 text-[13px]">
                  <Bell className="size-3.5 text-muted-foreground" /> In-app feed
                </h2>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  In-app notifications always remain available. Manage individual items from the
                  feed.
                </p>
                <div className="mt-3 flex items-center justify-between rounded border border-border/70 bg-surface/50 px-3 py-2">
                  <span className="text-[11px] text-foreground/80">Unread now</span>
                  <Badge variant="default" className="h-5 font-mono text-[10px]">
                    {data.notifications.filter((item) => !item.read).length}
                  </Badge>
                </div>
                <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                  <Link href="/notifications">Open notifications</Link>
                </Button>
              </section>

              <section className="rounded border border-dashed border-border bg-surface/30 p-4">
                <p className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground">
                  Demonstration note
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  Turning email notifications off disables the dependent reminder switches. No
                  messages leave this browser at any point.
                </p>
              </section>
            </aside>
          </div>
        </TabsContent>

        {/* Citations -------------------------------------------------------- */}
        <TabsContent value="citations" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <SectionCard
              eyebrow="04 · Citations"
              title="Default citation style"
              description="Used by the citation generator and bibliography exports unless overridden there."
              footer={savedAuto("Default applied across the workspace")}
            >
              <div className="grid gap-2 px-4 py-4 sm:grid-cols-2">
                {(Object.keys(citationStyleLabels) as CitationStyle[]).map((style) => {
                  const active = settings.citationStyle === style;
                  return (
                    <button
                      key={style}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        updateSettings({ citationStyle: style });
                        toast.success(`${citationStyleShort[style]} set as default`, {
                          description: "The citation generator will open with this style.",
                        });
                      }}
                      className={cn(
                        "rounded border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "border-primary bg-primary/[0.045] ring-1 ring-primary/15"
                          : "border-border hover:border-foreground/25 hover:bg-secondary/30"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-[13px] font-semibold">
                          {citationStyleShort[style]}
                        </span>
                        <span
                          className={cn(
                            "flex size-4 items-center justify-center rounded-full border",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-transparent"
                          )}
                        >
                          <Check className="size-2.5" />
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground">
                        {citationStyleLabels[style]}
                      </p>
                      <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted-foreground">
                        {styleNotes[style]}
                      </p>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            <aside className="space-y-4">
              <section className="overflow-hidden rounded border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    Preview · {citationStyleShort[settings.citationStyle]}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground"
                    aria-label="Copy preview citation"
                    onClick={async () => {
                      try {
                        await copyToClipboard(defaultCitation);
                        toast.success("Citation copied");
                      } catch {
                        toast.error("Clipboard unavailable in this browser");
                      }
                    }}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
                <div className="px-4 py-4">
                  <p className="font-serif text-[13px] leading-relaxed text-foreground/90">
                    {defaultCitation || "Add a paper to preview a citation."}
                  </p>
                  {defaultPaper && (
                    <>
                      <Separator className="my-3" />
                      <p className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground">
                        {defaultPaper.venueShort} · {defaultPaper.year} · DOI{" "}
                        {defaultPaper.doi}
                      </p>
                    </>
                  )}
                </div>
              </section>

              <section className="rounded border border-dashed border-border bg-surface/30 p-4">
                <h2 className="section-title flex items-center gap-1.5 text-[13px]">
                  <FileJson className="size-3.5 text-muted-foreground" /> Citation data
                </h2>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  Styles are formatted locally from mock metadata. Missing fields are flagged in
                  the citation generator rather than invented.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                  <Link href="/citations">Open citation generator</Link>
                </Button>
              </section>
            </aside>
          </div>
        </TabsContent>

        {/* Data ------------------------------------------------------------- */}
        <TabsContent value="data" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">
            <div className="space-y-4">
              <SectionCard
                eyebrow="05 · Data"
                title="Demo workspace"
                description="Folio is a frontend demonstration. Every paper, person, and project in this workspace is fictional seed data."
              >
                <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
                  {counts.map((item) => (
                    <div key={item.label} className="bg-card px-3 py-3">
                      <p className="font-display text-xl font-semibold leading-none">
                        {item.value}
                      </p>
                      <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
                  <Button variant="outline" size="sm" onClick={exportJson}>
                    <Download /> Export JSON
                  </Button>
                  <span className="text-[10.5px] text-muted-foreground">
                    Download a snapshot of the current browser state.
                  </span>
                </div>
              </SectionCard>

              <section className="rounded border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <RotateCcw className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-[14px] font-semibold">Reset demo data</h2>
                    <p className="mt-1 max-w-lg text-[11px] leading-relaxed text-muted-foreground">
                      Restore the original seed papers, collections, notes, projects, tasks,
                      milestones, reviews, and notifications. Your profile and interface
                      preferences are reset too. This cannot be undone.
                    </p>
                    <div className="mt-3">
                      <ConfirmationDialog
                        trigger={
                          <Button variant="destructive" size="sm">
                            <RotateCcw /> Reset workspace
                          </Button>
                        }
                        title="Reset all demo data?"
                        description="Every change you have made in this browser — saved papers, collections, notes, tasks, and profile edits — will be replaced with the original seed data."
                        confirmLabel="Reset everything"
                        destructive
                        onConfirm={() => {
                          resetWorkspace();
                          toast.success("Demo workspace restored", {
                            description: "All seed records and default settings are back.",
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <section className="rounded border border-border bg-card p-4">
                <h2 className="section-title flex items-center gap-1.5 text-[13px]">
                  <Database className="size-3.5 text-muted-foreground" /> Storage
                </h2>
                <dl className="mt-2.5 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">Persistence</dt>
                    <dd className="font-mono text-[10px] text-foreground/80">localStorage</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">Key</dt>
                    <dd className="font-mono text-[10px] text-foreground/80">folio-workspace-v1</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">Backend</dt>
                    <dd className="font-mono text-[10px] text-warning">none · demo</dd>
                  </div>
                </dl>
                <p className="mt-3 border-t border-border/70 pt-2.5 text-[10.5px] leading-relaxed text-muted-foreground">
                  Clearing site data in your browser has the same effect as resetting from here.
                </p>
              </section>

              <section className="rounded border border-dashed border-border bg-surface/30 p-4">
                <p className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground">
                  Replaceable by design
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  Writes pass through async service functions in{" "}
                  <span className="font-mono text-[10px]">mock-services.ts</span>, so a real API can
                  replace them without changing the screens.
                </p>
              </section>
            </aside>
          </div>
        </TabsContent>
      </Tabs>

      <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground/60">
        Folio frontend demonstration · settings persist in this browser only
      </p>
    </div>
  );
}
