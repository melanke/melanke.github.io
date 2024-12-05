export interface BioProps {
  text: string;
}

export function Bio({ text }: BioProps) {
  return (
    <div className="text-sm leading-5 text-black dark:text-white max-md:max-w-full">{text}</div>
  );
}
