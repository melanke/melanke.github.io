import { MdHistoryEdu } from "react-icons/md";

export interface HistoryProps {
  text: string;
}

export function History({ text }: HistoryProps) {
  return (
    <div className="text-black print:hidden dark:text-white max-md:max-w-full animate-fade-up opacity-0 mt-14 space-y-2">
      <div className="flex flex-wrap gap-1.5 items-center w-full text-2xl font-semibold leading-none whitespace-nowrap max-md:max-w-full">
        <MdHistoryEdu size={20} className="text-[#4F28FF]" />
        <div className="self-stretch my-auto font-clash font-semibold">
          History
        </div>
      </div>
      <p className="text-sm leading-5">{text}</p>
    </div>
  );
}
