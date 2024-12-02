'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

import EventRegistrationTable from './events/EventRegistrationTable'
import EventCommunicationsTable from './events/EventCommunicationsTable'
import { EventRegistrationsSchemaType } from '@/schemas/eventSchema'
import { useTranslations } from 'next-intl'

type Props = {
  registrations: EventRegistrationsSchemaType[]
  eventId: string
}

export function EventAdminView({ registrations, eventId }: Props) {
  const t = useTranslations('DeleteAccount')
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('eventManagement')}</h1>
      <Tabs defaultValue="attendees">
        <TabsList className="mb-4">
          <TabsTrigger value="attendees">{t('attendees')}</TabsTrigger>
          <TabsTrigger value="settings">{t('settings')}</TabsTrigger>
          <TabsTrigger value="communications">
            {t('communications')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="attendees">
          <h2 className="text-xl font-semibold mb-2">
            {t('eventRegistrations')}
          </h2>

          <EventRegistrationTable registrations={registrations} />
        </TabsContent>

        <TabsContent value="communications">
          <h2 className="text-xl font-semibold mb-2">
            {t('eventCommunications')}
          </h2>

          <Button className="mt-4">
            <Send className="w-4 h-4 mr-2" /> {t('sendNewCommunication')}
            <EventCommunicationsTable eventId={eventId} />
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
