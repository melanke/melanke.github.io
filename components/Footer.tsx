import { MdEmail } from "react-icons/md";
import { FaTelegram, FaLinkedin } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="print:hidden bg-[#f9b800] text-black px-5 py-12 mt-16">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-6">
        <div>
          <p className="font-clash font-bold text-3xl">Let&apos;s work together</p>
          <p className="mt-2 text-black/70 text-sm">Have a project in mind? Feel free to reach out.</p>
        </div>
        <div className="flex gap-6 items-center">
          <a
            href="mailto:gilbueno.mail@gmail.com"
            title="gilbueno.mail@gmail.com"
            className="flex items-center gap-2 text-black/80 hover:text-black transition-colors"
          >
            <MdEmail className="w-5 h-5" />
            <span className="text-sm">Email</span>
          </a>
          <a
            href="https://t.me/melankeee"
            title="Telegram"
            className="flex items-center gap-2 text-black/80 hover:text-black transition-colors"
          >
            <FaTelegram className="w-5 h-5" />
            <span className="text-sm">Telegram</span>
          </a>
          <a
            href="https://www.linkedin.com/in/gilbueno/"
            target="_blank"
            title="LinkedIn"
            className="flex items-center gap-2 text-black/80 hover:text-black transition-colors"
          >
            <FaLinkedin className="w-5 h-5" />
            <span className="text-sm">LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
