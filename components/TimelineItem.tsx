import Image from "next/image";
import { marked } from "marked";
import { FaLink } from "react-icons/fa";
import { Tech } from "@/lib/technologies";

export interface TimelineItemProps {
  dateRange: string;
  technologies: Tech[];
  title: string;
  /**
   * Employer this item sits under, rendered inline before the title in print
   * only. On screen the indentation and the nested bar already say it; on
   * paper there is no such cue, so a resume parser reads a nested project as
   * one more employer overlapping the rest.
   */
  parentTitle?: string;
  role: string;
  /** Markdown. */
  description: string;
  /**
   * Keeps the description on screen but off the printed CV. For entries whose
   * header line already carries the whole fact (Education: school, course and
   * years), the paragraph is redundant on paper and costs page budget.
   */
  printDescription?: boolean;
  image?: string;
  link?: string;
  links?: (string | { label: string; url: string })[];
  print?: boolean;
  /** Whether this item's image is currently toggled to 3x size. */
  imageEnlarged?: boolean;
  onToggleImage?: () => void;
  /**
   * When true, the item is never rendered — neither on the site nor in the CV/print view.
   * It exists purely as a source-of-truth record read by the content skills
   * (see .claude/skills/_shared/professional-background.md).
   * Flip to false (or remove) to start showing it.
   */
  hidden?: boolean;
}

export function TimelineItem({
  dateRange,
  technologies,
  title,
  parentTitle,
  role,
  description,
  printDescription = true,
  image,
  link,
  links = [],
  print = true,
  hidden = false,
  imageEnlarged = false,
  onToggleImage,
}: TimelineItemProps) {
  if (hidden) return null;

  const allLinks = [...(link ? [link] : []), ...(links || [])];
  return (
    <div
      className={`flex w-full max-md:max-w-full print:break-inside-auto text-[0.89rem] min-w-[288px] max-md:max-w-full ${
        !print ? "print:hidden" : ""
      }`}
    >
      <div className="flex flex-col">
        <div className="flex items-center w-full leading-snug min-h-[14px] max-md:max-w-full">
          <h3 className="font-bold text-black dark:text-white">
            {parentTitle && (
              <span className="hidden print:inline">{parentTitle} &middot; </span>
            )}
            {title}
          </h3>
          <span className="mx-2 text-black text-opacity-60 dark:text-white dark:text-opacity-60">
            •
          </span>
          <div className="text-black/60 dark:text-white/60">{role}</div>
          <span className="mx-2 text-black text-opacity-60 dark:text-white dark:text-opacity-60">
            •
          </span>
          <div className="text-black/60 dark:text-white/60 text-xs">
            {dateRange}
          </div>
        </div>

        <div className="cv-entry mt-1 print:mt-0 leading-4 text-black dark:text-white max-md:max-w-full print:text-xs">
          {image && (
            <button
              type="button"
              onClick={onToggleImage}
              aria-pressed={imageEnlarged}
              aria-label={imageEnlarged ? `Shrink ${title} image` : `Enlarge ${title} image`}
              className="float-left mr-3 print:hidden bg-transparent border-0 p-0 cursor-pointer"
            >
              <Image
                src={image}
                alt={title}
                width={128}
                height={0}
                className={`h-auto rounded-lg border border-neutral-200 dark:border-neutral-800 transition-[width] duration-300 ease-in-out ${
                  imageEnlarged ? "w-[40rem]" : "w-32"
                }`}
              />
            </button>
          )}
          <div
            className={`space-y-2${printDescription ? "" : " print:hidden"}`}
            dangerouslySetInnerHTML={{ __html: marked.parse(description) as string }}
          />
          {/* Print gets a single running-text line instead of the pill row:
              technologies comma-separated (recruiters asked for plain text,
              not tags), with the links appended to the same line to keep the
              CV within its page budget. */}
          {(technologies.length > 0 || allLinks.length > 0) && (
            <div className="hidden print:block mt-1 text-xs">
              {technologies.length > 0 && (
                <>
                  <span className="font-semibold">Tech:</span>{" "}
                  {technologies.map((tech) => tech.name).join(", ")}
                </>
              )}
              {allLinks.map((link, index) => (
                <span key={index}>
                  {index > 0 || technologies.length > 0 ? " · " : ""}
                  <a href={typeof link === "string" ? link : link.url}>
                    {typeof link === "string" ? link : link.label}
                  </a>
                </span>
              ))}
            </div>
          )}
          {(technologies.length > 0 || allLinks.length > 0) && (
            <div className="print:hidden mt-2.5 flex flex-wrap gap-1 text-xs">
              {technologies.map((tech, index) => (
                <span
                  className="print:hidden px-3 py-[0.19rem] bg-neutral-100 font-clash print:font-sans dark:bg-neutral-800 rounded-full text-black dark:text-white"
                  key={index}
                >
                  {tech.name}
                </span>
              ))}
              {allLinks.map((link, index) => (
                <a
                  href={typeof link === "string" ? link : link.url}
                  target="_blank"
                  key={index}
                  className="flex items-center gap-1 pl-2 pr-3 py-[0.19rem] border border-neutral-100 dark:border-neutral-800 rounded-full text-black dark:text-white hover:bg-neutral-800 dark:hover:bg-neutral-100 hover:text-white dark:hover:text-black transition-colors duration-200"
                  rel="noopener noreferrer"
                >
                  <FaLink className="print:hidden" />
                  {typeof link === "string" ? link : link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
