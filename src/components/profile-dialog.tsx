import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface Profile {
  id: string
  full_name: string
  student_id: string
  phone_number: string
  emergency_contact: string
  medical_conditions: string
  allergies: string
  blood_type: string
}

export function ProfileDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const { user, isAdmin } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setProfile(data)
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-red-700 text-white">
                {user.email?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <span>Profile Information</span>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading profile...</div>
          ) : profile ? (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Email</div>
                <div className="col-span-3">{user.email}</div>
              </div>
              <Separator />
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Full Name</div>
                <div className="col-span-3">{profile.full_name || 'Not set'}</div>
              </div>
              {!isAdmin && (
                <>
                  <Separator />
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium">Student ID</div>
                    <div className="col-span-3">{profile.student_id || 'Not set'}</div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium">Phone</div>
                    <div className="col-span-3">{profile.phone_number || 'Not set'}</div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium">Emergency Contact</div>
                    <div className="col-span-3">{profile.emergency_contact || 'Not set'}</div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium">Medical Conditions</div>
                    <div className="col-span-3">{profile.medical_conditions || 'None'}</div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium">Allergies</div>
                    <div className="col-span-3">{profile.allergies || 'None'}</div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium">Blood Type</div>
                    <div className="col-span-3">{profile.blood_type || 'Not set'}</div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center text-muted-foreground">Failed to load profile</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 