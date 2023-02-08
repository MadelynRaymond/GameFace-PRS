import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { CSVLink } from 'react-csv'
import { CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getEntriesAggregate, getEntriesByDrillLiteral, getEntriesTotal } from '~/models/drill-entry.server'
import { requireUser } from '~/session.server'
import { dateFromDaysOptional, dbTimeToString, toDateString } from '~/util'

let orange = '#EDA75C'
let orangeAccent = '#E58274'
let black = '#000000'
let strokeWidth = 4

export async function loader({ request }: LoaderArgs) {
    const user = await requireUser(request)
    const { username, id } = user
    const url = new URL(request.url)
    const filter = url.searchParams.get('interval')
    const intervalLiteral = filter ? parseInt(filter) : null

    const interval = dateFromDaysOptional(intervalLiteral)
    const shootingData = await getEntriesByDrillLiteral({ drillName: 'Free Throws', userId: id, interval })
    const shootingRatio = shootingData.map((e) => ({
        ratio: Math.floor((e.value / (e.outOf as number)) * 100),
        created_at: toDateString(e.created_at.toString()),
    }))

    const passingData = await getEntriesByDrillLiteral({ drillName: 'Passing Drill', userId: id, interval })
    const passingRatio = passingData.map((e) => ({
        ratio: Math.floor((e.value / (e.outOf as number)) * 100),
        created_at: toDateString(e.created_at.toString()),
    }))
    const speedAggregations = await getEntriesAggregate({ drillName: 'Speed Drill', userId: id, interval })
    const dribblingAggregations = await getEntriesAggregate({ drillName: 'Dribbling Speed', userId: id, interval })
    const squatAggregations = await getEntriesAggregate({ drillName: 'Squat Drill', userId: id, interval })
    const passingAggregations = await getEntriesTotal({ drillName: 'Passing Drill', userId: id, interval })
    const shootingAggregations = await getEntriesTotal({ drillName: 'Free Throws', userId: id, interval })
    const jumpingAggregations = await getEntriesAggregate({ drillName: 'Jump Height Drill', userId: id, interval })

    return json({
        username,
        speedAggregations,
        dribblingAggregations,
        squatAggregations,
        shootingAggregations,
        passingAggregations,
        jumpingAggregations,
        shootingRatio,
        passingRatio,
    })
}

export default function Overall() {
    const {
        speedAggregations,
        shootingRatio,
        passingRatio,
        dribblingAggregations,
        squatAggregations,
        shootingAggregations,
        passingAggregations,
        jumpingAggregations,
        username,
    } = useLoaderData<typeof loader>()

    const filter = useFetcher<typeof loader>()

    const lifetimePie = [
        {
            name: 'Shots Attempted',
            value: filter?.data?.shootingAggregations._sum.outOf || shootingAggregations._sum.outOf,
            fill: orange,
        },
        {
            name: 'Shots Scored',
            value: filter?.data?.shootingAggregations._sum.value || shootingAggregations._sum.value,
            fill: orangeAccent,
        },
    ]

    const [downloadReady, setDownloadReady] = useState(false)

    useEffect(() => {
        setDownloadReady(true)
    }, [])

    const csvData = [
        {
            category: 'Speed',
            averageTime: dbTimeToString(speedAggregations.average || filter?.data?.speedAggregations.average || null),
            bestTime: dbTimeToString(speedAggregations.min || filter?.data?.speedAggregations.min || null),
        },
        {
            category: 'Shooting',
            shotsMade: filter?.data?.shootingAggregations._sum.value || shootingAggregations._sum.value,
            shotsAttempted: filter?.data?.shootingAggregations._sum.outOf || shootingAggregations._sum.outOf,
        },
        {
            category: 'Dribbling',
            averageTime: dbTimeToString(dribblingAggregations.average || filter?.data?.dribblingAggregations.average || null),
            bestTime: dbTimeToString(dribblingAggregations.min || filter?.data?.dribblingAggregations.min || null),
        },
        {
            category: 'Passing',
            passesCompleted: filter?.data?.passingAggregations._sum.value || passingAggregations._sum.value,
            passesAttempted: filter?.data?.passingAggregations._sum.outOf || passingAggregations._sum.outOf,
        },
        {
            category: 'Squat',
            averageTime: dbTimeToString(squatAggregations.average || filter?.data?.squatAggregations.average || null),
            bestTime: dbTimeToString(squatAggregations.min || filter?.data?.squatAggregations.min || null),
        },
        {
            category: 'Jumping',
            averageJumpHeight: (filter?.data?.jumpingAggregations.average || jumpingAggregations.average)?.toFixed(1),
            bestJumpHeight: filter.data?.jumpingAggregations.max || jumpingAggregations.max,
        },
    ]

    const csvHeaders = [
        { label: 'Category', key: 'category' },
        { label: 'Average', key: 'averageTime' },
        { label: 'Best', key: 'bestTime' },
        { label: 'Shots Made', key: 'shotsMade' },
        { label: 'Shots Attempted', key: 'shotsAttempted' },
        { label: 'Passes Completed', key: 'passesCompleted' },
        { label: 'Passes Attempted', key: 'passesAttempted' },
        { label: 'Average Jump Height', key: 'averageJumpHeight' },
        { label: 'Best Jump Height', key: 'bestJumpHeight' },
    ]

    return (
        <div>
            <div className="report-card-header">
                <div className="report-card-title">
                    <h2>Training Report Card</h2>
                    <p>Athlete: Danielle Williams (Year Overview)</p>
                </div>
                <div className="button-group no-print">
                    <p className="filter-heading">Select Filter:</p>
                    <div className="filter-button-group">
                        <button onClick={() => filter.load(`/${username}/stats?index&interval=30`)} className="filter-button month">
                            Month
                        </button>
                        <button onClick={() => filter.load(`/${username}/stats?index&interval=365`)} className="filter-button year">
                            Year
                        </button>
                        <button onClick={() => filter.load(`/${username}/stats?index`)} className="filter-button lifetime">
                            Lifetime
                        </button>
                    </div>
                    <div className="export-button-group">
                        <button onClick={() => window.print()} className="print-btn no-print btn">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="export-icons"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
                                />
                            </svg>
                        </button>
                        {downloadReady && (
                            <CSVLink className="btn export" headers={csvHeaders} data={csvData}>
                                Export
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="export-icons">
                                    <path
                                        fillRule="evenodd"
                                        d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </CSVLink>
                        )}
                    </div>
                </div>
            </div>

            <div className="overall-stat-table">
                <div className="stat-row flex-r crosses">
                    <h4>Speed</h4>
                    <div className="stat-row-item">
                        <p className="table-stat-name">Fastest Drill</p>
                        <p>{`${dbTimeToString(filter?.data?.speedAggregations.min || speedAggregations.min)}` || 'No data'}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Drill Speed</p>
                        <p>{`${dbTimeToString(filter?.data?.speedAggregations.average || speedAggregations.average)}` || 'No data'}</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <h4>Shooting</h4>
                    <div>
                        <p className="table-stat-name">Shots Made</p>
                        <p>{filter?.data?.shootingAggregations._sum.value || shootingAggregations._sum.value || 'No data'}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Shots Made/Attempted</p>
                        <p>{filter?.data?.shootingAggregations._sum.outOf || shootingAggregations._sum.outOf || 'No data'}</p>
                    </div>
                </div>
                <div className="stat-row flex-r dots">
                    <h4>Dribbling</h4>
                    <div>
                        <p className="table-stat-name">Fastest Drill w/no Mistakes</p>
                        <p>{`${dbTimeToString(filter?.data?.dribblingAggregations.min || dribblingAggregations.min)}` || 'No data'}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Drill w/no Mistakes</p>
                        <p>{`${dbTimeToString(filter?.data?.dribblingAggregations.average || dribblingAggregations.average)}` || 'No data'}</p>
                    </div>
                </div>
                <div className="stat-row flex-r accent">
                    <h4>Passing</h4>
                    <div>
                        <p className="table-stat-name">Passes Completed</p>
                        <p>{filter?.data?.passingAggregations._sum.value || passingAggregations._sum.value || 'No data'}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Passes Completion Rate</p>
                        <p>{filter?.data?.passingAggregations._sum.outOf || passingAggregations._sum.outOf || 'No data'}</p>
                    </div>
                </div>
                <div className="stat-row flex-r squiggles">
                    <h4>Strength</h4>
                    <div>
                        <p className="table-stat-name">Avg. Squat Duration w/Weights</p>
                        <p>{`${dbTimeToString(filter?.data?.squatAggregations.average || squatAggregations.average)}` || 'No data'}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Best Squat Duration w/Weights</p>
                        <p>{`${dbTimeToString(filter?.data?.squatAggregations.min || squatAggregations.min)}` || 'No data'}</p>
                    </div>
                </div>
                <div className="stat-row flex-r accent-2">
                    <h4>Jumping</h4>
                    <div>
                        <p className="table-stat-name">Highest Jump</p>
                        <p>{filter?.data?.jumpingAggregations.max || jumpingAggregations.max || 'No data'}</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Jump Height</p>
                        <p>{filter?.data?.jumpingAggregations.average?.toFixed(1) || jumpingAggregations.average?.toFixed(1) || 'No data'}</p>
                    </div>
                </div>
            </div>
            <div className="overall-graph-container">
                <div className="report-card-graph">
                    <p>Shots Made Over Time</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            width={730}
                            height={250}
                            data={filter?.data?.shootingRatio || shootingRatio}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorUv2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="80%" stopColor={orange} stopOpacity={0.8} />
                                    <stop offset="100%" stopColor={orange} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="created_at" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="ratio" stroke={orange} strokeWidth={strokeWidth} fillOpacity={4} fill="url(#colorUv2)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="report-card-graph">
                    <p>Shots Made vs Attempted</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart width={800} height={400}>
                            <Pie
                                data={lifetimePie}
                                animationDuration={800}
                                innerRadius={75}
                                outerRadius={125}
                                fill={orange}
                                paddingAngle={0}
                                dataKey="value"
                                stroke={black}
                                strokeWidth={strokeWidth}
                            ></Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" align="center" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="report-card-graph">
                    <p>Successful Pass Rate Over Time</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            width={730}
                            height={250}
                            data={filter?.data?.passingRatio || passingRatio}
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
                            <Line type="monotone" dataKey="ratio" stroke={orangeAccent} strokeWidth={strokeWidth} fillOpacity={1} fill="url(#colorUv2)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
