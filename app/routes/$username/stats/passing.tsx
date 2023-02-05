import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Area, AreaChart, BarChart, Bar } from 'recharts'
import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { requireUserId } from '~/session.server'
import { getEntriesByDrillLiteral, getEntriesLastNReports } from '~/models/drill-entry.server'
import { useCatch, useLoaderData } from '@remix-run/react'

export async function loader({ request }: LoaderArgs) {
    const today = new Date()
    const priorDate = new Date(new Date().setDate(today.getDate() - 30))
    const userId = await requireUserId(request)
    const lastSevenSessions = await getEntriesLastNReports({
        drillName: 'Passing Drill',
        userId,
        sessions: 7,
    })
    const passesLifetime = await getEntriesByDrillLiteral({
        drillName: 'Passing Drill',
        userId,
    })
    const passesLastMonth = await getEntriesByDrillLiteral({
        drillName: 'Passing Drill',
        userId,
        interval: priorDate,
    })

    const insufficientData = [passesLastMonth, passesLifetime, lastSevenSessions].some((entry) => entry.length === 0)

    if (insufficientData) {
        throw new Response('Not enough data', { status: 404 })
    }

    const { scored: scoredLifeTime, attempted: attemptedLifeTime } = passesLifetime
        .flatMap((entry) => ({
            value: entry.value as number,
            outOf: entry.outOf as number,
        }))
        .reduce(
            (result, curr) => {
                return {
                    scored: result.scored + curr.value,
                    attempted: result.attempted + curr.outOf,
                }
            },
            {
                scored: 0,
                attempted: 0,
            }
        )

    const { scored: scoredLastMonth, attempted: attemptedLastMonth } = passesLastMonth
        .flatMap((entry) => ({
            value: entry.value as number,
            outOf: entry.outOf as number,
        }))
        .reduce(
            (result, curr) => {
                return {
                    scored: result.scored + curr.value,
                    attempted: result.attempted + curr.outOf,
                }
            },
            {
                scored: 0,
                attempted: 0,
            }
        )

    const successPercentage = Math.floor((scoredLifeTime / attemptedLifeTime) * 100)

    const sessionScores = lastSevenSessions
        .flatMap((report) => ({
            entries: report.entries,
            created: report.created_at,
        }))
        .map((entry) => ({
            created: entry.created.toDateString(),
            scored: entry.entries[0].value,
            attempted: entry.entries[0].outOf,
        })) as unknown as {
        created: string
        scored: number
        attempted: number
    }[]

    const sessionPercentChange = sessionScores.map((score) => ({ value: Math.floor((score.scored / score.attempted) * 100), created: score.created }))

    return json({
        sessionScores,
        attemptedLifeTime,
        scoredLifeTime,
        successPercentage,
        scoredLastMonth,
        attemptedLastMonth,
        sessionPercentChange,
    })
}
export default function Shooting() {
    const { sessionScores, attemptedLifeTime, scoredLifeTime, successPercentage, scoredLastMonth, attemptedLastMonth, sessionPercentChange } =
        useLoaderData<typeof loader>()
    const lifetimePie = [
        {
            name: 'Shots Attempted (lifetime)',
            value: attemptedLifeTime,
            fill: '#DF7861',
        },
        {
            name: 'Shots Scored (lifetime)',
            value: scoredLifeTime,
            fill: '#ECB390',
        },
    ]

    const lastMonthPie = [
        {
            name: 'Shots Attempted (last 30 days)',
            value: attemptedLastMonth,
            fill: '#DF7861',
        },
        {
            name: 'Shots Scored (last 30 days)',
            value: scoredLastMonth,
            fill: '#ECB390',
        },
    ]

    return (
        <div className="stat-grid">
            <div className="stat-box-group">
                <div className="stat-box">
                    <p className="stat-box__title">Successful Passes</p>
                    <div className="stat-box__data">
                        <p className="stat-box__figure">{scoredLifeTime}</p>
                        <p className="stat-box__regression">
                            <span className="up-symbol">▼</span>
                            3.8%
                        </p>
                        <p className="stat-box__desc">last 30 days</p>
                    </div>
                </div>

                <div className="stat-box">
                    <p className="stat-box__title">Attepted Passes</p>
                    <div className="stat-box__data">
                        <p className="stat-box__figure">{attemptedLifeTime}</p>
                        <p className="stat-box__improvement">
                            <span className="up-symbol">▲</span>
                            3.2%
                        </p>
                        <p className="stat-box__desc">in last 30 days</p>
                    </div>
                </div>

                <div className="stat-box">
                    <p className="stat-box__title">Avg. Pass Success Rate</p>
                    <div className="stat-box__data">
                        <p className="stat-box__figure">{successPercentage}%</p>
                        <p className="stat-box__regression">
                            <span className="up-symbol">▼</span>
                            4.4%
                        </p>
                        <p className="stat-box__desc">in last 30 days</p>
                    </div>
                </div>
            </div>

            <div className="flex">
                <div className="flex flex-col align-center gap-1 h-full w-full">
                    <p>Last 30 Days: Missed vs. Landed</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart width={800} height={400}>
                            <Pie data={lifetimePie} innerRadius={75} outerRadius={125} fill="#8884d8" paddingAngle={0} dataKey="value"></Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" align="center" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1 h-full w-full">
                    <p>Lifetime: Missed vs. Landed</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart width={800} height={400}>
                            <Pie data={lastMonthPie} innerRadius={75} outerRadius={125} fill="#8884d8" paddingAngle={0} dataKey="value"></Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" align="center" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="flex flex-col align-center gap-1">
                <p>Last Seven Sessions: Pass Success Rate</p>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart width={500} height={300} data={sessionScores}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="created" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="scored" stackId="a" fill="#DF7861" />
                        <Bar dataKey="attempted" stackId="a" fill="#ECB390" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="flex flex-col align-center gap-1">
                <p>Lifetime Overview: Pass Success Rate</p>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        width={730}
                        height={250}
                        data={sessionPercentChange}
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
                        <Area type="monotone" dataKey="value" stroke="#DF7861" fillOpacity={1} fill="url(#colorUv)" />
                    </AreaChart>
                </ResponsiveContainer>
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
