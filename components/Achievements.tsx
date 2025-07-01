import { MdEmojiEvents } from "react-icons/md";

export function Achievements() {
  return (
    <div className="flex flex-col mt-10 print:mt-5 w-full text-black dark:text-white max-md:max-w-full animate-fade-up [animation-delay:600ms] opacity-0">
      <div className="flex gap-1.5 justify-center items-center self-start text-2xl print:text-xl font-semibold leading-none">
        <MdEmojiEvents size={20} className="print:hidden" />
        <div className="self-stretch my-auto font-clash print:font-sans font-semibold">
          Notable Achievements
        </div>
      </div>
      <div className="text-sm leading-5 text-black dark:text-white max-md:max-w-full mt-2.5 print:mt-1">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 print:grid-cols-1 print:gap-y-0 text-sm list-disc list-outside pl-5">
          <li>
            <a
              href="https://coz.io/neon-wallet/"
              target="_blank"
              className="underline"
            >
              Neon Wallet
            </a>{" "}
            – Over US$1 Billion in traded volume
          </li>
          <li>Runin Multilaser – Embedded in over 20 Million devices</li>
          <li>
            <a
              href="https://itrackbrasil.com.br/"
              target="_blank"
              className="underline"
            >
              iTrack
            </a>{" "}
            – 50 Million invoices registered; 60k delivery mans; 2k companies
          </li>
          <li>Apptite – US$1.6 Million in GMV; 100k deliveries; 50k users</li>
          <li>
            <a
              href="https://sharity.com.br/"
              target="_blank"
              className="underline"
            >
              Sharity
            </a>{" "}
            – R$ 2 Million in donations; 100k users
          </li>
          <li>Desabafa - 700k posts</li>
        </ul>
      </div>
    </div>
  );
}
