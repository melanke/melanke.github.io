 "use client";

import { useState, ReactNode } from "react";
import { TimelineItem } from "./TimelineItem";
import { TimelineIcon } from "./TimelineIcon";
import { ContentVersion } from "@/app/contentVersion";
import { timelineItems, TimelineEntry } from "@/content/timeline-items";
import { Tech, crossCutting } from "@/lib/technologies";

// How many items — top-level and nested combined, in final render order —
// show unconditionally before the rest fold behind "Show more". Tune this
// single number to make the page denser/lighter; it's not tied to any
// group boundary.
const VISIBLE_ITEM_COUNT = 10;

function TimelineHeader({ className }: { className?: string }) {
  return (
    <div
      className={`flex gap-1.5 justify-center items-center self-start text-xl print:text-[14pt] font-semibold leading-none print:mt-5 ${className}`}
    >
      <TimelineIcon size={17} className="print:hidden text-[#f9b800]" />
      <h2 className="self-stretch my-auto font-clash print:font-sans font-semibold">
        Work Experience
      </h2>
    </div>
  );
}

function resolveText(
  value: string | Partial<Record<ContentVersion, string>>,
  version: ContentVersion
): string {
  if (typeof value === "string") return value;
  return value[version] ?? "";
}

function resolveTechnologies(
  value: Tech[] | Partial<Record<ContentVersion, Tech[]>>,
  version: ContentVersion
): Tech[] {
  const list = Array.isArray(value) ? value : value[version] ?? [];
  // Cross-cutting competencies stay in the data (they feed `lastUsed`) but not
  // in the per-project list — see the note on `crossCutting`.
  return list.filter((t) => !crossCutting.includes(t));
}

function shouldPrint(item: TimelineEntry, version: ContentVersion): boolean {
  return item.printIn ? item.printIn.includes(version) : true;
}

function byPriorityThenDate(
  version: ContentVersion
): (a: TimelineEntry, b: TimelineEntry) => number {
  return (a, b) => {
    const diff = a.priority[version] - b.priority[version];
    if (diff !== 0) return diff;
    return b.startDate.localeCompare(a.startDate);
  };
}

/**
 * Print ordering: newest first, priority ignored.
 *
 * `priority` is a positioning device — the enterprise resume deliberately sinks
 * Enclave Wallet and COZ because they are the Web3 work. That reads fine on a
 * page the reader scrolls, but on paper it puts a 2024 project below a 2014 one,
 * and a resume that breaks reverse-chronological order reads as careless (and
 * confuses date parsing). So the two media sort differently.
 */
const byDate = (a: TimelineEntry, b: TimelineEntry) =>
  b.startDate.localeCompare(a.startDate);

export function Timeline({ version }: { version: ContentVersion }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [enlargedImageId, setEnlargedImageId] = useState<string | null>(null);

  const byId = new Map(timelineItems.map((item) => [item.id, item]));

  const eligible = timelineItems.filter((item) => item.priority[version] !== 4);
  const topLevel = eligible.filter((item) => !item.parentId);
  const childrenByParent = new Map<string, TimelineEntry[]>();
  for (const item of eligible) {
    if (!item.parentId) continue;
    const list = childrenByParent.get(item.parentId) ?? [];
    list.push(item);
    childrenByParent.set(item.parentId, list);
  }

  const compare = byPriorityThenDate(version);
  topLevel.sort(compare);
  for (const list of childrenByParent.values()) list.sort(compare);

  const renderItem = (item: TimelineEntry) => (
    <TimelineItem
      key={item.id}
      print={shouldPrint(item, version)}
      title={item.title}
      parentTitle={
        item.parentId ? byId.get(item.parentId)?.title : undefined
      }
      dateRange={item.dateRange}
      technologies={resolveTechnologies(item.technologies, version)}
      role={resolveText(item.role, version)}
      description={resolveText(item.description, version)}
      printTech={item.printTechIn ? item.printTechIn.includes(version) : true}
      image={item.image}
      link={item.link}
      links={item.links}
      imageEnlarged={enlargedImageId === item.id}
      onToggleImage={() =>
        setEnlargedImageId((prev) => (prev === item.id ? null : item.id))
      }
    />
  );

  // Groups consecutive nested items sharing the same parent into one run,
  // so they can share a single continuous "nested" bar instead of each
  // item drawing its own short segment — and so a run that straddles the
  // "Show more" cutoff still gets exactly one bar (spanning both its
  // always-visible and collapsed items) instead of two separate ones.
  const groupRuns = (items: TimelineEntry[]) => {
    const runs: { parentId?: string; items: TimelineEntry[] }[] = [];
    for (const item of items) {
      const last = runs[runs.length - 1];
      if (item.parentId && last?.parentId === item.parentId) {
        last.items.push(item);
      } else {
        runs.push({ parentId: item.parentId, items: [item] });
      }
    }
    return runs;
  };

  const collapsibleClass = `overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out print:overflow-visible ${
    isExpanded
      ? "max-h-[5000px] opacity-100"
      : "max-h-0 opacity-0 print:max-h-[5000px] print:opacity-100"
  }`;

  const showMoreButton = (
    <button
      type="button"
      onClick={() => setIsExpanded(true)}
      aria-expanded={false}
      className="print:hidden self-start mt-4 px-4 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      Show more
    </button>
  );

  const itemsList = (items: TimelineEntry[], extraClass = "") =>
    items.length > 0 && (
      <div className={`flex flex-col space-y-10 print:space-y-5 ${extraClass}`}>
        {items.map((item) => renderItem(item))}
      </div>
    );

  // Flatten into natural render order — each top-level item immediately
  // followed by its own (already-sorted) children — to get each item's
  // natural position ahead of the "Show more" cutoff.
  const naturalFlat: TimelineEntry[] = [];
  for (const employer of topLevel) {
    naturalFlat.push(employer);
    for (const child of childrenByParent.get(employer.id) ?? []) {
      naturalFlat.push(child);
    }
  }

  // A child less relevant than its own parent can only ever appear behind
  // "Show more" — never jump ahead of more relevant content just because
  // it's glued to a prominent parent. If its natural position already
  // falls past the cutoff (e.g. Simpli, which has enough higher-priority
  // children to fill the visible zone on its own), it renders there
  // normally. If its parent is prominent enough that even gluing the child
  // right after it lands inside the visible zone (e.g. 33Labs, with only a
  // couple of children), the child is dropped entirely instead — it has no
  // "Show more" of its own to fall back into.
  const flat = naturalFlat.filter((item, index) => {
    if (!item.parentId) return true;
    const parent = byId.get(item.parentId);
    if (!parent) return true;
    const outranksParent = item.priority[version] > parent.priority[version];
    return !(outranksParent && index < VISIBLE_ITEM_COUNT);
  });

  // Group once on the full sequence (not on two pre-split slices), so a run
  // that straddles the cutoff renders as a single block with one bar
  // spanning both its always-visible and locally-collapsed items — instead
  // of the always-visible part and the collapsed part getting two separate
  // bars in two separate containers.
  const runs = groupRuns(flat);
  let consumed = 0;
  let buttonPlaced = false;
  const beforeBlocks: ReactNode[] = [];
  const afterOnlyRuns: TimelineEntry[][] = [];

  runs.forEach((run, index) => {
    const start = consumed;
    consumed += run.items.length;
    const localCut = Math.max(0, Math.min(run.items.length, VISIBLE_ITEM_COUNT - start));
    const alwaysItems = run.items.slice(0, localCut);
    const collapsedItems = run.items.slice(localCut);

    if (alwaysItems.length === 0) {
      // Entirely past the cutoff: no bar needed of its own here — it joins
      // the shared collapsed area below instead of getting a standalone
      // wrapper (which would add stray margin even while collapsed).
      afterOnlyRuns.push(run.items);
      return;
    }

    const showButtonHere = collapsedItems.length > 0 && !buttonPlaced;
    if (collapsedItems.length > 0) buttonPlaced = true;

    const body = (
      <>
        {itemsList(alwaysItems)}
        {collapsedItems.length > 0 && (
          <>
            {showButtonHere && !isExpanded && showMoreButton}
            <div className={collapsibleClass}>
              {itemsList(collapsedItems, "mt-10 print:mt-5")}
            </div>
          </>
        )}
      </>
    );

    beforeBlocks.push(
      run.parentId ? (
        <div key={index} className="relative pl-5">
          <div className="absolute inset-y-0 left-0 w-1.5 rounded-full bg-neutral-200/70 dark:bg-neutral-800/70" />
          {body}
        </div>
      ) : (
        <div key={index}>{body}</div>
      )
    );
  });

  const afterOnlyItems = afterOnlyRuns.flat();

  // The print tree renders the same items through the same `renderItem`, so the
  // two can't drift on props — only the order differs. It needs none of the
  // machinery above: no "Show more" cutoff (print expands everything anyway),
  // no run grouping, no nesting bar. Employer attribution travels with the item
  // instead, as the `parentTitle` prefix.
  const printable = timelineItems.filter((item) =>
    item.printIn ? item.printIn.includes(version) : item.priority[version] !== 4
  );
  const printTopLevel = printable.filter((i) => !i.parentId).sort(byDate);
  const printChildren = (parentId: string) =>
    printable.filter((i) => i.parentId === parentId).sort(byDate);
  // A child whose employer doesn't print would otherwise vanish from the PDF.
  const printOrphans = printable.filter(
    (i) => i.parentId && !printTopLevel.some((p) => p.id === i.parentId)
  );

  return (
    <div className="flex flex-col max-xl:mt-14 xl:mt-4 print:mt-0 w-full text-black dark:text-white max-md:max-w-full">
      <TimelineHeader />

      {/* SCREEN: priority order, with the collapse + nesting bars. */}
      <div className="print:hidden">
        <div className="flex flex-col space-y-10 mt-10">{beforeBlocks}</div>
        {afterOnlyItems.length > 0 && (
          <>
            {!buttonPlaced && !isExpanded && showMoreButton}
            <div className={collapsibleClass}>
              {itemsList(afterOnlyItems, "mt-10")}
            </div>
          </>
        )}
      </div>

      {/* PRINT: chronological. print:mt-2.5 is the shared "heading -> its
          content" gap (10px), the same distance Skills and Notable
          Achievements use; headings carry print:mt-5 (20px) above. */}
      <div className="hidden print:flex print:flex-col print:space-y-4 print:mt-2.5">
        {printTopLevel.map((employer) => (
          <div key={employer.id} className="print:space-y-4 print:flex print:flex-col">
            {renderItem(employer)}
            {printChildren(employer.id).map(renderItem)}
          </div>
        ))}
        {printOrphans.map(renderItem)}
      </div>

      {/* Print only: three pages cannot hold 50+ projects, and Notable
          Achievements cites a couple that did not make this version's cut.
          Saying so turns a gap the reader would notice into a pointer, and
          hands the parser the URL. The rule above it matters as much as the
          words: without it the line sits flush under the last entry and reads
          as a comment about that project. */}
      <p className="hidden print:block print:mt-2.5 print:pt-1.5 border-t border-black/25 text-xs italic text-black/70">
        This CV lists a selection of projects. The complete history — including
        the ones named under Notable Achievements — is at{" "}
        <a href="https://gil.solutions">gil.solutions</a>.
      </p>

      {/* Print keeps far less air than the screen here: the heading and the
          single entry below it are the last thing on the page, so every pixel
          of margin is what decides whether Education breaks onto a 4th page. */}
      <h2 className="font-clash print:font-sans font-semibold text-black dark:text-white mt-10 print:mt-2.5 text-2xl print:text-[14pt]">
        Education
      </h2>
      <div className="mt-10 print:mt-1">
        <TimelineItem
          dateRange="2008 - 2011"
          technologies={[]}
          title="Pontifícia Universidade Católica de São Paulo (PUC-SP)"
          role="Bachelor, Computer Science"
          description="Bachelor's degree in Computer Science from Pontifícia Universidade Católica de São Paulo, one of Brazil's leading higher education institutions."
          printDescription={false}
        />
      </div>
      <div className="xl:h-48"></div>
    </div>
  );
}
