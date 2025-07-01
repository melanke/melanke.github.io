import React from "react";
import Image from "next/image";
import { FaLink } from "react-icons/fa";

export interface TimelineItemProps {
  dateRange: string;
  technologies: string[];
  title: string;
  role: string;
  description: string | React.ReactNode;
  image?: string;
  link?: string;
  links?: (string | { label: string; url: string })[];
  nested?: boolean;
  lastNested?: boolean;
  print?: boolean;
}

export function TimelineItem({
  dateRange,
  technologies,
  title,
  role,
  description,
  image,
  link,
  links = [],
  nested = false,
  lastNested = false,
  print = true,
}: TimelineItemProps) {
  const allLinks = [...(link ? [link] : []), ...(links || [])];
  return (
    <div
      className={`flex w-full max-md:max-w-full break-inside-avoid text-[0.89rem] min-w-[288px] max-md:max-w-full ${
        !print ? "print:hidden" : ""
      }`}
    >
      {nested && (
        <div className="flex flex-col items-start relative">
          <div
            className="
              w-3.5
              h-20
              ml-1
              md:ml-2 
              border-b-2
              border-l-2
              border-neutral-200
              dark:border-neutral-800
              rounded-bl-xl
            "
          ></div>
          {!lastNested && (
            <div className="absolute top-0 w-3.5 h-full ml-1 md:ml-2 border-l-2 border-neutral-200 dark:border-neutral-800"></div>
          )}
        </div>
      )}
      <div className="flex flex-col pt-5">
        <div className="flex items-center w-full leading-snug min-h-[14px] max-md:max-w-full">
          <div className="font-bold text-black dark:text-white">{title}</div>
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

        <div className="leading-4 text-black dark:text-white max-md:max-w-full print:text-xs">
          {image && (
            <Image
              src={image}
              alt={title}
              width={128}
              height={0}
              className="w-32 h-auto float-left mr-3 rounded-lg border border-neutral-200 dark:border-neutral-800 print:hidden"
            />
          )}
          {description}
          {(technologies.length > 0 || allLinks.length > 0) && (
            <div className="mt-2.5 flex flex-wrap gap-1 text-xs">
              {technologies.map((tech, index) => (
                <span
                  className="print:hidden px-3 py-[0.19rem] bg-neutral-100 font-clash print:font-sans dark:bg-neutral-800 rounded-full text-black dark:text-white"
                  key={index}
                >
                  {tech}
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
