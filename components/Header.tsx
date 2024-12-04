"use client";

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
    <div className="flex flex-wrap gap-2 w-full text-black min-h-[128px] max-md:max-w-full items-center">
      <Image
        src={profileImage}
        width={160}
        height={160}
        className="object-contain shrink-0 self-start w-40 aspect-square"
        alt={`${name} profile`}
      />
      <div className="flex flex-col flex-1 shrink justify-between basis-0 min-w-[240px]">
        <div className="flex gap-2.5 items-center self-start">
          <div className="self-stretch my-auto text-6xl font-clash font-bold">
            {name}
          </div>
          <div className="my-auto text-2xl font-clash font-semibold leading-6 w-[120px]">
            {title}
          </div>
        </div>
        <div className="flex gap-10 justify-between items-start pl-1.5 mt-2.5 w-full text-xs">
          <div className="flex flex-col w-[134px] gap-0.5">
            <div className="flex gap-1 items-center self-start">
              <Image
                src="/icons/id.svg"
                width={12}
                height={12}
                className="object-contain shrink-0 self-stretch my-auto aspect-[1.22] w-[12px]"
                alt=""
              />
              <div className="self-stretch my-auto">{contacts.fullName}</div>
            </div>
            <a
              href={`mailto:${contacts.email}`}
              className="flex gap-1 items-center w-full whitespace-nowrap underline"
            >
              <Image
                src="/icons/email.svg"
                width={12}
                height={12}
                className="object-contain shrink-0 self-stretch my-auto aspect-[1.22] w-[12px]"
                alt=""
              />
              <div className="self-stretch my-auto">{contacts.email}</div>
            </a>
            <a
              href={formatUrl(contacts.github)}
              target="_blank"
              className="flex gap-1 items-center w-full whitespace-nowrap underline"
            >
              <Image
                src="/icons/github.svg"
                width={12}
                height={12}
                className="object-contain shrink-0 self-stretch my-auto aspect-square w-[12px]"
                alt=""
              />
              <div className="self-stretch my-auto">{contacts.github}</div>
            </a>
            <a
              href={`tel:${contacts.phone.replace(" ", "")}`}
              className="flex gap-1 items-center self-start underline"
            >
              <Image
                src="/icons/phone.svg"
                width={12}
                height={12}
                className="object-contain shrink-0 self-stretch my-auto aspect-square w-[12px]"
                alt=""
              />
              <div className="self-stretch my-auto">{contacts.phone}</div>
            </a>
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <div className="flex gap-1 items-end self-stretch">
              <Image
                src="/icons/degree.svg"
                width={12}
                height={12}
                className="object-contain shrink-0 aspect-square w-[12px]"
                alt=""
              />
              <div>{contacts.education}</div>
            </div>
            <div className="flex gap-1.5 items-center">
              <Image
                src="/icons/language.svg"
                width={12}
                height={12}
                className="object-contain shrink-0 self-stretch my-auto aspect-[1.1] w-[12px]"
                alt=""
              />
              <div className="self-stretch my-auto">{contacts.languages}</div>
            </div>
            <div className="flex gap-1.5 items-center">
              <Image
                src="/icons/location.svg"
                width={12}
                height={12}
                className="object-contain shrink-0 self-stretch my-auto aspect-[0.79] w-[12px]"
                alt=""
              />
              <div className="self-stretch my-auto">{contacts.location}</div>
            </div>
            <a
              href={formatUrl(contacts.linkedin)}
              target="_blank"
              className="flex gap-1.5 items-center whitespace-nowrap underline"
            >
              <Image
                src="/icons/linkedin.svg"
                width={12}
                height={12}
                className="object-contain shrink-0 self-stretch my-auto aspect-square w-[12px]"
                alt=""
              />
              <div className="self-stretch my-auto">{contacts.linkedin}</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
