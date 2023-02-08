import type { StudentProfile, User } from '@prisma/client'
import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useFetcher, useLoaderData, useLocation, useNavigate } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { getAthletes } from '~/models/athlete.server'
import { updateStatus } from '~/models/user.server'

export async function loader({ request }: LoaderArgs) {
    const athletes = await getAthletes()
    return json({ athletes })
}

export async function action({request}: ActionArgs) {
    const formData = await request.formData()
    const athleteId = formData.get("athleteId")

    invariant(athleteId, "This should not happen")

    await updateStatus(parseInt(athleteId as string))

    return null
}
export default function Athletes() {
    const { athletes } = useLoaderData<typeof loader>()

    if (athletes.length === 0) {
        return (
            <div>
                <h2>No Student-Athletes Exist</h2>
            </div>
        )
    }

    

    return (
        <div>
            <div className="flex justify-center">
                <h2>Student-Athletes</h2>
            </div>
            <table className="athlete-table">
                <thead>
                    <tr className="active-row">
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>School</th>
                        <th>Grade</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {athletes.map((athlete) => (
                        <AthleteTableRow key={athlete.id} athlete={athlete} />
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function AthleteTableRow({ athlete }: { athlete: { profile: StudentProfile | null; id: User['id'], status: User['status'] } }) {
    const navigate = useNavigate()
    const location = useLocation()
    const fetcher = useFetcher<typeof action>()

    const updateAthleteStatus = async (athleteId: number) => {
        fetcher.submit({athleteId: athleteId.toString()}, {method: 'post'})
    }

    return (
        <tr style={{ cursor: 'pointer' }} key={athlete.id}>
            <td>{athlete.profile?.firstName}</td>
            <td>{athlete.profile?.lastName}</td>
            <td>{athlete.profile?.school}</td>
            <td>{athlete.profile?.grade}</td>
            <td onClick={() => updateAthleteStatus(athlete.id)}>
                <button style={{fontSize: '0.5em'}} className={athlete.status === 'ACTIVE' ? 'btn btn--green' : 'btn btn--red'}>{athlete.status}</button>
            </td>
            <td onClick={() => navigate(`${location.pathname}/${athlete.id}`)} >...</td>
        </tr>
    )
}
