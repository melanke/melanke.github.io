export interface BioProps {
  text: string;
}

export function Bio({ text }: BioProps) {
  return (
    <div className="text-sm leading-5 text-black dark:text-white max-md:max-w-full animate-fade-up opacity-0 mt-5">
      {text}
    </div>
  );
}
