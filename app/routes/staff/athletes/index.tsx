import type { StudentProfile, User } from '@prisma/client'
import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData, useLocation, useNavigate } from '@remix-run/react'
import { getAthletes } from '~/models/athlete.server'

export async function loader({ request }: LoaderArgs) {
    const athletes = await getAthletes()
    return json({ athletes })
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

    return (
        <tr style={{ cursor: 'pointer' }} onClick={(e) => navigate(`${location.pathname}/${athlete.id}`)} key={athlete.id}>
            <td>{athlete.profile?.firstName}</td>
            <td>{athlete.profile?.lastName}</td>
            <td>{athlete.profile?.school}</td>
            <td>{athlete.profile?.grade}</td>
            <td>{athlete.status}</td>
            <td>...</td>
        </tr>
    )
}
