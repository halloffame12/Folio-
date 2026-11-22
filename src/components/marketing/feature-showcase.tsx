import { Check } from "lucide-react";
import { NotesVisual, ReviewVisual } from "@/components/marketing/product-visuals";
import { Reveal } from "@/components/marketing/reveal";

function Points({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-2 border-t border-border pt-4">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-[13.5px] leading-relaxed text-muted-foreground">
          <Check className="mt-0.5 size-4 shrink-0 text-foreground/40" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function FeatureShowcase() {
  return (
    <section id="features" className="scroll-mt-20 border-b border-border py-16 sm:py-20">
      <div className="marketing-container space-y-16 sm:space-y-20">
        <Reveal>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="feature-display text-foreground">
                Notes that keep their place.
              </h2>
              <p className="mt-4 text-[14.5px] leading-[1.7] text-muted-foreground">
                Write a memo while you read and link it to the paper. When the
                section needs a citation, the note is already where you left it.
              </p>
              <Points
                items={[
                  "Notes linked to one or more papers",
                  "Tags for themes, methods, and open questions",
                ]}
              />
            </div>
            <NotesVisual />
          </div>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="lg:order-2">
              <h2 className="feature-display text-foreground">
                Reviews built from evidence.
              </h2>
              <p className="mt-4 text-[14.5px] leading-[1.7] text-muted-foreground">
                Draft a literature review section by section with the linked
                papers in view. Each section keeps a record of what supports it.
              </p>
              <Points
                items={[
                  "Section outlines with linked papers",
                  "Progress across the whole review",
                ]}
              />
            </div>
            <div className="lg:order-1">
              <ReviewVisual />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
