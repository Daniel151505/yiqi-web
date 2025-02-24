import { getUser } from '@/lib/auth/lucia'
import { redirect } from 'next/navigation'
import { Roles } from '@prisma/client'
import ActiveChatComponent from '@/components/chat/activeChat'
import ConnectedChat from '@/components/chat/connectedChat'
import { getOrganizationMessageThreads } from '@/services/actions/communications/getOrganizationMessageThreads'
import { getUserMessageList } from '@/services/actions/communications/getUserMessageList'
import { ChatSection } from '../ChatSection'

export default async function Page({
  params
}: {
  params: { id: string; userId: string }
}) {
  const user = await getUser()

  const chats = await getOrganizationMessageThreads(params.id)
  const messages = await getUserMessageList(params.userId, params.id)
  console.log('messages', messages.length)
  console.log('id ', params.id)

  if (user) {
    if (user.role === Roles.ADMIN) {
      return (
        <ChatSection orgId={params.id} isActive={true}>
          <ActiveChatComponent
            orgId={params.id}
            chats={chats}
            activeUserId={params.userId}
          >
            <ConnectedChat
              defaultMessages={messages}
              userId={params.userId}
              orgId={params.id}
              allowedMessageTypes={['email']}
            />
          </ActiveChatComponent>
        </ChatSection>
      )
    } else if (user.role === Roles.NEW_USER) {
      redirect(`/newuser`)
    }
  }
}
