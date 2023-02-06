import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useFetcher, useLoaderData, useMatches } from '@remix-run/react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getEntriesAggregate, getEntriesAverage, getEntriesLastNReports, getEntriesMax, getEntriesMin, getEntriesTotal } from '~/models/drill-entry.server'
import { requireUser, requireUserId } from '~/session.server'
import { dateFromDaysOptional, dbTimeToString } from '~/util'

export async function loader({ request }: LoaderArgs) {
    const user = await requireUser(request)
    const { username, id } = user
    const url = new URL(request.url)
    const filter = url.searchParams.get('interval')
    const intervalLiteral = filter ? parseInt(filter) : null

    const interval = dateFromDaysOptional(intervalLiteral)

    const speedAggregations = await getEntriesAggregate({ drillName: 'Speed Drill', userId: id, interval })
    const dribblingAggregations = await getEntriesAggregate({ drillName: 'Dribbling Speed', userId: id, interval })
    const squatAggregations = await getEntriesAggregate({ drillName: 'Squat Drill', userId: id, interval })
    const passingAggregations = await getEntriesTotal({drillName: 'Passing Drill', userId: id, interval})
    const shootingAggregations = await getEntriesTotal({drillName: 'Free Throws', userId: id, interval})
    const jumpingAggregations = await getEntriesAggregate({drillName: 'Jump Height Drill', userId: id, interval})

    return json({
        username,
        speedAggregations,
        dribblingAggregations,
        squatAggregations,
        shootingAggregations,
        passingAggregations,
        jumpingAggregations
    })
}

export default function Overall() {
    const { speedAggregations, dribblingAggregations, squatAggregations, shootingAggregations, passingAggregations, jumpingAggregations, username } = useLoaderData<typeof loader>()
    const filter = useFetcher<typeof loader>()

     const lifetimePie = [
        {
            name: 'Shots Attempted (lifetime)',
            value: filter?.data?.shootingAggregations._sum.outOf || shootingAggregations._sum.outOf,
            fill: '#DF7861',
        },
        {
            name: 'Shots Scored (lifetime)',
            value: filter?.data?.shootingAggregations._sum.value || shootingAggregations._sum.value,
            fill: '#ECB390',
        },
    ]

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
                        <button onClick={() => filter.load(`/${username}/stats?index&interval=30`)} className="filter-button">
                            Month
                        </button>
                        <button onClick={() => filter.load(`/${username}/stats?index&interval=365`)}>Year</button>
                        <button onClick={() => filter.load(`/${username}/stats?index`)}>Lifetime</button>
                    </div>
                    <div className="export-button-group">
                        <button onClick={() => window.print()} className="print-btn no-print">
                            Prin
                        </button>

                        <button className="export">Exp</button>
                    </div>
                </div>
            </div>

            <div className="overall-stat-table">
                <div className="stat-row flex-r">
                    <h4>Speed</h4>
                    <div className="stat-row-item">
                        <p className="table-stat-name">Fastest Drill</p>
                        <p>{`${dbTimeToString(filter?.data?.speedAggregations.min || speedAggregations.min)}` || 'Not enough data'}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Drill Speed</p>
                        <p>{`${dbTimeToString(filter?.data?.speedAggregations.average || speedAggregations.average)}` || 'Not enough data'}</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <h4>Shooting</h4>
                    <div>
                        <p className="table-stat-name">Shots Made</p>
                        <p>{filter?.data?.shootingAggregations._sum.value || shootingAggregations._sum.value || 0}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Shots Made/Attempted</p>
                        <p>{filter?.data?.shootingAggregations._sum.outOf || shootingAggregations._sum.outOf || 1}</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <h4>Dribbling</h4>
                    <div>
                        <p className="table-stat-name">Fastes Drill w/no Mistakes</p>
                        <p>{`${dbTimeToString(filter?.data?.dribblingAggregations.min || dribblingAggregations.min)}` || 'Not enough data'}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Drill w/no Mistakes</p>
                        <p>{`${dbTimeToString(filter?.data?.dribblingAggregations.average || dribblingAggregations.average)}` || 'Not enough data'}</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <h4>Passing</h4>
                    <div>
                        <p className="table-stat-name">Passes Completed</p>
                        <p>{filter?.data?.passingAggregations._sum.value || passingAggregations._sum.value || 0}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Passes Completion Rate</p>
                        <p>{filter?.data?.passingAggregations._sum.outOf || passingAggregations._sum.outOf || 1}</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <h4>Strength</h4>
                    <div>
                        <p className="table-stat-name">Avg. Squat Duration w/Weights</p>
                        <p>{`${dbTimeToString(filter?.data?.squatAggregations.min || squatAggregations.min)}` || 'Not enough data'}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Best Squat Duration w/Weights</p>
                        <p>{`${dbTimeToString(filter?.data?.squatAggregations.average || squatAggregations.average)}` || 'Not enough data'}</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <h4>Jumping</h4>
                    <div>
                        <p className="table-stat-name">Highest Jump</p>
                        <p>{filter?.data?.jumpingAggregations.max || jumpingAggregations.max || 'Not enough data'}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Jump Height</p>
                        <p>{filter?.data?.jumpingAggregations.average || jumpingAggregations.average || 'Not enough data'}</p>
                    </div>
                </div>
            </div>
            <div className="overall-graph-container">
                <div className="report-card-graph">
                    <p>Avg. Squat Lifetime</p>
                </div>
                <div className="report-card-graph">
                    <p>Shots Made vs Attempted (lifetime)</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart width={800} height={400}>
                            <Pie data={lifetimePie} innerRadius={75} outerRadius={125} fill="#8884d8" paddingAngle={0} dataKey="value"></Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" align="center" />
                        </PieChart>
                    </ResponsiveContainer>
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
