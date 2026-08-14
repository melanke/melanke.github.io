import Link from "next/link";
import {
  FaGithub,
  FaLinkedin,
  FaTelegram,
  FaXTwitter,
} from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { StarIcon } from "./StarIcon";

export interface HeaderProps {
  name: string;
  title: string;
  contacts: {
    fullName: string;
    email: string;
    phone: string;
    github: string;
    telegram: string;
    x: string;
    education: string;
    languages: string;
    location: string;
    linkedin: string;
  };
  /** When true, renders a slim version: contact column hidden, smaller name/title, big icons promoted to md+. */
  compact?: boolean;
}

export function Header({ name, title, contacts, compact = false }: HeaderProps) {
  const formatUrl = (url: string) => {
    return url.indexOf("://") === -1 ? `http://${url}` : url;
  };

  const bigLinkClass =
    "rounded-full hover:bg-black hover:p-1.5 hover:-m-1.5 hover:text-white hover:z-10 transition-all duration-200";
  const bigIconClass = "w-7 h-7";

  const Tag = compact ? "div" : "h1";

  return (
    // Print takes the header's natural height; the `min-h-[128px]` below is a
    // screen-only reservation for the collapse animation. (The print value
    // wins on cascade order alone — the print variant is emitted after the
    // base utility — but it only lands if `transition` is off for print, see
    // the @media print block in globals.css.)
    <div
      className={`flex flex-col sm:flex-row gap-2 w-full text-black print:min-h-0 max-sm:max-w-full items-center justify-center sm:justify-start transition-[min-height] duration-300 ease-out ${
        compact ? "min-h-0" : "min-h-[128px]"
      }`}
    >
      <div className="flex flex-col flex-1 shrink justify-between basis-0 min-w-[240px] items-center sm:items-start">
        <div className="flex w-full items-center justify-between gap-6">
          <div className="flex gap-2.5 items-center self-center sm:self-start">
            <Link href="/" className="contents">
              {/* SCREEN: "Gil ✦ Solutions" wordmark + typed role title */}
              <div className="flex flex-col print:hidden">
                {/* The heading level is the expanded layer's job: StickyHeader
                    mounts this component twice (expanded + compact crossfade),
                    and two <h1>Gil Lopes Bueno</h1> in one document is worse
                    than none. The compact copy renders the same text as a div. */}
                <Tag
                  className={`font-clash font-bold leading-none flex items-center gap-2 sm:gap-4 transition-all duration-300 ease-out ${
                    compact ? "text-4xl" : "text-[clamp(2.25rem,11vw,11.25rem)]"
                  }`}
                >
                  <span>{name}</span>
                  <StarIcon
                    className={`shrink-0 transition-all duration-300 ease-out ${
                      compact ? "w-6 h-6" : "w-[0.62em] h-[0.62em]"
                    }`}
                  />
                  <span>Solutions</span>
                </Tag>
              </div>
              {/* PRINT: name · title · location.
                  The separators are not decoration: without them the PDF text
                  layer emits "Gil Bueno Principal Software Engineer" as one
                  run, and ATS name extraction — which reads the first line —
                  stores that whole string as the candidate's name.
                  Keep every field on this line within a few steps of the same
                  font-size. Extraction groups text runs by size, so the old
                  layout (48px name next to a 14px location) pushed the
                  location onto a stray line of its own; at the sizes below it
                  extracts as one line.
                  `whitespace-nowrap` is load-bearing too: the longest title
                  (Tech Lead / Engineering Manager) fills the full 740px line,
                  and letting it wrap splits the name across two lines — which
                  puts just "Gil" on the first line for the parser to read. */}
              <div className="hidden print:flex items-baseline gap-2.5 whitespace-nowrap">
                <Tag className="font-sans text-2xl font-bold">
                  {contacts.fullName}
                </Tag>
                <div className="font-sans text-2xl text-black/30">·</div>
                <div className="font-sans text-2xl leading-6">{title}</div>
                <div className="font-sans text-2xl text-black/30">·</div>
                <div className="font-sans text-sm text-black/60">
                  {contacts.location}
                </div>
              </div>
            </Link>
          </div>
          <div
            className={`print:hidden gap-6 items-center pr-2 shrink-0 ${
              compact ? "hidden md:flex" : "hidden min-[1220px]:flex"
            }`}
          >
            <a
              href={`mailto:${contacts.email}`}
              className={bigLinkClass}
              title={contacts.email}
            >
              <MdEmail className={bigIconClass} />
            </a>
            <a
              href={`https://t.me/${contacts.telegram}`}
              className={bigLinkClass}
              title={contacts.telegram}
            >
              <FaTelegram className={bigIconClass} />
            </a>
            <a
              href={formatUrl(contacts.github)}
              target="_blank"
              className={bigLinkClass}
              title={contacts.github}
            >
              <FaGithub className={bigIconClass} />
            </a>
            <a
              href={formatUrl(contacts.linkedin)}
              target="_blank"
              className={bigLinkClass}
              title={contacts.linkedin}
            >
              <FaLinkedin className={bigIconClass} />
            </a>
            <a
              href={`https://x.com/${contacts.x}`}
              target="_blank"
              className={bigLinkClass}
              title={`x.com/${contacts.x}`}
            >
              <FaXTwitter className={bigIconClass} />
            </a>
          </div>
        </div>
        <div
          className={`flex flex-col sm:flex-row gap-10 justify-between items-start pl-1.5 print:pl-0 w-full text-xs overflow-hidden transition-all duration-300 ease-out print:max-h-96 print:opacity-100 print:mt-2.5 ${
            compact ? "max-h-0 opacity-0 mt-0" : "max-h-96 opacity-100 mt-2.5"
          }`}
        >
          <div
            className={`flex print:flex-row print:flex print:py-1 gap-y-1 gap-x-6 w-full items-center justify-center print:justify-start ${
              compact ? "lg:hidden" : "min-[1220px]:hidden"
            }`}
          >
            <a
              href={`mailto:${contacts.email}`}
              className="flex gap-1.5 items-center rounded-full hover:bg-black hover:p-1.5 hover:-m-1.5 hover:text-white hover:z-10 transition-all duration-200"
              title={contacts.email}
            >
              <MdEmail className="w-7 h-7 print:hidden" />
              <div className="self-stretch my-auto hidden print:block">
                {contacts.email}
              </div>
            </a>
            <a
              href={`https://t.me/${contacts.telegram}`}
              className="print:hidden flex gap-1.5 items-center rounded-full hover:bg-black hover:p-1.5 hover:-m-1.5 hover:text-white hover:z-10 transition-all duration-200"
              title={contacts.telegram}
            >
              <FaTelegram className="w-7 h-7" />
            </a>
            <a
              href={formatUrl(contacts.github)}
              target="_blank"
              className="flex gap-1.5 items-center rounded-full hover:bg-black hover:p-1.5 hover:-m-1.5 hover:text-white hover:z-10 transition-all duration-200"
              title={contacts.github}
            >
              <FaGithub className="w-7 h-7 print:hidden" />
              <div className="self-stretch my-auto hidden print:block">
                {contacts.github}
              </div>
            </a>
            <a
              href={formatUrl(contacts.linkedin)}
              target="_blank"
              className="flex gap-1.5 items-center rounded-full hover:bg-black hover:p-1.5 hover:-m-1.5 hover:text-white hover:z-10 transition-all duration-200"
              title={contacts.linkedin}
            >
              <FaLinkedin className="w-7 h-7 print:hidden" />
              <div className="self-stretch my-auto hidden print:block">
                {contacts.linkedin}
              </div>
            </a>
            <a
              href={`https://x.com/${contacts.x}`}
              target="_blank"
              className="print:hidden flex gap-1.5 items-center rounded-full hover:bg-black hover:p-1.5 hover:-m-1.5 hover:text-white hover:z-10 transition-all duration-200"
              title={`x.com/${contacts.x}`}
            >
              <FaXTwitter className="w-7 h-7" />
            </a>
            <a
              href="https://gil.solutions"
              target="_blank"
              className="hidden print:block self-stretch my-auto"
            >
              https://gil.solutions
            </a>
            {/* Print-only, and last: recruiters scan this row left to right,
                so the phone sits where a callback lands after the links.
                `tel:` needs the number unspaced to dial. */}
            <a
              href={`tel:${contacts.phone.replace(/\s+/g, "")}`}
              className="hidden print:block self-stretch my-auto"
            >
              {contacts.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
