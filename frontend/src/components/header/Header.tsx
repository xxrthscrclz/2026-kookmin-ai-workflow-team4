import { NavLink } from 'react-router-dom';
import { useThemeStore } from '@/stores/themeStore';
import Button from '@/components/ui/Button';

const navItems = [
  { to: '/', label: '소개', end: true },
  { to: '/meetings/create', label: '회의록 생성', end: false },
  { to: '/actions', label: '액션 트래커', end: false },
  { to: '/search', label: '회의 검색', end: false },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'nav-link',
    isActive ? 'nav-link-active' : 'nav-link-idle',
  ].join(' ');

export default function Header() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="glass sticky top-0 z-50 border-b border-glass-border">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4">
        <NavLink to="/" className="brand-link flex items-center gap-2 no-underline">
          <div className="brand-logo flex h-8 w-8 items-center justify-center rounded-lg bg-primary/90 shadow-md">
            <img src="/damrok-mark.svg" alt="담록 아이콘" className="h-7 w-7 object-contain" />
          </div>
          <div className="text-base font-semibold text-nav-text transition-colors duration-200">
            담록
          </div>
        </NavLink>

        <nav className="flex flex-1 items-center justify-center gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          aria-label="테마 전환"
          className="transition-all duration-200 ease-out hover:scale-105 active:scale-95"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </Button>
      </div>
    </header>
  );
}
