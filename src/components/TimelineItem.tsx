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
    <div className="flex mt-2.5 w-full max-md:max-w-full break-inside-avoid">
      <div className="flex flex-wrap gap-1.5 h-full min-w-[240px]">
        <div className="flex flex-col items-center text-xs leading-4 w-[60px]">
          <div className="text-black">
            {dateRange.split(" - ").join(" -\n")}
          </div>
          <div className="text-black text-opacity-60">
            {technologies.map((tech, index) => (
              <React.Fragment key={index}>
                {tech}
                <br />
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="flex flex-col flex-1 shrink self-start text-xs basis-0 min-w-[240px] max-md:max-w-full">
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
