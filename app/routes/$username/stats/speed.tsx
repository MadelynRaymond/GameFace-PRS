import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts'
import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { requireUserId } from '~/session.server'
import { useCatch, useLoaderData } from '@remix-run/react'
import { getEntriesAverage, getEntriesLastNReports, getEntriesMin } from '~/models/drill-entry.server'
import { dbTimeToString } from '~/util'

export async function loader({ request }: LoaderArgs) {
    const userId = await requireUserId(request)
    const today = new Date()
    const priorDate = new Date(new Date().setDate(today.getDate() - 30))

    const dbAverageTimeMonth = await getEntriesAverage({ drillName: 'Speed Drill', userId, interval: priorDate })
    const dbBestTimeMonth = await getEntriesMin({ drillName: 'Speed Drill', userId, interval: priorDate })

    const lastSevenSessions = await getEntriesLastNReports({
        drillName: 'Speed Drill',
        userId,
        sessions: 7,
    })

    const insufficientData = [lastSevenSessions].some((entry) => entry.length === 0)

    if (insufficientData) {
        throw new Response('Not enough data', { status: 404 })
    }

    const averageTimeMonth = dbTimeToString(dbAverageTimeMonth._avg.value)
    const bestTimeMonth = dbTimeToString(dbBestTimeMonth._min.bestScore)

    const sessionScores = lastSevenSessions
        .flatMap((report) => ({
            entries: report.entries,
            created: report.created_at,
        }))
        .map((entry) => ({
            created: entry.created.toDateString(),
            time: entry.entries[0].value,
            best: entry.entries[0].bestScore,
        })) as unknown as {
        created: string
        time: number
        best: number
    }[]

    const lastSessionAverage = dbTimeToString(sessionScores[sessionScores.length - 1].time)

    return json({ averageTimeMonth, bestTimeMonth, sessionScores, lastSessionAverage })
}
export default function Speed() {
    const { averageTimeMonth, bestTimeMonth, sessionScores, lastSessionAverage } = useLoaderData<typeof loader>()

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
                    <button onClick={() => console.log("Month")} className="filter-button">Month</button>
                    <button onClick={() => console.log("Year")} className="filter-button">Year</button>
                    <button onClick={() => console.log("LifeTime")} className="filter-button">Lifetime</button>
                </div>
            </div>
            </div>
            <div className="stat-grid">
                <div className="stat-box-group">
                    <div className="stat-box">
                        <p className="stat-box__title">Overall (Avg time)</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{averageTimeMonth}s</p>
                            <p className="stat-box__desc">last 30 days</p>
                        </div>
                    </div>
                    <div className="stat-box">
                        <p className="stat-box__title">Best Speed</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{bestTimeMonth}s</p>
                            <p className="stat-box__desc">last 30 days</p>
                        </div>
                    </div>
                    <div className="stat-box">
                        <p className="stat-box__title">Last Session Avg. Speed</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{lastSessionAverage}s</p>
            
                            <p className="stat-box__desc">last 30 days</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>Last 30 Days: Avg. Speed</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            width={730}
                            height={250}
                            data={sessionScores}
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
                            <XAxis dataKey="created" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="time" stroke="#DF7861" fillOpacity={1} fill="url(#colorUv)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>Lifetime Overview: Best Speed per Session</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            width={730}
                            height={250}
                            data={sessionScores}
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
                            <XAxis dataKey="created" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="time" stroke="#DF7861" fillOpacity={1} fill="url(#colorUv2)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>Last Seven Sessions: Avg. vs. Best Speed</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            width={500}
                            height={300}
                            data={sessionScores}
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
                            <Bar dataKey="best" fill="#DF7861" />
                            <Bar dataKey="time" fill="#ECB390" />
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
