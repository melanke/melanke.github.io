export function PageHeader() {
  return (
    <div className="gap-2.5 items-center self-end break-before-page hidden print:flex text-black dark:text-white">
      <div className="self-stretch my-auto text-5xl font-clash font-bold">
        Gil
      </div>
      <div className="my-auto text-[1.25rem] font-clash font-semibold leading-5 w-[120px]">
        Senior Developer
      </div>
    </div>
  );
}
