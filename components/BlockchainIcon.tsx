import { SVGProps } from "react";

interface BlockchainIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const BlockchainIcon = ({
  size = 18,
  className,
  ...props
}: BlockchainIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M15.3542 11.2708V5.33333L10.4063 2.55022M7.63542 2.55022L2.6875 5.33333V11.2708M3.875 13.1265L9.02083 16.0208L12.1875 14.2396L14.1667 13.1265M9.02083 6.125L10.2083 6.8177L11.3958 7.51041V10.2812L10.2083 10.974L9.02083 11.6667L7.83333 10.974L6.64583 10.2812V7.51041L7.83333 6.8177L9.02083 6.125ZM9.02083 6.125V3.35416M11.3958 10.0833L14.1667 11.6667M6.64583 10.0833L3.875 11.6667"
        stroke="currentColor"
        strokeWidth="1.58333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.02084 3.35416C9.67667 3.35416 10.2083 2.8225 10.2083 2.16666C10.2083 1.51083 9.67667 0.979164 9.02084 0.979164C8.365 0.979164 7.83334 1.51083 7.83334 2.16666C7.83334 2.8225 8.365 3.35416 9.02084 3.35416Z"
        stroke="currentColor"
        strokeWidth="1.58333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.6875 13.6458C3.34334 13.6458 3.875 13.1142 3.875 12.4583C3.875 11.8025 3.34334 11.2708 2.6875 11.2708C2.03166 11.2708 1.5 11.8025 1.5 12.4583C1.5 13.1142 2.03166 13.6458 2.6875 13.6458Z"
        stroke="currentColor"
        strokeWidth="1.58333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.3542 13.6458C16.01 13.6458 16.5417 13.1142 16.5417 12.4583C16.5417 11.8025 16.01 11.2708 15.3542 11.2708C14.6983 11.2708 14.1667 11.8025 14.1667 12.4583C14.1667 13.1142 14.6983 13.6458 15.3542 13.6458Z"
        stroke="currentColor"
        strokeWidth="1.58333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
