const items = [
  {
    index: "01",
    label: "Scholarly discovery",
    detail: "Crossref & OpenAlex",
  },
  {
    index: "02",
    label: "Research library",
    detail: "Collections · tags · reading states",
  },
  {
    index: "03",
    label: "Literature reviews",
    detail: "Sections linked to evidence",
  },
  {
    index: "04",
    label: "Project coordination",
    detail: "Tasks · milestones · collaborators",
  },
];

export function CredibilityStrip() {
  return (
    <section aria-label="Workspace capabilities" className="border-b border-border">
      <div className="marketing-container">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.index}
              className="flex items-baseline gap-4 border-b border-border py-4 last:border-b-0 sm:border-b-0 sm:border-l sm:pl-6 sm:first:border-l-0 sm:first:pl-0 lg:py-5"
            >
              <span className="font-mono text-[9px] tabular-nums tracking-[0.16em] text-accent">
                {item.index}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[13.5px] font-semibold leading-snug tracking-[-0.015em]">
                  {item.label}
                </span>
                <span className="mt-1 block font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.12em] text-muted-foreground">
                  {item.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
