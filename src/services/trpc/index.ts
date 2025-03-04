import { z } from 'zod'
import { searchUsers, updateUserProfile } from '../actions/userActions'
import { publicProcedure, router } from './util'
import {
  getEventRegistrations,
  getUserRegistrationStatus
} from '../actions/eventActions'
import { getOrganization } from '../actions/organizationActions'
import {
  createRegisterSchema,
  getEventFilterSchema,
  getPublicEventsFilterSchema,
  registrationInputSchema,
  SavedEventSchema
} from '@/schemas/eventSchema'
import {
  SearchUserResultSchema,
  UserRegistrationStatusSchema,
  AuthSchemaSchema
} from '@/schemas/apiSchemas'
import { getEvent } from '../actions/event/getEvent'
import { getPublicEvents } from '../actions/event/getPublicEvents'
import { createRegistration } from '@/lib/event/createRegistration'
import { loginLinkedin } from '@/lib/auth/loginLinkedin'
import { loginGoogle } from '@/lib/auth/loginGoogle'
import { createCheckoutSessionMobile } from '../actions/billing/createCheckoutSessionMobile'
import { markRegistrationPaidMobile } from '../actions/event/markRegistrationPaidMobile'
import getCommunities from '@/services/actions/communities/getCommunities'
import { GetCommunitiesParamsSchema } from '@/schemas/communitySchema'
import getCommunityDetails from '../actions/communities/getCommunityDetails'
import { getTicketsWithEvents } from '../actions/tickets/ticketActions'
import {
  profileWithPrivacySchema,
  userDataCollectedShema
} from '@/schemas/userSchema'
import { fetchAndFormatUserProfile } from '@/lib/user/fetchAndFormatUserProfile'
import { deleteUser } from '@/lib/user/deleteUser'
import { updateNetworkingProfile } from '@/lib/user/updateNetworkingProfile'
import { getOrganizationsByUser } from '@/lib/organizations/getOrganizationsByUser'
import { getEventsByOrganization } from '@/lib/organizations/getEventsByOrganization'
import { checkInEventTicket } from '@/lib/organizations/checkInEventTicket'
import { checkTicketsAvailability } from '../actions/event/checkTicketsAvailability'
import { checkExistingRegistrationMobile } from '@/lib/event/checkExistingRegistrationMobile'
import { SavedOrganizationSchema } from '@/schemas/organizationSchema'

export const appRouter = router({
  loginLinkedin: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input }) => {
      const result = await loginLinkedin(input)
      return AuthSchemaSchema.parse(result)
    }),
  loginGoogle: publicProcedure
    .input(z.object({ idToken: z.string({ message: 'idToken prob!!' }) }))
    .mutation(async ({ input }) => {
      const result = await loginGoogle(input)
      return AuthSchemaSchema.parse(result)
    }),
  searchUsers: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const result = await searchUsers(input.query)
      return SearchUserResultSchema.parse(result)
    }),

  getPublicEvents: publicProcedure
    .input(z.optional(getPublicEventsFilterSchema))
    .query(async ({ input }) => {
      const events = await getPublicEvents(input)
      return events
    }),

  getEvent: publicProcedure
    .input(getEventFilterSchema)
    .query(async ({ input }) => {
      const event = await getEvent(input)
      return SavedEventSchema.parse(event)
    }),

  createRegistration: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        registrationData: registrationInputSchema
      })
    )
    .mutation(async ({ input, ctx }) => {
      const registration = await createRegistration(
        ctx.user,
        input.eventId,
        input.registrationData
      )

      return createRegisterSchema.parse(registration)
    }),

  getUserRegistrationStatus: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        userId: z.string()
      })
    )
    .query(async ({ input }) => {
      const status = await getUserRegistrationStatus(
        input.eventId,
        input.userId
      )
      return UserRegistrationStatusSchema.parse(status)
    }),

  getOrganization: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const organization = await getOrganization(input)
      if (!organization) throw new Error('Organization not found')
      return SavedOrganizationSchema.parse(organization)
    }),
  checkExistingRegistration: publicProcedure
    .input(
      z.object({
        eventId: z.string()
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        return null
      }

      return await checkExistingRegistrationMobile(
        input.eventId,
        ctx.user.email
      )
    }),

  createCheckoutSession: publicProcedure
    .input(
      z.object({
        registrationId: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const session = await createCheckoutSessionMobile(input.registrationId)
      return session
    }),
  markRegistrationPaid: publicProcedure
    .input(
      z.object({
        registrationId: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const status = await markRegistrationPaidMobile(input.registrationId)
      return status
    }),
  getCommunities: publicProcedure
    .input(z.optional(GetCommunitiesParamsSchema))
    .query(async ({ input }) => {
      const communties = await getCommunities(input)
      return communties
    }),

  getCommunityDetails: publicProcedure
    .input(
      z.object({
        communityId: z.string()
      })
    )
    .query(async ({ input }) => {
      const communties = await getCommunityDetails(input.communityId)
      return communties
    }),
  getTicketsWithEvents: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error('User not signed in')
    }

    const tickets = await getTicketsWithEvents(ctx.user?.id)
    return tickets
  }),
  getUserProfile: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error('User not signed in')
    }

    return await fetchAndFormatUserProfile(ctx.user?.id, true)
  }),
  updateUserProfile: publicProcedure
    .input(profileWithPrivacySchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not signed in')
      }
      if (input.id !== ctx.user.id) {
        throw new Error("You don't have permession")
      }

      const response = await updateUserProfile(input)
      return {
        success: response.success,
        user: profileWithPrivacySchema.parse(response.user)
      }
    }),
  deleteUserAccount: publicProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error('User not signed in')
    }
    return await deleteUser(ctx.user.id)
  }),
  saveNetworkingProfile: publicProcedure
    .input(userDataCollectedShema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not signed in')
      }
      return await updateNetworkingProfile(ctx.user.id, input)
    }),
  getOrganizationsByCurrentUser: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error('User not signed in')
    }

    return await getOrganizationsByUser(ctx.user?.id, true)
  }),
  getEventsByOrganization: publicProcedure
    .input(
      z.object({
        organizationId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not signed in')
      }

      return await getEventsByOrganization(input.organizationId, ctx.user?.id)
    }),
  getEventRegistrations: publicProcedure
    .input(
      z.object({
        eventId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not signed in')
      }

      return await getEventRegistrations(input.eventId)
    }),
  checkInTicket: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        ticketId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not signed in')
      }

      return await checkInEventTicket(
        input.eventId,
        input.ticketId,
        ctx.user.id
      )
    }),
  checkTicketsAvailability: publicProcedure
    .input(
      z.object({
        ticketOfferingsIds: z.array(z.string())
      })
    )
    .mutation(async ({ input }) => {
      return await checkTicketsAvailability(input.ticketOfferingsIds)
    })
})

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
