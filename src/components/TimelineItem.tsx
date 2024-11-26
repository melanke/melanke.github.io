import React from "react";

export interface TimelineItemProps {
  dateRange: string;
  technologies: string[];
  title: string;
  role: string;
  description: string;
}

export function TimelineItem({
  dateRange,
  technologies,
  title,
  role,
  description,
}: TimelineItemProps) {
  return (
    <div className="flex mt-3.5 w-full max-md:max-w-full break-inside-avoid">
      <div className="flex flex-wrap gap-2 h-full min-w-[288px]">
        <div className="flex flex-col text-[0.82rem] leading-4 w-[72px]">
          <div className="text-black">
            {dateRange.split(" - ").join(" -\n")}
          </div>
          <div className="text-black text-opacity-60">
            <ul className="list-disc list-outside ml-4">
              {technologies.map((tech, index) => (
                <li key={index}>{tech}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col flex-1 shrink self-start text-[0.89rem] basis-0 min-w-[240px] max-md:max-w-full">
          <div className="flex items-start w-full leading-snug min-h-[14px] max-md:max-w-full">
            <div className="font-bold text-black">{title}</div>
            <span className="mx-2 text-black text-opacity-60">•</span>
            <div className="text-black text-opacity-60">{role}</div>
          </div>
          <div className="leading-4 text-black max-md:max-w-full">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}
