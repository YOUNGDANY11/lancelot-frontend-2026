import { LogOut, Moon, Sun, UserRound } from 'lucide-react'
import { Link } from 'react-router'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { USER_MENU_TEXTS } from '@/constants/authTexts'
import { APP_ROUTES } from '@/constants/routes'
import { THEME_LABELS } from '@/constants/theme'
import { useNavigationController } from '@/controllers/useNavigationController'
import { useSessionController } from '@/controllers/useSessionController'
import { useTheme } from '@/hooks/useTheme'

export function UserMenu() {
  const { user, fullName, initials, roleLabel, logout, isLoggingOut } = useSessionController()
  const { theme, toggleTheme } = useTheme()
  const { settingsItem } = useNavigationController()
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-11 gap-2 px-1.5 sm:px-2"
          aria-label={USER_MENU_TEXTS.trigger}
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-40 flex-col items-start text-left leading-tight sm:flex">
            <span className="truncate text-sm font-medium">{user?.name}</span>
            <span className="truncate text-xs text-muted-foreground">{roleLabel}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-foreground">{fullName}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{user?.email}</span>
          <span className="mt-1 w-fit rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {roleLabel}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to={APP_ROUTES.profile}>
              <UserRound aria-hidden="true" />
              {USER_MENU_TEXTS.profile}
            </Link>
          </DropdownMenuItem>
          {settingsItem && (
            <DropdownMenuItem asChild>
              <Link to={settingsItem.path}>
                <settingsItem.icon aria-hidden="true" />
                {settingsItem.label}
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={toggleTheme}>
            {nextTheme === 'light' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            {`Cambiar a ${THEME_LABELS[nextTheme].toLowerCase()}`}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={logout} disabled={isLoggingOut}>
          <LogOut aria-hidden="true" />
          {USER_MENU_TEXTS.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
