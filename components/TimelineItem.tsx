import React from "react";
import Image from "next/image";
import { FaLink } from "react-icons/fa";

export interface TimelineItemProps {
  dateRange: string;
  technologies: string[];
  title: string;
  role: string;
  description: string;
  image?: string;
  link?: string;
  nested?: boolean;
  groupCircleForPrint?: boolean;
}

export function TimelineItem({
  dateRange,
  technologies,
  title,
  role,
  description,
  image,
  link,
  nested = false,
  groupCircleForPrint = false,
}: TimelineItemProps) {
  return (
    <div className="flex w-full max-md:max-w-full break-inside-avoid text-[0.89rem] min-w-[288px] max-md:max-w-full">
      {groupCircleForPrint && (
        <div className="hidden print:flex flex-col">
          <div className="flex-grow"></div>
          <div className="w-5 h-5 flex-shrink-0 mr-3 rounded-full border-2 border-neutral-200 dark:border-neutral-800"></div>
          <div className="flex-grow md:ml-2 pl-2 md:pl-4 border-l-2 border-neutral-200 dark:border-neutral-800"></div>
        </div>
      )}
      <div
        className={`flex flex-col pt-5 ${
          nested
            ? "md:ml-2 pl-2 md:pl-4 border-l-2 border-neutral-200 dark:border-neutral-800"
            : ""
        }`}
      >
        <div className="flex items-start w-full leading-snug min-h-[14px] max-md:max-w-full">
          <div className="font-bold text-black dark:text-white">{title}</div>
          <span className="mx-2 text-black text-opacity-60 dark:text-white dark:text-opacity-60">
            •
          </span>
          <div className="text-black/60 dark:text-white/60">{role}</div>
        </div>
        <div className="text-black/60 dark:text-white/60 text-xs">
          {dateRange}
        </div>

        <div className="leading-4 text-black dark:text-white max-md:max-w-full">
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
          {technologies.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1 text-xs">
              {technologies.map((tech, index) => (
                <span
                  className="px-3 py-[0.19rem] bg-neutral-100 font-clash dark:bg-neutral-800 rounded-full text-black dark:text-white"
                  key={index}
                >
                  {tech}
                </span>
              ))}
              {link && (
                <a
                  href={link}
                  target="_blank"
                  className="flex items-center gap-1 pl-2 pr-3 py-[0.19rem] border border-neutral-100 dark:border-neutral-800 rounded-full text-black dark:text-white hover:bg-neutral-800 dark:hover:bg-neutral-100 hover:text-white dark:hover:text-black transition-colors duration-200"
                  rel="noopener noreferrer"
                >
                  <FaLink />
                  {link}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
