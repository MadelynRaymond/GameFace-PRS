import type { StudentProfile, User } from '@prisma/client'
import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useFetcher, useLoaderData, useLocation, useNavigate } from '@remix-run/react'
import { SyntheticEvent, useRef } from 'react'
import invariant from 'tiny-invariant'
import { getAthletes } from '~/models/athlete.server'
import { updateStatus } from '~/models/user.server'
import { requireStaff } from '~/session.server'

export async function loader({ request }: LoaderArgs) {
    await requireStaff(request)
    const athletes = await getAthletes()
    const url = new URL(request.url)
    const name = url.searchParams.get('name-filter')

    const filteredAthletes = name ? athletes.filter(
        (athlete) =>
            athlete.profile?.firstName
            .toLowerCase()
            .includes(name.toLowerCase()) 
            ||
            athlete.profile?.lastName
            .toLowerCase()
            .includes(name.toLowerCase())

    ) : athletes


    return json({ filteredAthletes })
}

export async function action({ request }: ActionArgs) {
    const formData = await request.formData()
    const athleteId = formData.get('athleteId')

    invariant(athleteId, 'This should not happen')

    await updateStatus(parseInt(athleteId as string))

    return null
}
export default function Athletes() {
    const { filteredAthletes } = useLoaderData<typeof loader>()
    const nameFilterRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()


    const clearNameFilter = (e: SyntheticEvent) => {
        e.stopPropagation()
        if (nameFilterRef.current) {
            nameFilterRef.current.value = ''
        }
        //trigger loader
        navigate('.', { replace: true })
    }

    return (
        <div>
            <div className="flex justify-center">
                <h2>Student-Athletes</h2>
            </div>
            <div className="athlete-table-container">
                <div>
                    <Form method="get">
                        <input ref={nameFilterRef} type="text" name="name-filter" id="name-filter" placeholder="Filter by Name" />
                    </Form>
                    <button className='btn' onClick={clearNameFilter}>Reset</button>
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
                        {filteredAthletes.map((athlete) => (
                            <AthleteTableRow key={athlete.id} athlete={athlete} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function AthleteTableRow({ athlete }: { athlete: { profile: StudentProfile | null; id: User['id']; status: User['status'] } }) {
    const navigate = useNavigate()
    const location = useLocation()
    const fetcher = useFetcher<typeof action>()

    const updateAthleteStatus = async (athleteId: number) => {
        fetcher.submit({ athleteId: athleteId.toString() }, { method: 'post' })
    }

    return (
        <tr style={{ cursor: 'pointer' }} key={athlete.id}>
            <td>{athlete.profile?.firstName}</td>
            <td>{athlete.profile?.lastName}</td>
            <td>{athlete.profile?.school}</td>
            <td>{athlete.profile?.grade}</td>
            <td onClick={() => updateAthleteStatus(athlete.id)}>
                <button className={athlete.status === 'ACTIVE' ? 'btn btn--green athlete-table-btn' : 'btn btn--red athlete-table-btn' }>
                    {athlete.status}
                </button>
            </td>
            <td>
                <div className="student-table-btn-group">
                    <button className="btn athlete-table-btn" onClick={() => navigate(`${location.pathname}/${athlete.id}`)}>Update Stats</button>
                </div>
            
            </td>
        </tr>
    )
}
