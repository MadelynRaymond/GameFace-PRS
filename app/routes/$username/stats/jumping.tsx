import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts'
import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { requireUser } from '~/session.server'
import { getEntriesAggregate, getEntriesByDrillLiteral, getEntriesLastNReports } from '~/models/drill-entry.server'
import { useCatch, useFetcher, useLoaderData } from '@remix-run/react'
import { dateFromDaysOptional, toDateString } from '~/util'
import { useState, useReducer, useEffect } from 'react'
import { z } from 'zod'

const JumpDistanceEntrySchema = z
    .object({
        created_at: z.coerce.string().transform((data) => toDateString(data)),
        value: z.coerce.number(),
        outOf: z.nullable(z.number()),
    })
    .array()
    .transform((data) => data.map((s) => ({ distance: s.value, created_at: s.created_at })))

const JumpHeightEntrySchema = z
    .object({
        created_at: z.coerce.string().transform((data) => toDateString(data)),
        value: z.coerce.number(),
        outOf: z.nullable(z.number()),
    })
    .array()
    .transform((data) => data.map((s) => ({ height: s.value, created_at: s.created_at })))

export async function loader({ request }: LoaderArgs) {
    const { username, id } = await requireUser(request)
    const userId = id

    const url = new URL(request.url)
    const filter = url.searchParams.get('interval')
    const intervalLiteral = filter ? parseInt(filter) : null
    const interval = dateFromDaysOptional(intervalLiteral)

    const jumpHeightData = await getEntriesByDrillLiteral({ drillName: 'Jump Height Drill', userId, interval })
    const jumpDistanceData = await getEntriesByDrillLiteral({ drillName: 'Jump Distance Drill', userId, interval })

    const insufficientData = !jumpHeightData || !jumpDistanceData

    if (insufficientData) {
        throw new Response('Not enough data', { status: 404 })
    }

    try {
        const [jumpHeightEntries, jumpDistanceEntries] = await Promise.all([
            JumpHeightEntrySchema.parseAsync(jumpHeightData),
            JumpDistanceEntrySchema.parseAsync(jumpDistanceData),
        ])
        const jumpHeightAggregate = await getEntriesAggregate({ drillName: 'Jump Height Drill', userId, interval })
        const [jumpHeightAverage, jumpHeightBest] = [jumpHeightAggregate.average, jumpHeightAggregate.max]
        const lastSevenSessions = await JumpDistanceEntrySchema.parseAsync(
            await getEntriesLastNReports({ drillName: 'Jump Distance Drill', userId, sessions: 7 })
        )

        return json({
            jumpHeightEntries,
            jumpDistanceEntries,
            jumpHeightAverage,
            jumpHeightBest,
            lastSevenSessions,
            username,
        })
    } catch (error) {
        throw new Response('Internal server error', { status: 500 })
    }
}
export default function Jumping() {
    const { jumpHeightAverage, jumpHeightBest, jumpDistanceEntries, jumpHeightEntries, username, lastSevenSessions } = useLoaderData<typeof loader>()
    const intervalReducer = (_state: { text: string }, action: { type: 'update'; payload?: number }): { text: string } => {
        if (action.type !== 'update') {
            throw new Error('Unknown action')
        }

        switch (action.payload) {
            case 30:
                return { text: 'Last 30 days' }
            case 365:
                return { text: 'Last year' }
            default:
                return { text: 'Lifetime' }
        }
    }
    const filter = useFetcher<typeof loader>()
    const [interval, setInterval] = useState<number | undefined>(undefined)
    const [state, dispatch] = useReducer(intervalReducer, { text: '' })

    useEffect(() => {
        filter.load(`/${username}/stats/jumping?interval=${interval}`)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interval])

    useEffect(() => {
        dispatch({ type: 'update', payload: interval })
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
                    <h2>Jumping Statistics </h2>
                    <p>Athlete: Danielle Williams (Year Overview)</p>
                </div>
                <div className="button-group">
                    <p className="filter-heading">Select Filter:</p>
                    <div className="filter-button-group">
                        <button onClick={() => setInterval(30)} className="filter-button">
                            Month
                        </button>
                        <button onClick={() => setInterval(365)} className="filter-button">
                            Year
                        </button>
                        <button onClick={() => setInterval(undefined)} className="filter-button">
                            Lifetime
                        </button>
                    </div>
                </div>
            </div>
            <div className="stat-grid">
                <div className="stat-box-group">
                    <div className="stat-box accent">
                        <p className="stat-box__title">Avg. Jump (Height)</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.jumpHeightAverage?.toFixed(1) || jumpHeightAverage?.toFixed(1)}ft</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                    <div className="stat-box crosses">
                        <p className="stat-box__title">Overall Highest Jump</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.jumpHeightBest?.toFixed(1) || jumpHeightBest?.toFixed(1)}ft</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                    <div className="stat-box accent">
                        <p className="stat-box__title">Avg. Jump (Height)</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.jumpHeightAverage?.toFixed(1) || jumpHeightAverage?.toFixed(1)}ft</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>{state.text}: Jump Height</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart width={500} height={300} data={filter?.data?.jumpHeightEntries || jumpHeightEntries}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="created_at" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="height" stackId="a" fill={orangeAccent}  stroke={black} strokeWidth={strokeWidth}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>{state.text}: Jump Distance</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart width={500} height={300} data={filter?.data?.jumpDistanceEntries || jumpDistanceEntries}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="created_at" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="distance" stackId="a" fill={orange} stroke={black} strokeWidth={strokeWidth}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>Last Seven Sessions: Jump Distance</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            width={730}
                            height={250}
                            data={lastSevenSessions}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={orange} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={orange} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="created_at" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="distance" stroke={black} strokeWidth={strokeWidth} fillOpacity={1} fill="url(#colorUv)" />
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
