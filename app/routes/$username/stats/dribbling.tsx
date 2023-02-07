import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts'
import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { requireUser } from '~/session.server'
import { useCatch, useFetcher, useLoaderData } from '@remix-run/react'
import { getEntriesAggregate, getEntriesByDrillLiteral, getEntriesLastNReports } from '~/models/drill-entry.server'
import { dateFromDaysOptional, toDateString } from '~/util'
import { useState, useReducer, useEffect } from 'react'
import { z } from 'zod'

const DribblingSpeedSchema = z
    .object({
        created_at: z.coerce.string().transform((data) => toDateString(data)),
        value: z.coerce.number(),
        outOf: z.nullable(z.number()),
    })
    .array()
    .transform((data) => data.map((s) => ({ time: s.value, created_at: s.created_at })))

export async function loader({ request }: LoaderArgs) {
    const { username, id } = await requireUser(request)
    const userId = id

    const url = new URL(request.url)
    const filter = url.searchParams.get('interval')
    const intervalLiteral = filter ? parseInt(filter) : null
    const interval = dateFromDaysOptional(intervalLiteral)

    const dribblingSpeedData = await getEntriesByDrillLiteral({ drillName: 'Dribbling Speed', userId, interval })

    const insufficientData = !dribblingSpeedData || dribblingSpeedData.length === 0

    if (insufficientData) {
        throw new Response('Not enough data', { status: 404 })
    }

    try {
        const dribblingSpeedSessionData = await getEntriesLastNReports({
            drillName: 'Dribbling Speed',
            userId,
            sessions: 7,
        })

        const [dribblingSpeedEntries, lastSevenSessions] = await Promise.all([
            DribblingSpeedSchema.parseAsync(dribblingSpeedData),
            DribblingSpeedSchema.parseAsync(dribblingSpeedSessionData),
        ])

        const { min, average } = await getEntriesAggregate({ drillName: 'Dribbling Speed', userId, interval })
        const [bestTime, averageTime] = [min, average]
        const lastSessionAverage = dribblingSpeedEntries[0].time

        return json({ averageTime, bestTime, lastSevenSessions, dribblingSpeedEntries, username, lastSessionAverage })

    } catch (error) {
        throw new Response('Not enough data', { status: 404 })
    }
}
export default function Dribbling() {
    const { averageTime, bestTime, dribblingSpeedEntries, lastSessionAverage, username, lastSevenSessions} = useLoaderData<typeof loader>()
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
            filter.load(`/${username}/stats/dribbling?interval=${interval}`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interval])

    useEffect(() => {
        dispatch({ type: 'update', payload: interval })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter.data])

    return (
        <div>
            <div className="report-card-header">
                <div className="report-card-title">
                    <h2>Dribbling Statistics </h2>
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
                    <div className="stat-box">
                        <p className="stat-box__title">Avg. Dribbling Speed Drill Completion</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.averageTime?.toFixed(1) || averageTime?.toFixed(1)}s</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                    <div className="stat-box">
                        <p className="stat-box__title">Best Dribbling Speed Drill Completion</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.bestTime || bestTime}s</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                    <div className="stat-box">
                        <p className="stat-box__title">
                            Last Session<br></br>
                            Dribbling Drill Speed
                        </p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{lastSessionAverage}s</p>
                            <p className="stat-box__desc">in last 30 days</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>{state.text}: Dribbling Drill Completion Time</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            width={730}
                            height={250}
                            data={filter?.data?.dribblingSpeedEntries || dribblingSpeedEntries}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#DF7861" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#DF7861" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="created_at" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="time" stroke="#DF7861" fillOpacity={1} fill="url(#colorUv)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>Last 7 Sessions: Dribbling Drill Completion Time</p>
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
                                <linearGradient id="colorUv2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#DF7861" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#DF7861" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="created_at" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="time" stroke="#DF7861" fillOpacity={1} fill="url(#colorUv2)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>{state.text}: Current vs Best Dribbling Drill Completion Time</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            width={500}
                            height={300}
                            data={filter?.data?.dribblingSpeedEntries.map(e => ({...e, bestTime})) || dribblingSpeedEntries.map(e => ({...e, bestTime}))}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="created_at"/>
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="time" fill="#ECB390" />
                            <Bar dataKey="bestTime" fill="#DF7861" />
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
