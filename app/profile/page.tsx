import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/profile')

  const { data: profile } = await supabase.from('profiles').select('full_name,phone,preferred_language,preferred_theme').eq('id', user.id).maybeSingle()

  return <ProfileForm email={user.email ?? ''} profile={profile} />
}
