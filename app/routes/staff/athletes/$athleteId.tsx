import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { json, Response } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { getAthleteWithReports } from '~/models/athlete.server'
import { getDrillsInCategory } from '~/models/drill.server'
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

export async function action({ request }: ActionArgs) {
    const formData = await request.formData()

    const selectedCategory = await formData.get('category')

    invariant(selectedCategory, 'Category not found')

    const categoryId = parseInt(selectedCategory as string)

    const drillsInCategory = await getDrillsInCategory({ categoryId })

    return json({ drills: drillsInCategory })
}

export default function AthleteDetails() {
    const { profile, categories } = useLoaderData<typeof loader>()
    const fetcher = useFetcher<typeof action>()

    return (
        <div className="athlete-overview-container">
            <div className="athlete-reports">
                <h2>
                    {profile?.firstName} {profile?.lastName}
                </h2>
            </div>
            <div className="athlete-report-form">
                <fetcher.Form method="post">
                    <select onChange={(e) => fetcher.submit({ category: e.currentTarget.value }, { method: 'post' })} name="category" id="category">
                        <option value="0">Select Category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </fetcher.Form>
                <div>{fetcher.data && fetcher.data.drills.map((drill) => <EntryField key={drill.id} drillName={drill.name} />)}</div>
            </div>
        </div>
    )
}

function EntryField({ drillName }: { drillName: string }) {
    return (
        <>
            <p>{drillName}</p>
            <div className="flex gap-2">
                <div>
                    <label htmlFor="score">Score</label>
                    <input type="text" name="" id="" />
                </div>
                <div>
                    <label htmlFor="out-of">Out of</label>
                    <input type="text" name="" id="" />
                </div>
            </div>
        </>
    )
}
