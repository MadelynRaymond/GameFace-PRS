import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts'
import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { requireUser } from '~/session.server'
import { useCatch, useFetcher, useLoaderData } from '@remix-run/react'
import { getEntriesAverage, getEntriesByDrillLiteral, getEntriesLastNReports, getEntriesMin } from '~/models/drill-entry.server'
import { dateFromDaysOptional, dbTimeToString, toDateString } from '~/util'
import { useEffect, useReducer, useState } from 'react'
import { z } from 'zod'

const SpeedEntrySchema = z
    .object({
        created_at: z.coerce.string().transform((data) => toDateString(data)),
        value: z.coerce.number(),
        outOf: z.nullable(z.number()),
    })
    .array()
    .transform((data) => data.map((s) => ({ time: s.value, created_at: s.created_at })))

export async function loader({ request }: LoaderArgs) {
    const user = await requireUser(request)
    const { username, id } = user
    const userId = id

    //fetch time interval from url
    const url = new URL(request.url)
    const filter = url.searchParams.get('interval')
    const intervalLiteral = filter ? parseInt(filter) : null
    const interval = dateFromDaysOptional(intervalLiteral)

    //get data points from last 7 reports
    const speedSessionData = await getEntriesLastNReports({
        drillName: 'Speed Drill',
        userId,
        sessions: 7,
    })

    //get all entries from time interval
    const speedEntryData = await getEntriesByDrillLiteral({ drillName: 'Speed Drill', userId, interval })

    const insufficientData = !speedEntryData || speedEntryData.length === 0

    if (insufficientData) {
            throw new Response('Not enough data', { status: 404 })
    }

    try {
        //transform entries into correct format
        const [speedEntries, lastSevenSessions] = await Promise.all([
            SpeedEntrySchema.parseAsync(speedEntryData),
            SpeedEntrySchema.parseAsync(speedSessionData),
        ])

        //idk what this is
        const dbAverageTimeMonth = await getEntriesAverage({ drillName: 'Speed Drill', userId, interval })
        const dbBestTimeMonth = await getEntriesMin({ drillName: 'Speed Drill', userId, interval })

        //idk what this is either
        const averageTimeMonth = dbTimeToString(dbAverageTimeMonth._avg.value)
        const bestTimeMonth = dbTimeToString(dbBestTimeMonth._min.bestScore)

        //last entry for the speed drill
        const lastSessionSpeedDrill = lastSevenSessions[0].time

        return json({ averageTimeMonth, bestTimeMonth, lastSevenSessions, lastSessionAverage: lastSessionSpeedDrill, speedEntries, username })

    } catch (error) {
        throw new Response('Internal server error', { status: 500 })
    }
}

export default function Speed() {
    const { averageTimeMonth, bestTimeMonth, lastSevenSessions, lastSessionAverage, username, speedEntries } = useLoaderData<typeof loader>()
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
        if (interval) {
            filter.load(`/${username}/stats/speed?interval=${interval}`)
        }
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
                    <h2>Speed Statistics </h2>
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
                        <button onClick={() => setInterval(undefined)} className="filter-button">Lifetime</button>
                    </div>
                </div>
            </div>
            <div className="stat-grid">
                <div className="stat-box-group">
                    <div className="stat-box accent-2">
                        <p className="stat-box__title">Overall (Avg time)</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.averageTimeMonth || averageTimeMonth}s</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                    <div className="stat-box crosses">
                        <p className="stat-box__title">Best Speed</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{bestTimeMonth}s</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                    <div className="stat-box accent">
                        <p className="stat-box__title">Last Session Avg. Speed</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{lastSessionAverage}s</p>

                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>{state.text}: Speed Drill</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            width={730}
                            height={250}
                            data={filter?.data?.speedEntries || speedEntries}
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
                            <Area type="monotone" dataKey="time" stroke={black} strokeWidth={strokeWidth} fillOpacity={1} fill="url(#colorUv)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>Lifetime Overview: Best Speed per Session</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            width={730}
                            height={250}
                            data={filter?.data?.speedEntries || speedEntries}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorUv2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={orangeAccent} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={orangeAccent} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="created_at" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="time" stroke={black} strokeWidth={strokeWidth}  fillOpacity={1} fill="url(#colorUv2)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>Last Seven Sessions: Avg. vs. Best Speed</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            width={500}
                            height={300}
                            data={lastSevenSessions}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="created" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="time" fill={orange} stroke={black} strokeWidth={strokeWidth} />
                            <Bar dataKey="time" fill={orangeAccent} stroke={black} strokeWidth={strokeWidth} />
                        </BarChart>
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
