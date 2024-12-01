'use client'

import { EventRegistrationSchemaType } from '@/schemas/eventSchema'
import CheckinButton from './CheckinButton'
import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { translations } from '@/lib/translations/translations'

export default function EventCheckinTable({
  eventId,
  registrations,
  ticketId
}: {
  eventId: string
  registrations: EventRegistrationSchemaType[]
  ticketId?: string
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 1500)

  // Memoize the filtered results
  const filteredRegistrations = useMemo(
    () =>
      debouncedSearchQuery.length
        ? registrations.filter(registration =>
            registration.user?.name
              ?.toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase())
          )
        : registrations,
    [registrations, debouncedSearchQuery]
  )

  return (
    <div className="space-y-4 bg-white">
      <div className="p-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={translations.es.eventCheckInSearchByName}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                {translations.es.eventCheckInTableName}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                {translations.es.eventCheckInTableTicketId}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                {translations.es.eventCheckInTableCheckIn}
              </th>
              <th className="px-6 py-3 border-b border-gray-200"></th>
            </tr>
          </thead>
          <tbody>
            {filteredRegistrations.map(registration =>
              registration.tickets.map(ticket => (
                <tr
                  key={ticket.id}
                  className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {registration.user?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {ticket.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {ticket.checkedInDate
                      ? ticket.checkedInDate.toLocaleString()
                      : 'No'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <CheckinButton
                      eventId={eventId}
                      ticket={ticket}
                      selected={ticket.id === ticketId}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
