type DamrokMarkProps = {
  className?: string;
  title?: string;
};

export default function DamrokMark({ className, title = '담록 아이콘' }: DamrokMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 128 128"
      fill="none"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(0 2)">
        <path
          d="M28 34C28 27.373 33.373 22 40 22H88C94.627 22 100 27.373 100 34V86C100 92.627 94.627 98 88 98H40C33.373 98 28 92.627 28 86V34Z"
          fill="#FFFFFF"
          fillOpacity="0.96"
        />
        <path
          d="M43 22V98"
          stroke="#BFDBFE"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M55 45H78"
          stroke="#2563EB"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M55 60H83"
          stroke="#60A5FA"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M55 75H72"
          stroke="#93C5FD"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M78 92L104 66"
          stroke="#E0F2FE"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M78 92L104 66"
          stroke="#22D3EE"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M69 103L78 92L89 101L69 103Z"
          fill="#FFFFFF"
        />
        <path
          d="M69 103L78 92L89 101"
          stroke="#2563EB"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M100 61L109 70"
          stroke="#FFFFFF"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M99 27L101.5 33L108 35.5L101.5 38L99 44L96.5 38L90 35.5L96.5 33L99 27Z"
          fill="#E0F2FE"
        />
      </g>
    </svg>
  );
}
