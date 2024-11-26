export interface ContactItemProps {
  icon: string;
  text: string;
}

export function ContactItem({ icon, text }: ContactItemProps) {
  return (
    <div className="flex gap-1 items-center mt-1.5">
      <img
        loading="lazy"
        src={icon}
        alt=""
        className="object-contain shrink-0 self-stretch my-auto aspect-square w-[11px]"
      />
      <div className="self-stretch my-auto">{text}</div>
    </div>
  );
}
