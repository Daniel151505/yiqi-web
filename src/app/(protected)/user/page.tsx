import { getUser } from '@/lib/auth/lucia'
import { redirect } from 'next/navigation'
import { Roles } from '@prisma/client'
import SignOutButton from '@/components/auth/sign-out'
import { getTranslations } from 'next-intl/server'
import { getUserProfile } from '@/services/actions/userActions'
import { translations } from '@/lib/translations/translations'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import Image from 'next/image'

export default async function Page() {
  const t = await getTranslations('user')
  const user = await getUser()

  if (!user) {
    redirect(`/auth`)
  }

  const userInformation = await getUserProfile(user.id)

  if (!userInformation) {
    return <div>{translations.es.userNotFound}</div>
  }

  if (user.role === Roles.USER) {
    return (
      <main className="flex min-h-[calc(100vh-176px)] items-center justify-center p-4 bg-gradient-to-b from-background/50 to-background">
        <div className="w-full max-w-2xl space-y-6">
          <Card className="border-neutral-800/30 bg-card/90 backdrop-blur-sm">
            <CardHeader className="space-y-6">
              <div className="mx-auto transition-all duration-200 hover:opacity-90">
                <div className="dark:invert">
                  <Image
                    src="/AndinoLabs.svg"
                    alt="Andino Labs Logo"
                    height={100}
                    width={100}
                    className="drop-shadow-sm"
                    priority
                  />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  {t('hello')} {user.name}!
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t('history')}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="pb-8">
              <div className="rounded-lg border border-border/50 bg-muted/50 p-6">
                <p className="text-center text-sm text-muted-foreground">
                  {t('activity')}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <SignOutButton>{t('logout')}</SignOutButton>
          </div>
        </div>
      </main>
    )
  } else if (user.role === Roles.ADMIN) {
    redirect(`/admin`)
  } else if (user.role === Roles.NEW_USER) {
    redirect(`/newuser`)
  } else if (user.role === Roles.ANDINO_ADMIN) {
    redirect(`/andino-admin`)
  }
}
