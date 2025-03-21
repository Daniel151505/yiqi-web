import { QueueJob } from '@prisma/client'
import { sendUserEventConfirmed } from './sendUserEventConfirmed'
import { sendUserPaymentReminder } from './sendUserPaymentReminder'
import { sendUserPaymentConfirmed } from './sendUserPaymentConfirmed'
import { sendUserEventReminder } from './sendUserEventReminder'

export async function handleNotificationJob(job: QueueJob) {
  switch (job.notificationType) {
    case 'RESERVATION_CONFIRMED':
      await sendUserEventConfirmed(job)
      break
    case 'RESERVATION_PAYMENT_REMINDER':
      await sendUserPaymentReminder(job)
      break
    case 'PAYMENT_CONFIRMED':
      await sendUserPaymentConfirmed(job)
      break
    case 'RESERVATION_REMINDER':
      await sendUserEventReminder(job)
      break
    default:
      console.warn(`Unhandled notification type: ${job.notificationType}`)
  }
}
