import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getEntriesAggregate, getEntriesAverage, getEntriesLastNReports, getEntriesMax, getEntriesMin, getEntriesTotal } from '~/models/drill-entry.server'
import { requireUserId } from '~/session.server'
import { dbTimeToString } from '~/util'

export async function loader({ request }: LoaderArgs) {
    const userId = await requireUserId(request)

    const speedAggregations = await getEntriesAggregate({ drillName: 'Speed Drill', userId })
    const dribblingAggregations = await getEntriesAggregate({ drillName: 'Dribbling Speed', userId })
    const squatAggregations = await getEntriesAggregate({ drillName: 'Squat Drill', userId })

    return json({
        speedAggregations,
        dribblingAggregations,
        squatAggregations,
    })
}

export default function Overall() {
    const { speedAggregations, dribblingAggregations, squatAggregations } = useLoaderData<typeof loader>()

    return (
        <div>
            <div className="report-card-header">
                <div className="report-card-title">
                    <h2>Training Report Card</h2>
                    <p>Athlete: Danielle Williams (Year Overview)</p>
                </div>
                <div className="button-group">
                    <p className="filter-heading">Select Filter:</p>
                    <div className="filter-button-group">
                        <button onClick={() => console.log("Month")} className="filter-button">Month</button>
                        <button onClick={() => console.log("Year")} className="filter-button">Year</button>
                        <button onClick={() => console.log("LifeTime")} className="filter-button">Lifetime</button>
                    </div>
                    <div className="export-button-group">
                        <button onClick={() => window.print()} className="print-btn no-print">
                            Prin
                        </button>
                        
                        <button className="export">
                            Exp
                        </button>
                    </div>
                </div>
            </div>

            <div className="overall-stat-table">
                <div className="stat-row flex-r">
                    <p>Speed</p>
                    <div className="stat-row-item">
                        <p className="table-stat-name">Fastest Drill</p>
                        <p>{`${dbTimeToString(speedAggregations.min)}` || 'Not enough data'}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Drill Speed</p>
                        <p>{`${dbTimeToString(speedAggregations.average)}` || 'Not enough data'}</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <p>Shooting</p>
                    <div>
                        <p className="table-stat-name">Shots Made</p>
                        <p>todo</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Shots Made/Attempted</p>
                        <p>todo</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <p>Dribbling</p>
                    <div>
                        <p className="table-stat-name">Fastes Drill w/no Mistakes</p>
                        <p>{`${dbTimeToString(dribblingAggregations.min)}` || 'Not enough data'}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Drill w/no Mistakes</p>
                        <p>{`${dbTimeToString(dribblingAggregations.average)}` || 'Not enough data'}</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <p>Passing</p>
                    <div>
                        <p className="table-stat-name">Passes Completed</p>
                        <p>todo</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Passes Completion Rate</p>
                        <p>todo</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <p>Strength</p>
                    <div>
                        <p className="table-stat-name">Avg. Squat Duration w/Weights</p>
                        <p>{`${dbTimeToString(squatAggregations.min)}` || 'Not enough data'}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Best Squat Duration w/Weights</p>
                        <p>{`${dbTimeToString(squatAggregations.average)}` || 'Not enough data'}</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <p>Jumping</p>
                    <div>
                        <p className="table-stat-name">Highest Jump</p>
                        <p>todo</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Jump Height</p>
                        <p>todo</p>
                    </div>
                </div>
            </div>
            <div className="report-card-graph-container">
                <div className="report-card-graph">
                <p>Avg. Squat Lifetime</p>
                </div>
                <div className="report-card-graph">
                    <p>Name of the Graph</p>
                    
                </div>
                <div className="report-card-graph">
                    <p>Name of the Graph</p>
                </div>
            </div>
            {/*<div className="overall-graph-container">
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
            </div>*/}
        </div>
    )
}
