import { createCookieSessionStorage, redirect } from '@remix-run/node'

import type { User } from '~/models/user.server'
import { getUserById } from '~/models/user.server'
import { getAthleteById } from './models/athlete.server'
import { StudentProfile } from '@prisma/client'

export const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: '__session',
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secrets: ['my#S3CR3TChangeL8tr'],
        secure: process.env.NODE_ENV === 'production',
    },
})

const USER_SESSION_KEY = 'userId'

export async function getSession(request: Request) {
    const cookie = request.headers.get('Cookie')
    return sessionStorage.getSession(cookie)
}

export async function getUserId(request: Request): Promise<User['id'] | undefined> {
    const session = await getSession(request)
    const userId = session.get(USER_SESSION_KEY)
    return userId
}

export async function getUser(request: Request) {
    const userId = await getUserId(request)
    if (userId === undefined) return null

    const user = await getUserById(userId)
    if (user) return user

    throw await logout(request)
}

export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
    const userId = await getUserId(request)
    if (!userId) {
        //const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
        throw redirect(`/login`)
    }
    return userId
}

export async function fetchAthlete(user: User & {profile: StudentProfile | null}, username: string) {
    return user.role === 'STAFF' ? await getAthleteById(parseInt(username)) : user
}

export async function requireUser(request: Request) {
    const userId = await requireUserId(request)

    const user = await getUserById(userId)
    if (user) return user

    throw await logout(request)
}

export async function requireStaff(request: Request) {
    const user = await requireUser(request)
    const isStaff = user.role === 'STAFF'
    if (!isStaff) throw redirect('/')

}

export async function createUserSession({
    request,
    userId,
    remember,
    redirectTo,
}: {
    request: Request
    userId: number
    remember: boolean
    redirectTo: string
}) {
    const session = await getSession(request)
    session.set(USER_SESSION_KEY, userId)
    return redirect(redirectTo, {
        headers: {
            'Set-Cookie': await sessionStorage.commitSession(session, {
                maxAge: remember
                    ? 60 * 60 * 24 * 7 // 7 days
                    : undefined,
            }),
        },
    })
}

export async function logout(request: Request) {
    const session = await getSession(request)
    return redirect('/login', {
        headers: {
            'Set-Cookie': await sessionStorage.destroySession(session),
        },
    })
}
