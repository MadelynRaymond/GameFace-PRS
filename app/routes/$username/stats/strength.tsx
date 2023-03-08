import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, BarChart, Bar, Label } from 'recharts'
import { requireUser } from '~/session.server'
import { getEntriesAggregate, getEntriesAverage, getEntriesByDrillLiteral } from '~/models/drill-entry.server'
import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useCatch, useFetcher, useLoaderData } from '@remix-run/react'
import { dateFromDaysOptional, toDateString } from '~/util'
import { useReducer, useEffect } from 'react'
import { z } from 'zod'

const SquatEntrySchema = z
    .object({
        created_at: z.coerce.string().transform((data) => toDateString(data)),
        value: z.coerce.number(),
        outOf: z.nullable(z.number()),
    })
    .array()
    .transform((data) => data.map((s) => ({ time: s.value, created_at: s.created_at })))

const CalisthenicEntrySchema = z
    .object({
        created_at: z.coerce.string().transform((data) => toDateString(data)),
        value: z.coerce.number(),
        outOf: z.nullable(z.number()),
    })
    .array()
    .transform((data) => data.map((s) => ({ amount: s.value, created_at: s.created_at })))

export async function loader({ request }: LoaderArgs) {
    const {username, id} = await requireUser(request)
    const userId = id

    const url = new URL(request.url)
    const filter = url.searchParams.get('interval')
    const intervalLiteral = filter ? parseInt(filter) : null
    const interval = dateFromDaysOptional(intervalLiteral)

    const squatEntryData = await getEntriesByDrillLiteral({drillName: "Squat Drill", userId, interval})
    const pushUpData = await getEntriesByDrillLiteral({drillName: 'Push Up Drill', userId, interval})
    const pullUpData = await getEntriesByDrillLiteral({drillName: "Pull Up Drill", userId, interval})

    const insufficientData = squatEntryData.length === 0 || pushUpData.length === 0

    if (insufficientData) {
        throw new Response('Not enough data', { status: 404 })
    }

    try {
        const [squatEntries, pushUpEntries, pullUpEntries] = await Promise.all([
            SquatEntrySchema.parseAsync(squatEntryData),
            CalisthenicEntrySchema.parseAsync(pushUpData),
            CalisthenicEntrySchema.parseAsync(pullUpData)
        ])

        const squatAverage = await (await getEntriesAverage({drillName: "Squat Drill", userId, interval}))._avg
        const pushUpMax = await (await getEntriesAggregate({drillName: "Push Up Drill", userId, interval})).max
        const pullUpMax = await (await getEntriesAggregate({drillName: "Pull Up Drill", userId, interval})).max


        return json({
            username,
            squatEntries,
            pushUpEntries,
            squatAverage,
            pushUpMax,
            pullUpEntries,
            pullUpMax
        })
    }
    catch (error) {
        throw new Response("Internal server error", {status: 500})
    }

}

export default function Strength() {
    const {username, pushUpEntries, pushUpMax, squatEntries, squatAverage, pullUpEntries, pullUpMax} = useLoaderData<typeof loader>()
    
    const intervalReducer = (_state: { text: string, touched: boolean }, action: { type: 'update'; payload?: number }): { text: string, touched: boolean, interval?: number } => {
        if (action.type !== 'update') {
            throw new Error('Unknown action')
        }

        switch (action.payload) {
            case 30:
                return { text: 'Last 30 days', touched: true, interval: 30 }
            case 365:
                return { text: 'Last year', touched: true, interval: 365 }
            default:
                return { text: 'Lifetime', touched: true }
        }
    }

    const filter = useFetcher<typeof loader>()
    const [state, dispatch] = useReducer(intervalReducer, { text: 'Lifetime', touched: false })

    useEffect(() => {
        if (state.touched) {
            filter.load(`/${username}/stats/strength?interval=${state.interval}`)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state])

    let orange = '#EDA75C'
    let orangeAccent = '#E58274'
    let black = '#000000'
    let strokeWidth = 4
    
    return (
        <div className='stats-summary'>
            <div className="report-card-header">
                <div className="report-card-title">
                    <h2>Strength Statistics </h2>
                    <p>Athlete: Danielle Williams</p>
                </div>
                <div className="button-group">
                    <p className="filter-heading">Select Filter:</p>
                    <div className="filter-button-group">
                        <button onClick={() => dispatch({type: 'update', payload: 30})} className="filter-button month">Month</button>
                        <button onClick={() => dispatch({type: 'update', payload: 365})} className="filter-button year">Year</button>
                        <button onClick={() => dispatch({type: 'update'})} className="filter-button lifetime">Lifetime</button>
                    </div>
                </div>
                </div>
            <div className="stat-grid">
                <div className="stat-box-group">
                    <div className="stat-box accent">
                        <p className="stat-box__title">Max Amount of Push Ups</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.pushUpMax || pushUpMax}</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                    <div className="stat-box dots">
                        <p className="stat-box__title">Max Amount of Pull Ups</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.pullUpMax|| pullUpMax}</p>
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
                    <p>{state.text} Pull Ups</p>
                    <ResponsiveContainer width="99%" height="99%">
                        <BarChart width={730} height={400} data={filter?.data?.pullUpEntries || pullUpEntries}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="created"></XAxis>
                            <YAxis label={{ value: 'Distance', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="amount" fill={orangeAccent} stroke={black} strokeWidth={strokeWidth}>
                                <Label value="Session Date" position="top" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>{state.text}: Push Ups</p>
                    <ResponsiveContainer width="99%" height="99%">
                        <BarChart width={730} height={250} data={filter?.data?.pushUpEntries || pushUpEntries}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="amount" stackId="a"  fill={orange} stroke={black} strokeWidth={strokeWidth}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>Lifetime Overview: Best Squat Duration w/Weights</p>
                    <ResponsiveContainer width="99%" height="99%">
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
