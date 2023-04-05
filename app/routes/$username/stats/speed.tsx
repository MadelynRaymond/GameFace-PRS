import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, BarChart, Bar, Line, LineChart } from 'recharts'
import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { requireUser } from '~/session.server'
import { useCatch, useFetcher, useLoaderData } from '@remix-run/react'
import { getEntriesAggregate, getEntriesAverage, getEntriesByDrillLiteral, getEntriesLastNReports, getEntriesMin } from '~/models/drill-entry.server'
import { dateFromDaysOptional, dbTimeToString, toDateString } from '~/util'
import { useEffect, useReducer } from 'react'
import { z } from 'zod'
import invariant from 'tiny-invariant'
import ReportCardHeader from '~/components/ReportCardHeader'

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
    const { id, ...athleteInfo } = user
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

        const speedAggregations = await getEntriesAggregate({drillName: "Speed Drill", userId, interval})

        const [averageSpeedRaw, bestSpeedRaw] = [speedAggregations.average, speedAggregations.min]



        const [averageSpeed, bestSpeed] = [dbTimeToString(averageSpeedRaw), dbTimeToString(bestSpeedRaw)]
        const lastSessionSpeed = dbTimeToString(speedEntries[0].time)
        const lastSevenSessionsWithBest = lastSevenSessions.map(x => ({...x, best: bestSpeedRaw}))
        const averageSpeedWithOverallAverage = speedEntries.map(x => ({...x, average: averageSpeedRaw}))

        return json({ averageSpeed, lastSessionSpeed, lastSevenSessionsWithBest, bestSpeed, speedEntries, athleteInfo, averageSpeedWithOverallAverage })

    } catch (error) {
        throw new Response('Internal server error', { status: 500 })
    }
}

export default function Speed() {
    const { lastSessionSpeed, averageSpeed, bestSpeed, lastSevenSessionsWithBest, athleteInfo, speedEntries, averageSpeedWithOverallAverage } = useLoaderData<typeof loader>()
    const {profile, username} = athleteInfo
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
            filter.load(`/${username}/stats/speed?interval=${state.interval}`)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state])

    
    let orange = '#EDA75C'
    let orangeAccent = '#E58274'
    let black = '#000000'
    let strokeWidth = 4


    return (
        <div className='stats-summary'>
            <ReportCardHeader header={'Speed Statistics'} firstName={profile?.firstName} lastName={profile?.lastName} dispatch={dispatch} />
            <div className="stat-grid">
                <div className="stat-box-group no-print">
                    <div className="stat-box accent-2">
                        <p className="stat-box__title">Overall (Avg time)</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.averageSpeed || averageSpeed}s</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                    <div className="stat-box crosses">
                        <p className="stat-box__title">Best Speed</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.bestSpeed || bestSpeed}s</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                    <div className="stat-box accent">
                        <p className="stat-box__title">Last Session Avg. Speed</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.lastSessionSpeed || lastSessionSpeed}s</p>

                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>{state.text}: Speed Drill</p>
                    <ResponsiveContainer width="99%" height="99%">
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
                            <YAxis/>
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="time" stroke={black} strokeWidth={strokeWidth} fillOpacity={1} fill="url(#colorUv)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>{state.text}: Speed vs. Average Speed</p>
                    <ResponsiveContainer width="99%" height="99%">
                        <LineChart
                            width={730}
                            height={250}
                            data={filter?.data?.averageSpeedWithOverallAverage || averageSpeedWithOverallAverage}
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
                            <Line dataKey="time" stroke={orange} strokeWidth={strokeWidth} />
                            <Line dataKey="average" stroke={orange} strokeWidth={strokeWidth} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container page-break">
                    <p>Last Seven Sessions: Avg. vs. Best Speed</p>
                    <ResponsiveContainer width="99%" height="99%">
                        <BarChart
                            width={500}
                            height={300}
                            data={filter.data?.lastSevenSessionsWithBest || lastSevenSessionsWithBest }
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
                            <Bar dataKey="best" fill={orange} stroke={black} strokeWidth={strokeWidth} />
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
