import type { LoaderArgs } from '@remix-run/node'
import { json, Response } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import React from 'react'
import invariant from 'tiny-invariant'
import { getAthleteWithReports } from '~/models/athlete.server'
import { getDrills } from '~/models/drill.server'
import { getExerciseCategories } from '~/models/exercise-category.server'

export async function loader({ request, params }: LoaderArgs) {
    invariant(params.athleteId, 'Not athlete id in params')

    const athleteId = parseInt(params.athleteId)

    const [athlete, categories,drills] = await Promise.all([getAthleteWithReports(athleteId), getExerciseCategories(), getDrills()])

    if (!athlete) {
        throw new Response('Not Found', { status: 404 })
    }

    return json({
        reports: athlete.reports,
        profile: athlete.profile,
        categories,
        drills,
    })
}

type DrillUnit = 'integral' | 'decimal' | 'time'

export default function AthleteDetails() {
    const { profile, drills, categories } = useLoaderData<typeof loader>()
    const [category, setCategory] = React.useState<number>(0)

    
    return (
        <div className="athlete-overview-container">
            <div className="athlete-reports">
                <h2>
                    {profile?.firstName} {profile?.lastName}
                </h2>
            </div>  
            <div className="athlete-report-form">
                <select style={{marginBottom: '1rem'}} onChange={(e) => setCategory(parseInt(e.currentTarget.value))} name="" id="">
                    <option  value="0">Filter Category</option>
                    {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                {drills.map((drill) => (
                    <EntryField visible={drill.categoryId === category || category === 0} key={drill.id} drillName={drill.name} drillUnit={drill.drillUnit as DrillUnit} />
                ))}
            </div>
        </div>
    )
}

function EntryField({ drillName, drillUnit, visible }: { drillName: string; drillUnit: DrillUnit, visible: boolean }) {
    const normalizeLabels = () => {
        const labelMap = {
            integral: ['Score', 'Out Of'],
            decimal: ['Score (Avg)', 'Best'],
            time: ['Time (Avg)', 'Best'],
        }
        return labelMap[drillUnit]
    }

    const [fieldOne, fieldTwo] = normalizeLabels()

    return (
        <div style={{display: `${visible ? 'block' : 'none'}`}}>
            <p className='bold'>{drillName}</p>
            <div className="flex gap-2">
                <div className="w-full">
                    <label htmlFor="score">{fieldOne}</label>
                    <input type="text" name="" id="" />
                </div>
                <div className="w-full">
                    <label htmlFor="out-of">{fieldTwo}</label>
                    <input type="text" name="" id="" />
                </div>
            </div>
        </div>
    )
}
