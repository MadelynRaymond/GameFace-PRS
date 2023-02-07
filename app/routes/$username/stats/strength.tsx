import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, BarChart, Bar, Label } from 'recharts'
import { requireUser } from '~/session.server'
import { getEntriesAggregate, getEntriesAverage, getEntriesByDrillLiteral } from '~/models/drill-entry.server'
import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useCatch, useFetcher, useLoaderData } from '@remix-run/react'
import { dateFromDaysOptional, toDateString } from '~/util'
import { useState, useReducer, useEffect } from 'react'
import { z } from 'zod'

const SquatEntrySchema = z
    .object({
        created_at: z.coerce.string().transform((data) => toDateString(data)),
        value: z.coerce.number(),
        outOf: z.nullable(z.number()),
    })
    .array()
    .transform((data) => data.map((s) => ({ time: s.value, created_at: s.created_at })))

const JumpDistanceEntrySchema = z
    .object({
        created_at: z.coerce.string().transform((data) => toDateString(data)),
        value: z.coerce.number(),
        outOf: z.nullable(z.number()),
    })
    .array()
    .transform((data) => data.map((s) => ({ distance: s.value, created_at: s.created_at })))

export async function loader({ request }: LoaderArgs) {
    const {username, id} = await requireUser(request)
    const userId = id

    const url = new URL(request.url)
    const filter = url.searchParams.get('interval')
    const intervalLiteral = filter ? parseInt(filter) : null
    const interval = dateFromDaysOptional(intervalLiteral)

    const squatEntryData = await getEntriesByDrillLiteral({drillName: "Squat Drill", userId, interval})
    const jumpDistanceData = await getEntriesByDrillLiteral({drillName: "Jump Distance Drill", userId, interval})

    const insufficientData = !squatEntryData || !jumpDistanceData

    if (insufficientData) {
        throw new Response('Not enough data', { status: 404 })
    }

    try {
        const [squatEntries, jumpDistanceEntries] = await Promise.all([
            SquatEntrySchema.parseAsync(squatEntryData),
            JumpDistanceEntrySchema.parseAsync(jumpDistanceData)
        ])

        const jumpDistanceAggregate = await getEntriesAggregate({drillName: "Jump Distance Drill", userId, interval})
        const [bestJumpDistance, averageJumpDistance] = [jumpDistanceAggregate.max, jumpDistanceAggregate.average]
        const squatAverage = await (await getEntriesAverage({drillName: "Squat Drill", userId, interval}))._avg

        return json({
            bestJumpDistance,
            averageJumpDistance,
            username,
            squatEntries,
            jumpDistanceEntries,
            squatAverage
        })
    }
    catch (error) {
        throw new Response("Internal server error", {status: 500})
    }

}

export default function Strength() {
    const {username, bestJumpDistance, averageJumpDistance, jumpDistanceEntries, squatEntries, squatAverage} = useLoaderData<typeof loader>()

    const intervalReducer = (_state: {text: string}, action: {type: 'update', payload?: number}): {text: string} => {
        if (action.type !== 'update'){
           throw new Error("Unknown action") 
        }

        switch (action.payload) {
            case 30: return {text: 'Last 30 days'}
            case 365: return {text: "Last year"}
            default: return {text: 'Lifetime'}
        }
    }
    const filter = useFetcher<typeof loader>()
    const [interval, setInterval] = useState<number | undefined>(undefined)
    const [state, dispatch] = useReducer(intervalReducer, {text: ''})

    useEffect(() => {
        filter.load(`/${username}/stats/strength?interval=${interval}`)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interval])

    useEffect(() => {
        dispatch({type: 'update', payload: interval})
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter.data])

    let orange = '#EDA75C'
    let orangeAccent = '#E58274'
    let black = '#000000'
    let strokeWidth = 4
    
    return (
        <div>
            <div className="report-card-header">
                <div className="report-card-title">
                    <h2>Strength Statistics </h2>
                    <p>Athlete: Danielle Williams (Year Overview)</p>
                </div>
                <div className="button-group">
                    <p className="filter-heading">Select Filter:</p>
                    <div className="filter-button-group">
                        <button onClick={() => setInterval(30)} className="filter-button month">Month</button>
                        <button onClick={() => setInterval(365)} className="filter-button year">Year</button>
                        <button onClick={() => setInterval(undefined)} className="filter-button lifetime">Lifetime</button>
                    </div>
                </div>
                </div>
            <div className="stat-grid">
                <div className="stat-box-group">
                    <div className="stat-box accent">
                        <p className="stat-box__title">Best Jump (Distance)</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.bestJumpDistance || bestJumpDistance}ft</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                    <div className="stat-box dots">
                        <p className="stat-box__title">Avg. Jump (Distance)</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.averageJumpDistance?.toFixed(1) || averageJumpDistance?.toFixed(1)}</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                    <div className="stat-box accent-2">
                        <p className="stat-box__title">Avg. Squat Duration</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.squatAverage?.value?.toFixed(1) || squatAverage?.value?.toFixed(1)}s</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                </div>
                <div className="flex align-center flex-col gap-1 graph-container">
                    <p>{state.text} Jump Distance</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart width={730} height={400} data={filter?.data?.jumpDistanceEntries || jumpDistanceEntries}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="created"></XAxis>
                            <YAxis label={{ value: 'Distance', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="distance" fill={orangeAccent} stroke={black} strokeWidth={strokeWidth}>
                                <Label value="Session Date" position="top" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>{state.text}: Squat Duration w/Weight</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart width={730} height={250} data={filter?.data?.squatEntries || squatEntries}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="time" stackId="a"  fill={orange} stroke={black} strokeWidth={strokeWidth}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>Lifetime Overview: Best Squat Duration w/Weights</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart width={730} height={250} data={filter?.data?.squatEntries || squatEntries}>
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={orange} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={orange} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="created" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="time" stroke={black} strokeWidth={strokeWidth} fillOpacity={1} fill="url(#colorUv)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

export function CatchBoundary() {
    const caught = useCatch()

    if (caught.status === 404) {
        return (
            <div className="flex justify-center">
                <h2>Not enough data</h2>
            </div>
        )
    }

    throw new Error(`Unexpected caught response with status: ${caught.status}`)
}
