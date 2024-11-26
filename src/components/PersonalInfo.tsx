import { ContactItem, ContactItemProps } from "./ContactItem";

export interface PersonalInfoProps {
  name: string;
  role: string;
  contacts: ContactItemProps[];
  education: ContactItemProps[];
}

export function PersonalInfo({
  name,
  role,
  contacts,
  education,
}: PersonalInfoProps) {
  return (
    <header className="flex flex-wrap gap-2 w-full min-h-[128px] max-md:max-w-full">
      <img
        loading="lazy"
        src="/icons/id.svg"
        alt="Profile"
        className="object-contain shrink-0 self-start w-32 aspect-square"
      />
      <div className="flex flex-col flex-1 shrink justify-between py-2.5 basis-0 min-w-[240px]">
        <div className="flex gap-2.5 items-center self-start h-[37px]">
          <h1 className="self-stretch my-auto text-5xl font-bold w-[61px] max-md:text-4xl">
            {name}
          </h1>
          <div className="my-auto text-xl font-semibold leading-5 w-[101px]">
            {role}
          </div>
        </div>
        <div className="flex gap-10 justify-between items-start pl-1.5 mt-2.5 w-full text-xs">
          <div className="flex flex-col w-[134px]">
            {contacts.map((contact, index) => (
              <ContactItem key={index} {...contact} />
            ))}
          </div>
          <div className="flex flex-col items-start">
            {education.map((item, index) => (
              <ContactItem key={index} {...item} />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
