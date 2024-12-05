import Image from "next/image";

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
  const formatUrl = (url: string) => {
    return url.indexOf("://") === -1 ? `http://${url}` : url;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full text-black dark:text-white min-h-[128px] max-sm:max-w-full items-center justify-center sm:justify-start">
      <Image
        src={profileImage}
        width={160}
        height={160}
        className="object-contain shrink-0 self-center sm:self-start w-40 aspect-square"
        alt={`${name} profile`}
      />
      <div className="flex flex-col flex-1 shrink justify-between basis-0 min-w-[240px] items-center sm:items-start">
        <div className="flex gap-2.5 items-center self-center sm:self-start">
          <div className="self-stretch my-auto text-6xl font-clash font-bold">
            {name}
          </div>
          <div className="my-auto text-2xl font-clash font-semibold leading-6 w-[120px]">
            {title}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-10 justify-between items-start pl-1.5 mt-2.5 w-full text-xs">
          <div className="flex flex-col gap-0.5">
            <div className="flex gap-1 items-center self-start">
              <Image
                src="/icons/id.svg"
                width={12}
                height={12}
                className="object-contain shrink-0 self-stretch my-auto aspect-[1.22] w-[12px] dark:invert"
                alt=""
              />
              <div className="self-stretch my-auto">{contacts.fullName}</div>
            </div>            
            <div className="flex gap-1 items-end self-stretch">
              <Image
                src="/icons/degree.svg"
                width={12}
                height={12}
                className="object-contain shrink-0 aspect-square w-[12px] dark:invert"
                alt=""
              />
              <div>{contacts.education}</div>
            </div>
            <div className="flex gap-1.5 items-center">
              <Image
                src="/icons/language.svg"
                width={12}
                height={12}
                className="object-contain shrink-0 self-stretch my-auto aspect-[1.1] w-[12px] dark:invert"
                alt=""
              />
              <div className="self-stretch my-auto">{contacts.languages}</div>
            </div>
            <div className="flex gap-1.5 items-center">
              <Image
                src="/icons/location.svg"
                width={12}
                height={12}
                className="object-contain shrink-0 self-stretch my-auto aspect-[0.79] w-[12px] dark:invert"
                alt=""
              />
              <div className="self-stretch my-auto">{contacts.location}</div>
            </div>
          </div>
          <div className="flex sm:flex-col gap-y-2 gap-x-6 sm:gap-0.5 w-full sm:w-[134px] items-center justify-center sm:items-start">
            <a
              href={`mailto:${contacts.email}`}
              className="flex gap-1 items-center sm:w-full whitespace-nowrap sm:underline"
              title={contacts.email}
            >
              <Image
                src="/icons/email.svg"
                width={36}
                height={36}
                className="w-[36px] h-[36px] sm:w-[12px] sm:h-[12px] object-contain shrink-0 self-stretch my-auto aspect-[1.22] w-[12px] dark:invert"
                alt="Email"
              />
              <div className="self-stretch my-auto hidden sm:block">{contacts.email}</div>
            </a>
            <a
              href={`tel:${contacts.phone.replace(" ", "")}`}
              className="flex gap-1 items-center sm:self-start sm:underline"
              title={contacts.phone}
            >
              <Image
                src="/icons/phone.svg"
                width={36}
                height={36}
                className="w-[36px] h-[36px] sm:w-[12px] sm:h-[12px] object-contain shrink-0 self-stretch my-auto aspect-square w-[12px] dark:invert"
                alt="Phone"
              />
              <div className="self-stretch my-auto hidden sm:block">{contacts.phone}</div>
            </a>
            <a
              href={formatUrl(contacts.github)}
              target="_blank"
              className="flex gap-1 items-center sm:w-full whitespace-nowrap sm:underline"
              title={contacts.github}
            >
              <Image
                src="/icons/github.svg"
                width={36}
                height={36}
                className="w-[36px] h-[36px] sm:w-[12px] sm:h-[12px] object-contain shrink-0 self-stretch my-auto aspect-square w-[12px] dark:invert"
                alt="GitHub"
              />
              <div className="self-stretch my-auto hidden sm:block">{contacts.github}</div>
            </a>
            <a
              href={formatUrl(contacts.linkedin)}
              target="_blank"
              className="flex gap-1.5 items-center whitespace-nowrap sm:underline"
              title={contacts.linkedin}
            >
              <Image
                src="/icons/linkedin.svg"
                width={36}
                height={36}
                className="w-[36px] h-[36px] sm:w-[12px] sm:h-[12px] object-contain shrink-0 self-stretch my-auto aspect-square w-[12px] dark:invert"
                alt="LinkedIn"
              />
              <div className="self-stretch my-auto hidden sm:block">{contacts.linkedin}</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
