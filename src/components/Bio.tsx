export interface BioProps {
  text: string;
}

export function Bio({ text }: BioProps) {
  return (
    <div className="text-xs leading-4 text-black max-md:max-w-full">{text}</div>
  );
}
