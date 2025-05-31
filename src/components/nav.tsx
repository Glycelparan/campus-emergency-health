import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, User, Wifi, WifiOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ProfileDialog } from '@/components/profile-dialog'

export function Nav() {
  const { user, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', handleOnlineStatusChange)
    window.addEventListener('offline', handleOnlineStatusChange)

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange)
      window.removeEventListener('offline', handleOnlineStatusChange)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!user) return null

  return (
    <>
      <nav className="bg-red-600 text-white">
        <div className="flex h-16 items-center px-4 container mx-auto justify-between">
          <div className="flex items-center gap-4">
            <h1 
              className="text-xl font-bold cursor-pointer hover:text-red-100 transition-colors"
              onClick={() => navigate('/')}
            >
              Emergency Health Assistant
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isOnline ? (
              <div className="flex items-center text-green-300">
                <Wifi className="h-5 w-5 mr-1" />
                <span className="text-sm">Online</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-300">
                <WifiOff className="h-5 w-5 mr-1" />
                <span className="text-sm">Offline</span>
              </div>
            )}
            {isAdmin && (
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin')}
                className="text-white hover:bg-red-700 hover:text-white"
              >
                Admin Dashboard
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 rounded-full hover:bg-red-700"
                >
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarFallback className="bg-red-700 text-white">
                      {user.email?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    {isAdmin && (
                      <p className="text-xs leading-none text-muted-foreground">Admin</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowProfile(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
      <ProfileDialog open={showProfile} onOpenChange={setShowProfile} />
    </>
  )
} 