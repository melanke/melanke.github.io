import Link from "next/link";
import {
  FaGithub,
  FaLinkedin,
  FaTelegram,
  FaXTwitter,
} from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { TypingTitle } from "./TypingTitle";
import { StarIcon } from "./StarIcon";

export interface HeaderProps {
  name: string;
  title: string;
  contacts: {
    fullName: string;
    email: string;
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

  return (
    <div
      className={`flex flex-col sm:flex-row gap-2 w-full text-black print:min-h-[128px] max-sm:max-w-full items-center justify-center sm:justify-start transition-[min-height] duration-300 ease-out ${
        compact ? "min-h-0" : "min-h-[128px]"
      }`}
    >
      <div className="flex flex-col flex-1 shrink justify-between basis-0 min-w-[240px] items-center sm:items-start">
        <div className="flex w-full items-center justify-between gap-6">
          <div className="flex gap-2.5 items-center self-center sm:self-start">
            <Link href="/" className="contents">
              {/* SCREEN: "Gil ✦ Solutions" wordmark + typed role title */}
              <div className="flex flex-col print:hidden">
                <div
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
                </div>
                {!compact && (
                  <TypingTitle className="self-end font-clash font-semibold leading-none -mt-1 md:-mt-4 min-h-[1em] text-[clamp(1.1rem,3.2vw,2.6rem)]" />
                )}
              </div>
              {/* PRINT: full name + static title */}
              <div className="hidden print:flex items-baseline gap-2.5">
                <div className="font-sans text-6xl font-bold">
                  {contacts.fullName}
                </div>
                <div className="font-sans font-semibold text-2xl leading-6">
                  {title}
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
          className={`flex flex-col sm:flex-row gap-10 justify-between items-start pl-1.5 w-full text-xs overflow-hidden transition-all duration-300 ease-out print:max-h-96 print:opacity-100 print:mt-2.5 ${
            compact ? "max-h-0 opacity-0 mt-0" : "max-h-96 opacity-100 mt-2.5"
          }`}
        >
          <div
            className={`flex print:flex-row print:flex print:py-1 gap-y-1 gap-x-6 w-full items-center justify-center ${
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
              className="flex gap-1.5 items-center rounded-full hover:bg-black hover:p-1.5 hover:-m-1.5 hover:text-white hover:z-10 transition-all duration-200"
              title={contacts.telegram}
            >
              <FaTelegram className="w-7 h-7 print:hidden" />
              <div className="self-stretch my-auto hidden print:block">
                Telegram
              </div>
            </a>
            <a
              href={formatUrl(contacts.github)}
              target="_blank"
              className="flex gap-1.5 items-center rounded-full hover:bg-black hover:p-1.5 hover:-m-1.5 hover:text-white hover:z-10 transition-all duration-200"
              title={contacts.github}
            >
              <FaGithub className="w-7 h-7 print:hidden" />
              <div className="self-stretch my-auto hidden print:block">
                Github
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
                LinkedIn
              </div>
            </a>
            <a
              href={`https://x.com/${contacts.x}`}
              target="_blank"
              className="flex gap-1.5 items-center rounded-full hover:bg-black hover:p-1.5 hover:-m-1.5 hover:text-white hover:z-10 transition-all duration-200"
              title={`x.com/${contacts.x}`}
            >
              <FaXTwitter className="w-7 h-7 print:hidden" />
              <div className="self-stretch my-auto hidden print:block">
                {`x.com/${contacts.x}`}
              </div>
            </a>
            <div className="self-stretch my-auto hidden print:block">
              {contacts.location}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
