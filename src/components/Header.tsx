export interface HeaderProps {
  name: string;
  title: string;
  profileImage: string;
  contacts: {
    fullName: string;
    email: string;
    github: string;
    phone: string;
    education: string;
    languages: string;
    location: string;
    linkedin: string;
  };
}

export function Header({ name, title, profileImage, contacts }: HeaderProps) {
  return (
    <div className="flex flex-wrap gap-2 w-full text-black min-h-[128px] max-md:max-w-full items-center">
      <img
        loading="lazy"
        src={profileImage}
        className="object-contain shrink-0 self-start w-32 aspect-square"
        alt={`${name} profile`}
      />
      <div className="flex flex-col flex-1 shrink justify-between basis-0 min-w-[240px]">
        <div className="flex gap-2.5 items-center self-start h-[37px]">
          <div className="self-stretch my-auto text-5xl font-clash font-bold -mt-1">
            {name}
          </div>
          <div className="my-auto text-xl font-clash font-semibold leading-5 w-[101px]">
            {title}
          </div>
        </div>
        <div className="flex gap-10 justify-between items-start pl-1.5 mt-2.5 w-full text-xs">
          <div className="flex flex-col w-[134px]">
            <div className="flex gap-1 items-center self-start">
              <img
                loading="lazy"
                src="/icons/id.svg"
                className="object-contain shrink-0 self-stretch my-auto aspect-[1.22] w-[11px]"
                alt=""
              />
              <div className="self-stretch my-auto">{contacts.fullName}</div>
            </div>
            <div className="flex gap-1 items-center w-full whitespace-nowrap">
              <img
                loading="lazy"
                src="/icons/email.svg"
                className="object-contain shrink-0 self-stretch my-auto aspect-[1.22] w-[11px]"
                alt=""
              />
              <div className="self-stretch my-auto">{contacts.email}</div>
            </div>
            <div className="flex gap-1 items-center w-full whitespace-nowrap">
              <img
                loading="lazy"
                src="/icons/github.svg"
                className="object-contain shrink-0 self-stretch my-auto aspect-square w-[11px]"
                alt=""
              />
              <div className="self-stretch my-auto">{contacts.github}</div>
            </div>
            <div className="flex gap-1 items-center self-start">
              <img
                loading="lazy"
                src="/icons/phone.svg"
                className="object-contain shrink-0 self-stretch my-auto aspect-square w-[11px]"
                alt=""
              />
              <div className="self-stretch my-auto">{contacts.phone}</div>
            </div>
          </div>
          <div className="flex flex-col items-start">
            <div className="flex gap-1 items-end self-stretch">
              <img
                loading="lazy"
                src="/icons/degree.svg"
                className="object-contain shrink-0 aspect-square w-[11px]"
                alt=""
              />
              <div>{contacts.education}</div>
            </div>
            <div className="flex gap-1.5 items-center">
              <img
                loading="lazy"
                src="/icons/language.svg"
                className="object-contain shrink-0 self-stretch my-auto aspect-[1.1] w-[11px]"
                alt=""
              />
              <div className="self-stretch my-auto">{contacts.languages}</div>
            </div>
            <div className="flex gap-1.5 items-center">
              <img
                loading="lazy"
                src="/icons/location.svg"
                className="object-contain shrink-0 self-stretch my-auto aspect-[0.79] w-[11px]"
                alt=""
              />
              <div className="self-stretch my-auto">{contacts.location}</div>
            </div>
            <div className="flex gap-1.5 items-center whitespace-nowrap">
              <img
                loading="lazy"
                src="/icons/linkedin.svg"
                className="object-contain shrink-0 self-stretch my-auto aspect-square w-[11px]"
                alt=""
              />
              <div className="self-stretch my-auto">{contacts.linkedin}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
