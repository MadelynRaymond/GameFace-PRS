import type { ActionArgs, LoaderArgs} from '@remix-run/node';
import { redirect } from '@remix-run/node'
import { json, Response } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import React from 'react'
import invariant from 'tiny-invariant'
import { getAthleteWithReports } from '~/models/athlete.server'
import { getDrills } from '~/models/drill.server'
import { getExerciseCategories } from '~/models/exercise-category.server'
import qs from 'qs'
import { createEntryOnReport } from '~/models/drill-entry.server'
import { createAthleteReport } from '~/models/athlete-report.server'

export async function loader({ request, params }: LoaderArgs) {
    invariant(params.athleteId, 'Not athlete id in params')

    const athleteId = parseInt(params.athleteId)

    const [athlete, categories, drills] = await Promise.all([getAthleteWithReports(athleteId), getExerciseCategories(), getDrills()])

    if (!athlete) {
        throw new Response('Not Found', { status: 404 })
    }

    return json({
        reports: athlete.reports,
        athlete,
        categories,
        drills,
    })
}
export async function action({ request, params }: ActionArgs) {
    invariant(params.athleteId, 'No athlete Id')

    const athleteId = parseInt(params.athleteId)
    const text = await request.text()
    const formData = qs.parse(text) as unknown as {
        entries: Array<{ unit: string; value: string; bestScore?: string; outOf?: string; drillId: string; userId: string }>
    }

    if (formData.entries.some((field) => Object.values(field).some((prop) => prop === ''))) {
        return json({ error: 'Please make sure all fields are filled' })
    }

    const report = await createAthleteReport(athleteId)

    const normalizedEntries = formData.entries.map((entry) => ({
        ...entry,
        value: parseInt(entry.value),
        userId: parseInt(entry.userId),
        drillId: parseInt(entry.drillId),
        bestScore: entry.bestScore ? parseInt(entry.bestScore) : undefined,
        outOf: entry.outOf ? parseInt(entry.outOf) : undefined,
    }))

    await createEntryOnReport(report.id, normalizedEntries)

    return redirect('/staff/athletes')
}
type DrillUnit = 'integral' | 'decimal' | 'time'

export default function AthleteDetails() {
    const { athlete, drills, categories } = useLoaderData<typeof loader>()
    const [category, setCategory] = React.useState<number>(0)
    const fetcher = useFetcher()

    return (
        <div className="athlete-overview-container">
            
            <div className="athlete-report-form">
                <select style={{ marginBottom: '1rem' }} onChange={(e) => setCategory(parseInt(e.currentTarget.value))} name="" id="">
                    <option value="0">Filter Category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <fetcher.Form method="post">
                    {drills.map((drill, i) => (
                        <EntryField
                            visible={drill.categoryId === category || category === 0}
                            key={drill.id}
                            id={drill.id}
                            index={i}
                            drillName={drill.name}
                            drillUnit={drill.drillUnit as DrillUnit}
                        />
                    ))}

                    <button type="submit">Submit</button>
                </fetcher.Form>
            </div>
        </div>
    )
}

function EntryField({ drillName, drillUnit, visible, id, index }: { drillName: string; drillUnit: DrillUnit; visible: boolean; id: number, index: number }) {
    const value = React.useRef<HTMLInputElement | null>(null)
    const second = React.useRef<HTMLInputElement | null>(null)
    const { athlete } = useLoaderData<typeof loader>()

    const normalizeLabels = () => {
        const labelMap = {
            integral: ['Score', 'Out Of'],
            decimal: ['Score (Avg)', 'Best'],
            time: ['Time (Avg)', 'Best'],
        }
        return labelMap[drillUnit]
    }

    const normalizeValues = () => {
        const valueMap = {
            integral: ['value', 'outOf'],
            decimal: ['value', 'bestScore'],
            time: ['value', 'bestScore'],
        }

        return valueMap[drillUnit]
    }

    const [fieldOne, fieldTwo] = normalizeLabels()
    const [valueOne, valueTwo] = normalizeValues()

    return (
        <div style={{ display: `${visible ? 'block' : 'none'}` }}>
            <p className="bold">{drillName}</p>
            <input type="hidden" name={`entries[${index}][userId]`} value={athlete.id} />
            <input type="hidden" name={`entries[${index}][unit]`} value={drillUnit} />
            <input type="hidden" name={`entries[${index}][drillId]`} value={id} />
            <div className="flex gap-2">
                <div className="w-full">
                    <label htmlFor="score">{fieldOne}</label>
                    <input ref={value} type="number" name={`entries[${index}][${valueOne}]`} id="" />
                </div>
                <div className="w-full">
                    <label htmlFor="out-of">{fieldTwo}</label>
                    <input ref={second} type="number" name={`entries[${index}][${valueTwo}]`} id="" />
                </div>
            </div>
        </div>
    )
}
