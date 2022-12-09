import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getEntriesAverage, getEntriesLastNReports, getEntriesMax, getEntriesMin, getEntriesTotal } from '~/models/drill-entry.server'
import { requireUserId } from '~/session.server'
import { dbTimeToString } from '~/util'

export async function loader({ request }: LoaderArgs) {
    const userId = await requireUserId(request)

    const [
        dbFastestSpeed,
        dbAverageSpeed,
        dbfreeThrowLifetime,
        dbFastestDribbling,
        dbAverageDribbling,
        dbPassesLifeTime,
        dbJumpHeightBest,
        dbJumpHeightAverage,
    ] = await Promise.all([
        getEntriesMin({ drillName: 'Speed Drill', userId }),
        getEntriesMin({ drillName: 'Speed Drill', userId }),
        getEntriesTotal({ drillName: 'Free Throws', userId }),
        getEntriesMin({ drillName: 'Dribbling Speed', userId }),
        getEntriesMin({ drillName: 'Dribbling Speed', userId }),
        getEntriesTotal({ drillName: 'Passing Drill', userId }),
        getEntriesMax({ drillName: 'Jump Height Drill', userId }),
        getEntriesAverage({ drillName: 'Jump Height Drill', userId }),
    ])

    const [dbSquatAverage, dbSquatBest] = await Promise.all([
        getEntriesMin({ drillName: 'Squat Drill', userId }),
        getEntriesMin({ drillName: 'Squat Drill', userId }),
    ])
    const fastestSpeed = dbTimeToString(dbFastestSpeed._min.bestScore)
    const averageSpeed = dbTimeToString(dbAverageSpeed._min.value)

    const fastestDribbling = dbTimeToString(dbFastestDribbling._min.bestScore)
    const averageDribbling = dbTimeToString(dbAverageDribbling._min.value)

    const squatAverage = dbTimeToString(dbSquatAverage._min.value)
    const squatBest = dbTimeToString(dbSquatBest._min.bestScore)
    //avoid divide by 0 errors
    const passesCompleted = dbPassesLifeTime._sum.value || 0
    const passesAttempted = dbPassesLifeTime._sum.outOf || 1

    const shotsMade = dbfreeThrowLifetime._sum.value || 0
    const shotsAttempted = dbfreeThrowLifetime._sum.outOf || 1

    const highestJump = dbJumpHeightBest._max.bestScore
    const averageJump = dbJumpHeightAverage._avg.value

    const sessionLifeTimeSquat = await getEntriesLastNReports({
        drillName: 'Squat Drill',
        userId,
        sessions: 100,
    })

    const sessionScoresSquat = sessionLifeTimeSquat
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

    const sessionBestSpeed = await getEntriesLastNReports({
        drillName: 'Speed Drill',
        userId,
        sessions: 100,
    })

    const sessionScoresSpeed = sessionBestSpeed
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

    return json({
        fastestSpeed,
        averageSpeed,
        shotsMade,
        shotsAttempted,
        fastestDribbling,
        averageDribbling,
        passesCompleted,
        passesAttempted,
        highestJump,
        averageJump,
        squatAverage,
        squatBest,
        sessionScoresSquat,
        sessionScoresSpeed,
    })
}

export default function Overall() {
    const {
        fastestSpeed,
        averageSpeed,
        shotsMade,
        shotsAttempted,
        fastestDribbling,
        averageDribbling,
        passesCompleted,
        passesAttempted,
        highestJump,
        averageJump,
        squatAverage,
        squatBest,
        sessionScoresSquat,
        sessionScoresSpeed,
    } = useLoaderData<typeof loader>()

    const lifetimePie = [
        {
            name: 'Shots Attempted (lifetime)',
            value: shotsAttempted,
            fill: '#DF7861',
        },
        {
            name: 'Shots Scored (lifetime)',
            value: shotsMade,
            fill: '#ECB390',
        },
    ]

    return (
        <div>
            <div className="report-card-header">
                <div className="report-card-title">
                    <h2>Training Report Card</h2>
                    <p>Current Year (2022)</p>
                </div>
                <div style={{visibility: 'hidden'}} className="button-group">
                    <div className="filter-button-group">
                        <button className="filter-button">Month</button>
                        <button className="filter-button">Year</button>
                        <button className="filter-button">Lifetime</button>
                    </div>
                    <div className="export-button-group">
                        <button style={{visibility: 'visible'}} className="export-button">Print Icon</button>
                        <button style={{display: 'none'}}className="export-button">Export Icon</button>
                    </div>
                </div>
            </div>

            <div className="overall-stat-table">
                <div className="stat-row flex-r">
                    <p>Speed</p>
                    <div className="stat-row-item">
                        <p className="table-stat-name">Fastest Drill</p>
                        <p>{fastestSpeed}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Drill Speed</p>
                        <p>{averageSpeed}</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <p>Shooting</p>
                    <div>
                        <p className="table-stat-name">Shots Made</p>
                        <p>{shotsMade}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Shots Made/Attempted</p>
                        <p>{Math.floor((shotsMade / shotsAttempted) * 100)}%</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <p>Dribbling</p>
                    <div>
                        <p className="table-stat-name">Fastes Drill w/no Mistakes</p>
                        <p>{fastestDribbling}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Drill w/no Mistakes</p>
                        <p>{averageDribbling}</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <p>Passing</p>
                    <div>
                        <p className="table-stat-name">Passes Completed</p>
                        <p>{passesCompleted}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Passes Completion Rate</p>
                        <p>{Math.floor((passesCompleted / passesAttempted) * 100)}%</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <p>Strength</p>
                    <div>
                        <p className="table-stat-name">Avg. Squat Duration w/Weights</p>
                        <p>{squatAverage}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Best Squat Duration w/Weights</p>
                        <p>{squatBest}</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <p>Jumping</p>
                    <div>
                        <p className="table-stat-name">Highest Jump</p>
                        <p>{highestJump} ft</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Jump Height</p>
                        <p>{averageJump} ft</p>
                    </div>
                </div>
            </div>
            <div className="overall-graph-container">
                <div className="flex flex-col align-center gap-1">
                    <p>Avg. Squat Lifetime</p>
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
                    <p>Shots Made vs Attempted (lifetime)</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart width={800} height={400}>
                            <Pie data={lifetimePie} innerRadius={75} outerRadius={125} fill="#8884d8" paddingAngle={0} dataKey="value"></Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" align="center" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1">
                    <p>Lifetime Overview: Best Speed Drill</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            width={730}
                            height={250}
                            data={sessionScoresSpeed}
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
            </div>
        </div>
    )
}
