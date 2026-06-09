import Image from "next/image";
import Link from "next/link";
import {
  FaBlog,
  FaGithub,
  FaLinkedin,
  FaLocationDot,
  FaTelegram,
  FaXTwitter,
} from "react-icons/fa6";
import { LuLanguages } from "react-icons/lu";
import { MdEmail } from "react-icons/md";
import { RiGraduationCapFill, RiIdCardFill } from "react-icons/ri";

export interface HeaderProps {
  name: string;
  title: string;
  profileImage: string;
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
  /** When true, renders a slim version: image + contact column hidden, smaller name/title, big icons promoted to md+. */
  compact?: boolean;
}

export function Header({
  name,
  title,
  profileImage,
  contacts,
  compact = false,
}: HeaderProps) {
  const formatUrl = (url: string) => {
    return url.indexOf("://") === -1 ? `http://${url}` : url;
  };

  const bigLinkClass =
    "rounded-full hover:bg-black dark:hover:bg-white hover:p-1.5 hover:-m-1.5 hover:text-white dark:hover:text-black hover:z-10 transition-all duration-200";
  const bigIconClass = "w-7 h-7";

  return (
    <div
      className={`flex flex-col sm:flex-row gap-2 w-full text-black dark:text-white print:min-h-[128px] max-sm:max-w-full items-center justify-center sm:justify-start transition-[min-height] duration-300 ease-out ${
        compact ? "min-h-0" : "min-h-[128px]"
      }`}
    >
      <Image
        src={profileImage}
        priority
        width={160}
        height={160}
        className={`object-contain shrink-0 self-center sm:self-start aspect-square print:w-40 print:opacity-100 transition-all duration-300 ease-out print:hidden ${
          compact ? "w-0 opacity-0" : "w-40 opacity-100"
        }`}
        alt={`${name} profile`}
      />
      <div className="flex flex-col flex-1 shrink justify-between basis-0 min-w-[240px] items-center sm:items-start">
        <div className="flex w-full items-center justify-between gap-6">
          <div className="flex gap-2.5 items-center self-center sm:self-start">
            <Link href="/" className="contents">
              <div
                className={`self-stretch my-auto font-clash print:hidden font-bold transition-all duration-300 ease-out print:text-6xl ${
                  compact ? "text-2xl leading-none" : "text-6xl"
                }`}
              >
                {name}
              </div>
              <div className="self-stretch my-auto text-6xl font-sans hidden print:block font-bold">
                {contacts.fullName}
              </div>
              <div
                className={`my-auto font-clash print:font-sans font-semibold transition-all duration-300 ease-out print:text-2xl print:leading-6 ${
                  compact ? "text-sm leading-4" : "text-2xl leading-6"
                }`}
              >
                {title}
              </div>
            </Link>
          </div>
          <div
            className={`print:hidden gap-6 items-center pr-2 shrink-0 ${
              compact ? "hidden md:flex" : "hidden lg:flex"
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
            <Link
              href="/blog"
              className={bigLinkClass}
              title="Blog"
            >
              <FaBlog className={bigIconClass} />
            </Link>
          </div>
        </div>
        <div
          className={`flex flex-col sm:flex-row gap-10 justify-between items-start pl-1.5 w-full text-xs overflow-hidden transition-all duration-300 ease-out print:max-h-96 print:opacity-100 print:mt-2.5 ${
            compact ? "max-h-0 opacity-0 mt-0" : "max-h-96 opacity-100 mt-2.5"
          }`}
        >
          <div className="flex flex-col print:hidden gap-1">
            <div className="flex gap-1.5 items-center self-start">
              <RiIdCardFill className="w-4 h-4" />
              <div className="self-stretch my-auto">{contacts.fullName}</div>
            </div>
            <div className="flex gap-1.5 items-end self-stretch">
              <RiGraduationCapFill className="w-4 h-4" />
              <div>{contacts.education}</div>
            </div>
            <div className="flex gap-1.5 items-center">
              <LuLanguages className="w-4 h-4" />
              <div className="self-stretch my-auto">{contacts.languages}</div>
            </div>
            <div className="flex gap-1.5 items-center">
              <FaLocationDot className="w-4 h-4" />
              <div className="self-stretch my-auto">{contacts.location}</div>
            </div>
          </div>
          <div className="flex sm:flex-col print:flex-row print:flex print:py-1 lg:hidden gap-y-1 gap-x-6 w-full sm:w-auto items-center justify-center sm:items-start">
            <a
              href={`mailto:${contacts.email}`}
              className="flex gap-1.5 items-center whitespace-nowrap sm:max-lg:underline rounded-full hover:bg-black dark:hover:bg-white hover:p-1.5 hover:-m-1.5 hover:text-white dark:hover:text-black hover:z-10 hover:no-underline transition-all duration-200"
              title={contacts.email}
            >
              <MdEmail className="w-10 sm:w-4 h-10 sm:h-4 print:hidden" />
              <div className="self-stretch my-auto hidden sm:max-lg:block print:block">
                {contacts.email}
              </div>
            </a>
            <a
              href={`https://t.me/${contacts.telegram}`}
              className="flex gap-1.5 items-center sm:max-lg:underline rounded-full hover:bg-black dark:hover:bg-white hover:p-1.5 hover:-m-1.5 hover:text-white dark:hover:text-black hover:z-10 hover:no-underline transition-all duration-200"
              title={contacts.telegram}
            >
              <FaTelegram className="w-10 sm:w-4 h-10 sm:h-4 print:hidden" />
              <div className="self-stretch my-auto hidden sm:max-lg:block print:block">
                Telegram
              </div>
            </a>
            <a
              href={formatUrl(contacts.github)}
              target="_blank"
              className="flex gap-1.5 items-center whitespace-nowrap sm:max-lg:underline rounded-full hover:bg-black dark:hover:bg-white hover:p-1.5 hover:-m-1.5 hover:text-white dark:hover:text-black hover:z-10 hover:no-underline transition-all duration-200"
              title={contacts.github}
            >
              <FaGithub className="w-10 sm:w-4 h-10 sm:h-4 print:hidden" />
              <div className="self-stretch my-auto hidden sm:max-lg:block print:block">
                Github
              </div>
            </a>
            <a
              href={formatUrl(contacts.linkedin)}
              target="_blank"
              className="flex gap-1.5 items-center whitespace-nowrap sm:max-lg:underline rounded-full hover:bg-black dark:hover:bg-white hover:p-1.5 hover:-m-1.5 hover:text-white dark:hover:text-black hover:z-10 hover:no-underline transition-all duration-200"
              title={contacts.linkedin}
            >
              <FaLinkedin className="w-10 sm:w-4 h-10 sm:h-4 print:hidden" />
              <div className="self-stretch my-auto hidden sm:max-lg:block print:block">
                LinkedIn
              </div>
            </a>
            <a
              href={`https://x.com/${contacts.x}`}
              target="_blank"
              className="flex gap-1.5 items-center whitespace-nowrap sm:max-lg:underline rounded-full hover:bg-black dark:hover:bg-white hover:p-1.5 hover:-m-1.5 hover:text-white dark:hover:text-black hover:z-10 hover:no-underline transition-all duration-200"
              title={`x.com/${contacts.x}`}
            >
              <FaXTwitter className="w-10 sm:w-4 h-10 sm:h-4 print:hidden" />
              <div className="self-stretch my-auto hidden sm:max-lg:block print:block">
                {`x.com/${contacts.x}`}
              </div>
            </a>
            <Link
              href="/blog"
              className="flex gap-1.5 items-center whitespace-nowrap sm:max-lg:underline rounded-full hover:bg-black dark:hover:bg-white hover:p-1.5 hover:-m-1.5 hover:text-white dark:hover:text-black hover:z-10 hover:no-underline transition-all duration-200"
              title="Blog"
            >
              <FaBlog className="w-10 sm:w-4 h-10 sm:h-4 print:hidden" />
              <div className="self-stretch my-auto hidden sm:max-lg:block print:hidden">
                Blog
              </div>
            </Link>
            <div className="self-stretch my-auto hidden print:block">
              {contacts.location}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
