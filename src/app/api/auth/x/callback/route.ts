import axios from 'axios'
import oauth from 'oauth-1.0a'
import crypto from 'crypto'
import { NextResponse } from 'next/server'

const X_API_KEY = process.env.X_API_KEY as string
const X_API_SECRET = process.env.X_API_SECRET as string
const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL as string
const oauth1 = new oauth({
  consumer: {
    key: X_API_KEY,
    secret: X_API_SECRET
  },
  signature_method: 'HMAC-SHA1',
  hash_function: (baseString: string, key: string): string => {
    return crypto.createHmac('sha1', key).update(baseString).digest('base64')
  }
})

export async function GET(): Promise<NextResponse> {
  try {
    const url = NEXT_PUBLIC_URL + '/admin'

    const requestTokenUrl = 'https://api.twitter.com/oauth/request_token'
    const requestTokenResponse = await axios.post(requestTokenUrl, null, {
      headers: Object.fromEntries(
        Object.entries(
          oauth1.toHeader(
            oauth1.authorize({
              url: requestTokenUrl,
              method: 'POST'
            })
          )
        )
      )
    })

    const requestToken = new URLSearchParams(requestTokenResponse.data)
    const oauthToken = requestToken.get('oauth_token')
    const oauthTokenSecret = requestToken.get('oauth_token_secret')

    if (!oauthToken || !oauthTokenSecret) {
      return NextResponse.json(
        { error: 'Failed to obtain OAuth tokens.' },
        { status: 500 }
      )
    }

    const authorizationUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}&redirect_uri=${encodeURIComponent(url)}`
    return NextResponse.redirect(authorizationUrl)
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in authentication process:', error.message)
    } else {
      console.error('Error in authentication process:', error)
    }
    return NextResponse.json(
      { error: 'Error in the authentication process.' },
      { status: 500 }
    )
  }
}
