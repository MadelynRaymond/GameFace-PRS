import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Area, AreaChart, BarChart, Bar } from 'recharts'
import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { requireUser } from '~/session.server'
import { getEntriesLastNReports, getEntriesTotal } from '~/models/drill-entry.server'
import { useCatch, useFetcher, useLoaderData } from '@remix-run/react'
import { dateFromDaysOptional } from '~/util'
import { useState, useReducer, useEffect } from 'react'

export async function loader({ request }: LoaderArgs) {
    const {username, id}= await requireUser(request)
    const userId = id

    const lastSevenSessions = await getEntriesLastNReports({
        drillName: 'Passing Drill',
        userId,
        sessions: 7,
    })

    const url = new URL(request.url)
    const filter = url.searchParams.get('interval')
    const intervalLiteral = filter ? parseInt(filter) : null
    const interval = dateFromDaysOptional(intervalLiteral)

    const passes = await getEntriesTotal({drillName: "Passing Drill", userId, interval})

    const insufficientData = passes._sum.outOf === 0

    if (insufficientData) {
        throw new Response('Not enough data', { status: 404 })
    }
    const [passesMade, passesAttempted] = [passes._sum.value || 0, passes._sum.outOf || 1]


    const successPercentage = Math.floor((passesMade / passesAttempted) * 100)

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
        username,
        sessionScores,
        passesAttempted,
        passesMade,
        sessionPercentChange,
        successPercentage
    })
}
export default function Shooting() {
    const {username, sessionScores, passesAttempted, passesMade, successPercentage, sessionPercentChange} = useLoaderData<typeof loader>()
    const lifetimePie = [
        {
            name: 'Passes Attempted (lifetime)',
            value: passesAttempted,
            fill: '#DF7861',
        },
        {
            name: 'Passes Made (lifetime)',
            value: passesMade,
            fill: '#ECB390',
        },
    ]

    const lastMonthPie = [
        {
            name: 'Passes Attempted (last 30 days)',
            value: passesAttempted,
            fill: '#DF7861',
        },
        {
            name: 'Passes Made (last 30 days)',
            value: passesMade,
            fill: '#ECB390',
        },
    ]

    const intervalReducer = (_state: {text: string}, action: {type: 'update', payload?: number}): {text: string} => {
        if (action.type !== 'update'){
           throw new Error("Unknown action") 
        }

        switch (action.payload) {
            case 30: return {text: 'Last 30 days'}
            case 365: return {text: "Last year"}
            default: return {text: 'Lifetime'}
        }
    }
    const filter = useFetcher<typeof loader>()
    const [interval, setInterval] = useState<number | undefined>(undefined)
    const [state, dispatch] = useReducer(intervalReducer, {text: ''})

    useEffect(() => {
        filter.load(`/${username}/stats/passing?interval=${interval}`)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interval])

    useEffect(() => {
        dispatch({type: 'update', payload: interval})
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter.data])

    return (
        <div>
            <div className="report-card-header">
            <div className="report-card-title">
                <h2>Passing Statistics </h2>
                <p>Athlete: Danielle Williams (Year Overview)</p>
            </div>
            <div className="button-group">
                <p className="filter-heading">Select Filter:</p>
                <div className="filter-button-group">
                    <button onClick={() => setInterval(30)} className="filter-button">Month</button>
                    <button onClick={() => setInterval(365)}className="filter-button">Year</button>
                    <button onClick={() => setInterval(undefined)} className="filter-button">Lifetime</button>
                </div>
            </div>
            </div>
            <div className="stat-grid">
                <div className="stat-box-group">
                    <div className="stat-box">
                        <p className="stat-box__title">Successful Passes</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.passesMade || passesMade}</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                    <div className="stat-box">
                        <p className="stat-box__title">Attepted Passes</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.passesAttempted || passesAttempted}</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                    <div className="stat-box">
                        <p className="stat-box__title">Avg. Pass Success Rate</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{successPercentage}%</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                </div>
                <div className="flex graph-container">
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
                <div className="flex flex-col align-center gap-1 graph-container">
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
                <div className="flex flex-col align-center gap-1 graph-container">
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
