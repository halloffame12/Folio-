"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Clipboard,
  FlaskConical,
  Info,
  SearchX,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { toast } from "sonner";
import type { ResearchTopic } from "@/types";
import { papersById, researchTopics } from "@/lib/client-registry";
import { copyToClipboard, cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const opportunityConfig: Record<
  ResearchTopic["opportunity"],
  { label: string; badge: "success" | "accent" | "warning"; tone: string; description: string }
> = {
  established: {
    label: "Established",
    badge: "success",
    tone: "text-success",
    description: "Dense, sustained output. Novelty claims need sharper positioning.",
  },
  emerging: {
    label: "Emerging",
    badge: "accent",
    tone: "text-accent",
    description: "Growing output and active vocabulary. Competitive but still forming.",
  },
  underrepresented: {
    label: "Potential opportunity",
    badge: "warning",
    tone: "text-warning",
    description: "Low recent output. Could be neglect — or a barrier. Verify before claiming a gap.",
  },
};

const years = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"];
const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 4,
  fontSize: 11,
  color: "hsl(var(--foreground))",
  boxShadow: "0 8px 24px hsl(var(--foreground) / 0.08)",
};
const axisTick = { fontSize: 9, fill: "hsl(var(--muted-foreground))" } as const;

export default function ResearchGapsPage() {
  const [query, setQuery] = useState("");
  const [cluster, setCluster] = useState("all");
  const [opportunity, setOpportunity] = useState<ResearchTopic["opportunity"] | "all">("all");
  const [selectedId, setSelectedId] = useState(researchTopics[0]?.id ?? "");
  const [compareA, setCompareA] = useState("rt1");
  const [compareB, setCompareB] = useState("rt6");

  const clusters = useMemo(
    () => Array.from(new Set(researchTopics.map((topic) => topic.cluster))).sort(),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return researchTopics.filter((topic) => {
      if (cluster !== "all" && topic.cluster !== cluster) return false;
      if (opportunity !== "all" && topic.opportunity !== opportunity) return false;
      if (!q) return true;
      return `${topic.name} ${topic.cluster} ${topic.keywords.join(" ")} ${topic.description}`
        .toLowerCase()
        .includes(q);
    });
  }, [query, cluster, opportunity]);

  const selected =
    researchTopics.find((topic) => topic.id === selectedId) ?? filtered[0] ?? researchTopics[0];

  const chartData = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => b.paperCount - a.paperCount)
        .map((topic) => ({
          name: topic.name,
          papers: topic.paperCount,
          recent: topic.recentCount,
          momentum: topic.momentum,
          id: topic.id,
        })),
    [filtered]
  );

  const scatterData = useMemo(
    () =>
      filtered.map((topic) => ({
        x: topic.momentum,
        y: topic.paperCount,
        z: topic.recentCount,
        name: topic.name,
        id: topic.id,
      })),
    [filtered]
  );

  const trendData = useMemo(
    () =>
      (selected.trend ?? []).map((count: number, index: number) => ({
        year: years[index] ?? String(2020 + index),
        count,
      })),
    [selected]
  );

  if (!selected) {
    return (
      <div>
        <PageHeader eyebrow="Research intelligence" title="Research gap explorer" description="Analyze your library to find potential research opportunities." />
        <EmptyState icon={FlaskConical} title="No research topics yet" description="Save papers to your library, then run an analysis to explore gaps." />
      </div>
    );
  }
  const evidence = selected.paperIds.map((id: string) => papersById[id]).filter(Boolean);
  const topicA = researchTopics.find((topic: any) => topic.id === compareA) ?? researchTopics[0];
  const topicB = researchTopics.find((topic: any) => topic.id === compareB) ?? researchTopics[1];
  const momentumDelta = topicA.momentum - topicB.momentum;

  const totalPapers = researchTopics.reduce((acc: number, topic: any) => acc + topic.paperCount, 0);
  const opportunities = researchTopics.filter((topic) => topic.opportunity === "underrepresented").length;

  const copyAnalysis = async () => {
    const text = [
      `Research gap explorer — demonstration analysis (${new Date().toLocaleDateString()})`,
      "",
      `Selected topic: ${selected.name}`,
      `Cluster: ${selected.cluster}`,
      `Papers in demo index: ${selected.paperCount} (${selected.recentCount} recent)`,
      `Momentum: ${selected.momentum > 0 ? "+" : ""}${selected.momentum}%`,
      `Signal: ${(opportunityConfig as any)[selected.opportunity as any].label}`,
      "",
      selected.description,
      "",
      `Keywords: ${selected.keywords.join(", ")}`,
      "",
      "Evidence (demo index):",
      ...evidence.map((paper: any) => `- ${paper.authors[0]?.name ?? "Unknown"} (${paper.year}). ${paper.title}. ${paper.venueShort}.`),
      "",
      "Caveat: low publication counts are descriptive, not explanatory. A gap claim needs contextual evidence beyond a bibliometric index.",
    ].join("\n");
    try {
      await copyToClipboard(text);
      toast.success("Analysis copied", { description: "Includes the interpretation caveat." });
    } catch {
      toast.error("Clipboard unavailable");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Research intelligence"
        title="Research gap explorer"
        description="A demonstration map of topic density, momentum, and vocabulary. Signals are prompts for enquiry — not confirmed gaps."
        actions={
          <>
            <Badge variant="warning" className="h-7 px-2.5">
              <FlaskConical className="size-3" /> Demo analysis
            </Badge>
            <Button size="sm" variant="outline" onClick={() => void copyAnalysis()}>
              <Clipboard /> Copy analysis
            </Button>
          </>
        }
      />

      <div className="mb-4 flex items-start gap-2.5 rounded border border-dashed border-warning/35 bg-warning/[0.05] px-4 py-3">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
        <div className="text-[11px] leading-relaxed text-muted-foreground">
          <p>
            <strong className="font-medium text-foreground/85">Illustrative analysis, not a live bibliometric system.</strong>{" "}
            Topic clusters, annual output, and keyword relationships are synthetic and generated for this frontend
            demonstration. No external database is queried.
          </p>
          <p className="mt-1">
            An absence of publications is not proof of a research gap. Treat every “potential opportunity” as a
            question about method, funding, ethics, or neglect — never as an automated finding.
          </p>
        </div>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-4">
        <Metric label="Topics mapped" value={researchTopics.length} hint="Demo index" />
        <Metric label="Indexed papers" value={totalPapers} hint="Synthetic counts" />
        <Metric label="Potential opportunities" value={opportunities} hint="Needs verification" tone="text-warning" />
        <Metric
          label="Highest momentum"
          value={Math.max(...researchTopics.map((topic) => topic.momentum))}
          hint={researchTopics.find((t) => t.momentum === Math.max(...researchTopics.map((x) => x.momentum)))?.name}
          tone="text-accent"
          suffix="%"
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
          placeholder="Search topics or keywords…"
          aria-label="Search research topics"
          wrapperClassName="w-full sm:w-[240px]"
        />
        <Select value={cluster} onValueChange={setCluster}>
          <SelectTrigger className="w-[200px]" aria-label="Filter by cluster">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clusters</SelectItem>
            {clusters.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={opportunity}
          onValueChange={(value) => setOpportunity(value as ResearchTopic["opportunity"] | "all")}
        >
          <SelectTrigger className="w-[190px]" aria-label="Filter by signal">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All signals</SelectItem>
            <SelectItem value="established">Established</SelectItem>
            <SelectItem value="emerging">Emerging</SelectItem>
            <SelectItem value="underrepresented">Potential opportunity</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
          {filtered.length} of {researchTopics.length} topics
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No topics match this view"
          description="The demonstration index holds eight topic clusters. Clear a filter to see them again."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setCluster("all");
                setOpportunity("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-4 grid gap-3 lg:grid-cols-2">
            <section className="rounded border border-border bg-card p-4">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h2 className="section-title flex items-center gap-1.5">
                    <BarChart3 className="size-3.5 text-muted-foreground" /> Output by topic
                  </h2>
                  <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                    Total papers in the demo index, with recent output (last 24 months) overlaid.
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-[8px] uppercase text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="size-1.5 bg-primary" /> total</span>
                  <span className="flex items-center gap-1"><span className="size-1.5 bg-accent" /> recent</span>
                </div>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 2, right: 12, bottom: 0, left: 4 }}
                    barGap={2}
                  >
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={axisTick}
                      stroke="hsl(var(--border))"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 8.5, fill: "hsl(var(--muted-foreground))" }}
                      stroke="hsl(var(--border))"
                      tickLine={false}
                      axisLine={false}
                      width={176}
                      interval={0}
                    />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--secondary))" }} />
                    <Bar dataKey="papers" name="Total papers" fill="hsl(var(--primary))" radius={[0, 2, 2, 0]} maxBarSize={9} />
                    <Bar dataKey="recent" name="Recent output" fill="hsl(var(--accent))" radius={[0, 2, 2, 0]} maxBarSize={9} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded border border-border bg-card p-4">
              <div className="mb-3">
                <h2 className="section-title flex items-center gap-1.5">
                  <TrendingUp className="size-3.5 text-muted-foreground" /> Momentum vs. density
                </h2>
                <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                  Bubble size shows recent output. Upper-right topics are dense and accelerating.
                </p>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Momentum"
                      unit="%"
                      tick={axisTick}
                      stroke="hsl(var(--border))"
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Papers"
                      tick={axisTick}
                      stroke="hsl(var(--border))"
                    />
                    <ZAxis type="number" dataKey="z" range={[60, 260]} name="Recent output" />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ strokeDasharray: "3 3", stroke: "hsl(var(--border))" }}
                      formatter={(value: number | string, name: string) => [value, name]}
                    />
                    <Scatter
                      name="Topics"
                      data={scatterData}
                      fill="hsl(var(--accent))"
                      fillOpacity={0.55}
                      stroke="hsl(var(--accent))"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_330px]">
            <section className="rounded border border-border bg-card">
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={(opportunityConfig as any)[selected.opportunity as any].badge}>
                      {(opportunityConfig as any)[selected.opportunity as any].label}
                    </Badge>
                    <span className="font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted-foreground">
                      {selected.cluster}
                    </span>
                  </div>
                  <h2 className="mt-1.5 font-display text-[18px] font-semibold">{selected.name}</h2>
                  <p className="mt-1 max-w-xl text-[11.5px] leading-relaxed text-muted-foreground">
                    {selected.description}
                  </p>
                </div>
                <div className="grid shrink-0 grid-cols-3 gap-2 text-center">
                  <MiniStat label="Papers" value={selected.paperCount} />
                  <MiniStat label="Recent" value={selected.recentCount} />
                  <MiniStat
                    label="Momentum"
                    value={`${selected.momentum > 0 ? "+" : ""}${selected.momentum}%`}
                    tone={selected.momentum >= 0 ? "text-success" : "text-destructive"}
                  />
                </div>
              </header>

              <div className="grid gap-4 p-4 sm:grid-cols-2">
                <div>
                  <h3 className="meta-label">Annual output · demo index</h3>
                  <div className="mt-2 h-[170px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -22 }}>
                        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
                        <XAxis dataKey="year" tick={axisTick} stroke="hsl(var(--border))" />
                        <YAxis tick={axisTick} stroke="hsl(var(--border))" />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line
                          type="monotone"
                          dataKey="count"
                          name="Papers"
                          stroke="hsl(var(--primary))"
                          strokeWidth={1.8}
                          dot={{ r: 2.5, fill: "hsl(var(--card))", strokeWidth: 1.5 }}
                          activeDot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="meta-label">Keyword relationships</h3>
                  <div className="mt-1 rounded border border-border/60 bg-surface/25">
                    <KeywordGraph keywords={selected.keywords} onSelect={setQuery} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selected.keywords.map((keyword: any) => (
                      <button
                        key={keyword}
                        onClick={() => setQuery(keyword)}
                        className="rounded-full border border-border bg-card px-1.5 py-0.5 font-mono text-[8px] uppercase text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-border bg-surface/25 px-4 py-2.5 text-[10.5px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground/75">Interpretation note: </span>
                {(opportunityConfig as any)[selected.opportunity as any].description}
              </div>
            </section>

            <aside className="space-y-3">
              <section className="rounded border border-border bg-card">
                <header className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
                  <h2 className="section-title">Evidence base</h2>
                  <Badge variant="outline">{evidence.length} papers</Badge>
                </header>
                {evidence.length === 0 ? (
                  <p className="px-3.5 py-6 text-[11px] text-muted-foreground">
                    No representative papers are attached to this demo topic.
                  </p>
                ) : (
                  <ul className="divide-y divide-border/60">
                    {evidence.map((paper: any) => (
                      <li key={paper.id}>
                        <Link
                          href={`/discover/${paper.id}`}
                          className="group block px-3.5 py-2.5 transition-colors hover:bg-secondary/25"
                        >
                          <p className="font-serif text-[11.5px] font-medium leading-snug group-hover:text-primary">
                            {paper.title}
                          </p>
                          <p className="mt-1 font-mono text-[8px] uppercase tracking-wide text-muted-foreground">
                            {paper.authors[0]?.name} · {paper.year} · {paper.venueShort}
                          </p>
                          <p className="mt-1 flex items-center gap-2 font-mono text-[8px] text-muted-foreground/80">
                            <span>{paper.citationCount} citations</span>
                            <span className="text-border">/</span>
                            <span>demo record</span>
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded border border-border bg-card p-3.5">
                <h2 className="section-title flex items-center gap-1.5">
                  <Info className="size-3.5 text-muted-foreground" /> Reading the signal
                </h2>
                <ul className="mt-2 space-y-2 text-[10.5px] leading-relaxed text-muted-foreground">
                  <li className="flex gap-1.5">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-success" aria-hidden />
                    <span><span className="font-medium text-foreground/75">Established</span> literatures need positioning, not gap claims.</span>
                  </li>
                  <li className="flex gap-1.5">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                    <span><span className="font-medium text-foreground/75">Emerging</span> topics may reward speed, but vocabulary is still unstable.</span>
                  </li>
                  <li className="flex gap-1.5">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-warning" aria-hidden />
                    <span><span className="font-medium text-foreground/75">Potential opportunity</span> is a hypothesis about absence, not evidence of it.</span>
                  </li>
                </ul>
                <Link
                  href="/discover/p4"
                  className="mt-3 flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                >
                  Read Nwosu &amp; Banerjee on research silences <ArrowUpRight className="size-3" />
                </Link>
              </section>
            </aside>
          </div>

          <section className="mt-4 rounded border border-border bg-card">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
              <div>
                <h2 className="section-title">Compare topics</h2>
                <p className="text-[10.5px] text-muted-foreground">
                  Side-by-side signals, with the same caution: descriptive, not diagnostic.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Select value={topicA.id} onValueChange={setCompareA}>
                  <SelectTrigger className="h-7 w-[160px] text-[10.5px]" aria-label="First comparison topic">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {researchTopics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[10px] text-muted-foreground">vs</span>
                <Select value={topicB.id} onValueChange={setCompareB}>
                  <SelectTrigger className="h-7 w-[160px] text-[10.5px]" aria-label="Second comparison topic">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {researchTopics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </header>
            <div className="grid divide-y divide-border/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="p-4">
                <Badge variant={(opportunityConfig as any)[topicA.opportunity].badge}>
                  {(opportunityConfig as any)[topicA.opportunity].label}
                </Badge>
                <h3 className="mt-1.5 font-display text-[14px] font-semibold">{topicA.name}</h3>
                <p className="font-mono text-[8.5px] uppercase text-muted-foreground">{topicA.cluster}</p>
                <div className="mt-3 space-y-2">
                  <CompareRow label="Papers" value={topicA.paperCount} max={Math.max(topicA.paperCount, topicB.paperCount)} />
                  <CompareRow label="Recent output" value={topicA.recentCount} max={Math.max(topicA.recentCount, topicB.recentCount)} />
                  <CompareRow
                    label="Momentum"
                    value={topicA.momentum}
                    max={Math.max(Math.abs(topicA.momentum), Math.abs(topicB.momentum), 1)}
                    display={`${topicA.momentum > 0 ? "+" : ""}${topicA.momentum}%`}
                    tone={topicA.momentum >= 0 ? "bg-success" : "bg-destructive"}
                  />
                </div>
              </div>
              <div className="p-4">
                <Badge variant={(opportunityConfig as any)[topicB.opportunity].badge}>
                  {(opportunityConfig as any)[topicB.opportunity].label}
                </Badge>
                <h3 className="mt-1.5 font-display text-[14px] font-semibold">{topicB.name}</h3>
                <p className="font-mono text-[8.5px] uppercase text-muted-foreground">{topicB.cluster}</p>
                <div className="mt-3 space-y-2">
                  <CompareRow label="Papers" value={topicB.paperCount} max={Math.max(topicA.paperCount, topicB.paperCount)} />
                  <CompareRow label="Recent output" value={topicB.recentCount} max={Math.max(topicA.recentCount, topicB.recentCount)} />
                  <CompareRow
                    label="Momentum"
                    value={topicB.momentum}
                    max={Math.max(Math.abs(topicA.momentum), Math.abs(topicB.momentum), 1)}
                    display={`${topicB.momentum > 0 ? "+" : ""}${topicB.momentum}%`}
                    tone={topicB.momentum >= 0 ? "bg-success" : "bg-destructive"}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-border bg-surface/30 px-4 py-2.5">
              {momentumDelta >= 0 ? (
                <TrendingUp className="size-3.5 text-accent" />
              ) : (
                <TrendingDown className="size-3.5 text-accent" />
              )}
              <p className="text-[10.5px] text-muted-foreground">
                {topicA.name} has {Math.abs(momentumDelta)} percentage points{" "}
                {momentumDelta >= 0 ? "more" : "less"} momentum than {topicB.name}. Momentum compares recent output
                against the prior period in the demo index.
              </p>
            </div>
          </section>

          <section className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">All mapped topics</h2>
              <span className="font-mono text-[8.5px] uppercase text-muted-foreground/60">Select to inspect</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {filtered.map((topic) => {
                const config = (opportunityConfig as any)[topic.opportunity];
                const active = topic.id === selected.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedId(topic.id)}
                    aria-pressed={active}
                    className={cn(
                      "rounded border bg-card p-3 text-left transition-colors",
                      active ? "border-primary/40 ring-1 ring-primary/10" : "border-border hover:border-foreground/20"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={cn("font-mono text-[8px] uppercase tracking-wide", config.tone)}>
                        {config.label}
                      </span>
                      <span className="font-mono text-[8px] text-muted-foreground">
                        {topic.momentum > 0 ? "+" : ""}
                        {topic.momentum}%
                      </span>
                    </div>
                    <h3 className="mt-1 line-clamp-2 text-[11.5px] font-medium leading-snug">{topic.name}</h3>
                    <div className="mt-1.5 flex items-center gap-2 font-mono text-[8px] text-muted-foreground">
                      <span>{topic.paperCount} papers</span>
                      <span className="text-border">/</span>
                      <span>{topic.recentCount} recent</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground/60">
        <span>Demonstration analysis · synthetic bibliometric index</span>
        <span className="flex items-center gap-1">
          <BookOpen className="size-2.5" /> Not a substitute for a systematic search
        </span>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  tone,
  suffix = "",
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: string;
  suffix?: string;
}) {
  return (
    <div className="rounded border border-border bg-card px-3 py-2.5">
      <p className="meta-label">{label}</p>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <span className={cn("font-display text-[20px] font-semibold leading-none tabular-nums", tone)}>
          {value}
          {suffix}
        </span>
        {hint && <span className="truncate font-mono text-[8.5px] text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
  return (
    <div className="rounded border border-border/70 bg-surface/40 px-2 py-1.5">
      <p className="font-mono text-[7.5px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 font-display text-[13px] font-semibold leading-none tabular-nums", tone)}>{value}</p>
    </div>
  );
}

function CompareRow({
  label,
  value,
  max,
  display,
  tone = "bg-primary",
}: {
  label: string;
  value: number;
  max: number;
  display?: string;
  tone?: string;
}) {
  const width = Math.max(4, Math.round((Math.abs(value) / Math.max(max, 1)) * 100));
  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[8.5px] uppercase text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums text-foreground/70">{display ?? value}</span>
      </div>
      <div className="mt-0.5 h-1 w-full rounded-full bg-secondary">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function KeywordGraph({ keywords, onSelect }: { keywords: string[]; onSelect: (keyword: string) => void }) {
  const nodes = keywords.slice(0, 6);
  const cx = 110;
  const cy = 78;
  const radius = 58;
  return (
    <svg viewBox="0 0 220 160" role="img" aria-label={`Keyword relationships for ${keywords.join(", ")}`} className="h-[160px] w-full">
      {nodes.map((keyword, index) => {
        const angle = (Math.PI * 2 * index) / Math.max(nodes.length, 1) - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius * 0.82;
        return (
          <g key={keyword}>
            <line
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
            <circle
              cx={x}
              cy={y}
              r={index % 2 === 0 ? 7 : 5.5}
              fill={index % 3 === 0 ? "hsl(var(--accent) / 0.16)" : "hsl(var(--primary) / 0.12)"}
              stroke={index % 3 === 0 ? "hsl(var(--accent))" : "hsl(var(--primary))"}
              strokeWidth={1}
            />
            <text
              x={x}
              y={y + (y > cy ? 16 : -10)}
              textAnchor="middle"
              fontSize={6.5}
              fill="hsl(var(--muted-foreground))"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {keyword.length > 14 ? `${keyword.slice(0, 12)}…` : keyword}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={20} fill="hsl(var(--primary))" />
      <text
        x={cx}
        y={cy + 2.5}
        textAnchor="middle"
        fontSize={7}
        fill="hsl(var(--primary-foreground))"
        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}
      >
        TOPIC
      </text>
      <g>
        {nodes.map((keyword, index) => {
          const angle = (Math.PI * 2 * index) / Math.max(nodes.length, 1) - Math.PI / 2;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius * 0.82;
          return (
            <rect
              key={`hit-${keyword}`}
              x={x - 16}
              y={y - 12}
              width={32}
              height={32}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onSelect(keyword)}
            >
              <title>{`Filter by ${keyword}`}</title>
            </rect>
          );
        })}
      </g>
    </svg>
  );
}
