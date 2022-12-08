import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts'
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node'
import { requireUserId } from '~/session.server'
import { useLoaderData } from '@remix-run/react'
import { getEntriesByDrillLiteral, getEntriesLastNReports } from '~/models/drill-entry.server'
import { dbTimeToString } from '~/util'

export async function loader({ request }: LoaderArgs) {
    const userId = await requireUserId(request)

    const entries = await getEntriesByDrillLiteral({ drillName: 'Dribbling Speed', userId })
    const times = entries.map((entry) => entry.value as number)
    const bestTimes = entries.map((entry) => entry.bestScore as number)
    const averageTimeMonth = dbTimeToString(Math.floor(times.reduce((sum, score) => score + sum, 0) / entries.length))
    const bestTimeMonth = dbTimeToString(Math.min(...bestTimes))

    const lastSevenSessions = await getEntriesLastNReports({
        drillName: 'Dribbling Speed',
        userId,
        sessions: 7,
    })

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
export default function Dribbling() {
    const { averageTimeMonth, bestTimeMonth, sessionScores, lastSessionAverage } = useLoaderData<typeof loader>()

    return (
        <div className="stat-grid">
            <div className="stat-box-group">
                <div className="stat-box">
                    <p className="stat-box__title">Avg. Dribbling Speed Drill Completion</p>
                    <div className="stat-box__data">
                        <p className="stat-box__figure">{averageTimeMonth}</p>
                        <p className="stat-box__regression">
                            <span className="up-symbol">3.3▼</span>
                        </p>
                        <p className="stat-box__desc">(last 30 days)</p>
                    </div>
                </div>

                <div className="stat-box">
                    <p className="stat-box__title">Best Dribbling Speed Drill Completion</p>
                    <div className="stat-box__data">
                        <p className="stat-box__figure">{bestTimeMonth}</p>
                        <p className="stat-box__regression">
                            <span className="up-symbol">▼</span>
                            4.1%
                        </p>
                        <p className="stat-box__desc">in last 30 days</p>
                    </div>
                </div>

                <div className="stat-box">
                    <p className="stat-box__title">
                        Last Session Avg. <br></br>
                        Dribbling Drill Speed
                    </p>
                    <div className="stat-box__data">
                        <p className="stat-box__figure">{lastSessionAverage}</p>
                        <p className="stat-box__regression">
                            <span className="up-symbol">▼</span>
                            4.1%
                        </p>
                        <p className="stat-box__desc">in last 30 days</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col align-center gap-1">
                <p>Average Dribbling Drill Completion Time</p>
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

            <div className="flex flex-col align-center gap-1">
                <p>Average Dribbling Drill Completion Time</p>
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

            <div className='flex flex-col align-center gap-1'>
                <p>Average vs Best Dribbling Drill Completion Time</p>
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
                        <Bar dataKey="best" fill="#8884d8" />
                        <Bar dataKey="time" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
