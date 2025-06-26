import Image from "next/image";
import {
  FaGithub,
  FaLinkedin,
  FaLocationDot,
  FaTelegram,
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
    education: string;
    languages: string;
    location: string;
    linkedin: string;
  };
}

export function Header({ name, title, profileImage, contacts }: HeaderProps) {
  const formatUrl = (url: string) => {
    return url.indexOf("://") === -1 ? `http://${url}` : url;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full text-black dark:text-white min-h-[128px] print:min-h-0 max-sm:max-w-full items-center justify-center sm:justify-start">
      <Image
        src={profileImage}
        priority
        width={160}
        height={160}
        className="object-contain shrink-0 self-center sm:self-start w-40 aspect-square print:hidden"
        alt={`${name} profile`}
      />
      <div className="flex flex-col flex-1 shrink justify-between basis-0 min-w-[240px] items-center sm:items-start">
        <div className="flex gap-2.5 items-center self-center sm:self-start">
          <div className="self-stretch my-auto text-6xl font-clash print:hidden font-bold">
            {name}
          </div>
          <div className="self-stretch my-auto text-6xl font-sans hidden print:block font-bold">
            {contacts.fullName}
          </div>
          <div className="my-auto text-2xl font-clash print:font-sans font-semibold leading-6 w-[120px]">
            {title}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-10 justify-between items-start pl-1.5 mt-2.5 w-full text-xs">
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
          <div className="flex sm:flex-col print:flex-row print:py-1 gap-y-1 gap-x-6 w-full sm:w-auto items-center justify-center sm:items-start">
            <a
              href={`mailto:${contacts.email}`}
              className="flex gap-1.5 items-center whitespace-nowrap sm:underline rounded-full hover:bg-black dark:hover:bg-white hover:p-1.5 hover:-m-1.5 hover:text-white dark:hover:text-black hover:z-10 hover:no-underline transition-all duration-200"
              title={contacts.email}
            >
              <MdEmail className="w-10 sm:w-4 h-10 sm:h-4 print:hidden" />
              <div className="self-stretch my-auto hidden sm:block">
                {contacts.email}
              </div>
            </a>
            <a
              href={`https://t.me/${contacts.telegram}`}
              className="flex gap-1.5 items-center sm:underline rounded-full hover:bg-black dark:hover:bg-white hover:p-1.5 hover:-m-1.5 hover:text-white dark:hover:text-black hover:z-10 hover:no-underline transition-all duration-200"
              title={contacts.telegram}
            >
              <FaTelegram className="w-10 sm:w-4 h-10 sm:h-4 print:hidden" />
              <div className="self-stretch my-auto hidden sm:block">
                t.me/{contacts.telegram}
              </div>
            </a>
            <a
              href={formatUrl(contacts.github)}
              target="_blank"
              className="flex gap-1.5 items-center whitespace-nowrap sm:underline rounded-full hover:bg-black dark:hover:bg-white hover:p-1.5 hover:-m-1.5 hover:text-white dark:hover:text-black hover:z-10 hover:no-underline transition-all duration-200"
              title={contacts.github}
            >
              <FaGithub className="w-10 sm:w-4 h-10 sm:h-4 print:hidden" />
              <div className="self-stretch my-auto hidden sm:block">
                {contacts.github}
              </div>
            </a>
            <a
              href={formatUrl(contacts.linkedin)}
              target="_blank"
              className="flex gap-1.5 items-center whitespace-nowrap sm:underline rounded-full hover:bg-black dark:hover:bg-white hover:p-1.5 hover:-m-1.5 hover:text-white dark:hover:text-black hover:z-10 hover:no-underline transition-all duration-200"
              title={contacts.linkedin}
            >
              <FaLinkedin className="w-10 sm:w-4 h-10 sm:h-4 print:hidden" />
              <div className="self-stretch my-auto hidden sm:block">
                {contacts.linkedin}
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
