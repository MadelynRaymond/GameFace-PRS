import type { LoaderArgs } from '@remix-run/node'
import { json, Response } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { getAthleteWithReports } from '~/models/athlete.server'
import { getExerciseCategories } from '~/models/exercise-category.server'

export async function loader({ request, params }: LoaderArgs) {
    invariant(params.athleteId, 'Not athlete id in params')

    const athleteId = parseInt(params.athleteId)

    const [athlete, categories] = await Promise.all([getAthleteWithReports(athleteId), getExerciseCategories()])

    if (!athlete) {
        throw new Response('Not Found', { status: 404 })
    }

    if (!categories) {
        throw new Response('Unexpected Error', { status: 500 })
    }

    return json({
        reports: athlete.reports,
        profile: athlete.profile,
        categories,
    })
}

export default function AthleteDetails() {
    const { reports, profile, categories } = useLoaderData<typeof loader>()

    return (
        <div className="athlete-overview-container">
            <div className="athlete-reports">
                <h2>
                    {profile?.firstName} {profile?.lastName}
                </h2>
                <pre>{JSON.stringify(reports)}</pre>
                <pre>{JSON.stringify(profile)}</pre>
                <pre>{JSON.stringify(categories)}</pre>
            </div>
            <div className="athlete-report-form">
                <label htmlFor="time-drill">Completion time: </label>
                <input type="text" name="" id="" />
                <div className="flex gap-2">
                    <div>
                        <label htmlFor="score">Score</label>
                        <input type="text" name="" id="" />
                    </div>
                    <div>
                        <label htmlFor="out-f">Out of</label>
                        <input type="text" name="" id="" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <div>
                        <label htmlFor="score">Score</label>
                        <input type="text" name="" id="" />
                    </div>
                    <div>
                        <label htmlFor="out-f">Out of</label>
                        <input type="text" name="" id="" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <div>
                        <label htmlFor="score">Score</label>
                        <input type="text" name="" id="" />
                    </div>
                    <div>
                        <label htmlFor="out-f">Out of</label>
                        <input type="text" name="" id="" />
                    </div>
                </div>
            </div>
        </div>
    )
}
