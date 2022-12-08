import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, BarChart, Bar, Label } from 'recharts'
import { requireUserId } from '~/session.server'
import { getEntriesByDrillLiteral, getEntriesLastNReports } from '~/models/drill-entry.server'
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export async function loader({ request }: LoaderArgs) {
    const userId = await requireUserId(request)

    const jumpDistanceentries = await getEntriesByDrillLiteral({ drillName: 'Speed Drill', userId })
    const squatEntries = await getEntriesByDrillLiteral({ drillName: 'Squat Drill', userId })
    const distances = jumpDistanceentries.map((entry) => entry.value as number)

    const bestDistancesMonth = jumpDistanceentries.map((entry) => entry.bestScore as number)
    const bestDistance = Math.max(...bestDistancesMonth)
    const averageDistanceMonth = (distances.reduce((sum, score) => score + sum, 0) / jumpDistanceentries.length).toFixed(2)
    const averageSquatMonth = (squatEntries.map((entry) => entry.value as number).reduce((sum, score) => score + sum, 0) / squatEntries.length).toFixed(2)

    const monthlySessionsSquat = await getEntriesLastNReports({
        drillName: 'Squat Drill',
        userId,
        sessions: 30,
    })

    const sessionScoresSquat = monthlySessionsSquat
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

    const sessionScoresJumpDistance = monthlySessionsSquat
        .flatMap((report) => ({
            entries: report.entries,
            created: report.created_at,
        }))
        .map((entry) => ({
            created: entry.created.toDateString(),
            value: entry.entries[0].value,
            best: entry.entries[0].bestScore,
        })) as unknown as {
        created: string
        value: number
        best: number
    }[]

    return json({ bestDistance, bestDistancesMonth, averageDistanceMonth, sessionScoresSquat, sessionScoresJumpDistance, averageSquatMonth })
}

export default function Strength() {

    const { bestDistance, averageDistanceMonth, sessionScoresSquat, sessionScoresJumpDistance, averageSquatMonth } = useLoaderData<typeof loader>()
    return (
        <div className="stat-grid">
            <div className="stat-box-group">
                <div className="stat-box">
                    <p className="stat-box__title">Avg. Jump (Distance)</p>
                    <div className="stat-box__data">
                        <p className="stat-box__figure">{averageDistanceMonth}</p>
                        <p className="stat-box__regression">
                            <span className="up-symbol">▼</span>
                            4.1%
                        </p>
                        <p className="stat-box__desc">in last 30 days</p>
                    </div>
                </div>

                <div className="stat-box">
                    <p className="stat-box__title">Best Jump Distance</p>
                    <div className="stat-box__data">
                        <p className="stat-box__figure">{bestDistance}</p>
                        <p className="stat-box__regression">
                            <span className="up-symbol">▼</span>
                            4.1%
                        </p>
                        <p className="stat-box__desc">in last 30 days</p>
                    </div>
                </div>

                <div className="stat-box">
                    <p className="stat-box__title">Avg. Squat Duration w/Weights</p>
                    <div className="stat-box__data">
                        <p className="stat-box__figure">{averageSquatMonth}</p>
                        <p className="stat-box__regression">
                            <span className="up-symbol">▼</span>
                            4.1%
                        </p>
                        <p className="stat-box__desc">in last 30 days</p>
                    </div>
                </div>
            </div>

            <div className='flex align-center flex-col gap-1'>
                <p>Lifetime Average Jump Distance</p>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart width={730} height={400} data={sessionScoresJumpDistance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="created"></XAxis>
                        <YAxis label={{ value: 'Distance', angle: -90, position: 'insideLeft' }} />
                        <Bar dataKey="value" fill="#8884d8">
                            <Label value="Session Date" position="top" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="flex flex-col align-center gap-1">
                <p>Monthly Average Squat with Weights</p>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart width={730} height={250} data={sessionScoresSquat}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="time" stackId="a" fill="#ECB390" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="flex flex-col align-center gap-1">
                <p>Best Squat with Weights (Yearly)</p>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        width={730}
                        height={250}
                        data={sessionScoresSquat}
                    >
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#DF7861" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#DF7861" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ECB390" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ECB390" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="created" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="time" stroke="#DF7861" fillOpacity={1} fill="url(#colorUv)" />
                        <Area type="monotone" dataKey="best" stroke="#DF7861" fillOpacity={1} fill="url(#colorPv)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
