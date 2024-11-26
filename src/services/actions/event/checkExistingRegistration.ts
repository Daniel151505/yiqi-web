'use server'

import prisma from '@/lib/prisma'
import { EventRegistrationSchema } from '@/schemas/eventSchema'

export async function checkExistingRegistration(
  eventId: string,
  email: string
) {
  try {
    const registration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        user: {
          email: email.toLowerCase()
        }
      },
      include: {
        tickets: {
          include: {
            user: true
          }
        },
        user: true,
        event: true
      }
    })

    console.log(registration)
    return EventRegistrationSchema.parse(registration)
  } catch (error) {
    console.error('Error checking registration:', error)
    return null
  }
}
