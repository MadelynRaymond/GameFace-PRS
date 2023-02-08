import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, BarChart, Bar, Line, LineChart } from 'recharts'
import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { requireUser } from '~/session.server'
import { getEntriesByDrillLiteral, getEntriesLastNReports, getEntriesTotal } from '~/models/drill-entry.server'
import { useCatch, useFetcher, useLoaderData } from '@remix-run/react'
import { dateFromDaysOptional, toDateString } from '~/util'
import { useEffect, useReducer, useState } from 'react'
import { z } from 'zod'

let orange = '#EDA75C'
let orangeAccent = '#E58274'
let black = '#000000'
let strokeWidth = 4


export const ShootingEntrySchema = z
    .object({
        created_at: z.coerce.string().transform((data) => toDateString(data)),
        value: z.coerce.number(),
        outOf: z.nullable(z.number()),
    })
    .array()
    .transform((data) => data.map((s) => ({ scored: s.value, attempted: s.outOf, created_at: s.created_at })))

export async function loader({ request }: LoaderArgs) {
    const { username, id } = await requireUser(request)
    const userId = id

    //fetch time interval from url
    const url = new URL(request.url)
    const filter = url.searchParams.get('interval')
    const intervalLiteral = filter ? parseInt(filter) : null
    const interval = dateFromDaysOptional(intervalLiteral)

    const shootingEntryData = await getEntriesByDrillLiteral({ drillName: 'Free Throws', userId, interval })
    const insufficientData = !shootingEntryData || shootingEntryData.length === 0

    if (insufficientData) {
        throw new Response("Not enough data", {status: 404})
    }


    try {
        
        const shootingSessionData = await getEntriesLastNReports({ drillName: 'Free Throws', userId, sessions: 7 })
        const [shootingEntries, lastSevenSessions] = await Promise.all([
            ShootingEntrySchema.parseAsync(shootingEntryData),
            ShootingEntrySchema.parseAsync(shootingSessionData)
        ])

        const scored = (await (await getEntriesTotal({ drillName: 'Free Throws', userId, interval }))._sum.value) as number
        const attempted = (await (await getEntriesTotal({ drillName: 'Free Throws', userId, interval }))._sum.outOf) as number
        const successPercentage = Math.floor((scored / attempted) * 100)

        return json({
            shootingEntries,
            lastSevenSessions,
            attempted,
            scored,
            successPercentage,
            username,
        })
    } catch (error) {
        console.log(error)
        throw new Response('Uh oh! There was a problem getting your stats.', { status: 500 })
    }
}
export default function Shooting() {
    const { scored, attempted, successPercentage, username, lastSevenSessions, shootingEntries } = useLoaderData<typeof loader>()
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
            filter.load(`/${username}/stats/shooting?interval=${state.interval}`)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state])

    const lifetimePie = [
        {
            name: 'Shots Attempted',
            value: attempted,
            fill: orange,
        },
        {
            name: 'Shots Scored',
            value: scored,
            fill: orangeAccent,
        },
    ]

    const percentPie = [
        {
            name: 'Shots Attempted as % (last 30 days)',
            value: 100 - (filter?.data?.successPercentage || successPercentage),
            fill: orange,
        },
        {
            name: 'Shots Scored as % (last 30 days)',
            value: filter?.data?.successPercentage || successPercentage,
            fill: orangeAccent,
        },
    ]

    return (
        <div>
            <div className="report-card-header">
                <div className="report-card-title">
                    <h2>Shooting Statistics </h2>
                    <p>Athlete: Danielle Williams (Year Overview)</p>
                </div>
                <div className="button-group">
                    <p className="filter-heading">Select Filter:</p>
                    <div className="filter-button-group">
                        <button onClick={() => dispatch({type: 'update', payload: 30})} className="filter-button month">
                            Month
                        </button>
                        <button onClick={() => dispatch({type: 'update', payload: 365})} className="filter-button year">
                            Year
                        </button>
                        <button onClick={() => dispatch({type: 'update'})} className="filter-button lifetime">
                            Lifetime
                        </button>
                    </div>
                </div>
            </div>
            <div className="stat-grid">
                <div className="stat-box-group">
                    <div className="stat-box">
                        <p className="stat-box__title">Shots Scored</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.scored || scored || 'No data'}</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                    <div className="stat-box accent">
                        <p className="stat-box__title">Shots Attempted</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.attempted || attempted || 'No data'}</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                    <div className="stat-box dots">
                        <p className="stat-box__title">Success Rate</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.successPercentage || successPercentage || 'No data'}</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                </div>
                <div className="flex graph-container">
                    <div className="flex flex-col align-center gap-1 h-full w-full">
                        <p>Last 30 Days: Shots Landed/Attempted</p>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart width={800} height={400}>
                                <Pie data={lifetimePie} innerRadius={75} outerRadius={125} fill="#8884d8" paddingAngle={0} dataKey="value" stroke={black} strokeWidth={strokeWidth}></Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col align-center gap-1 h-full w-full">
                        <p>Lifetime Overview: Shots Landed/Attempted</p>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart width={800} height={400}>
                                <Pie data={percentPie} innerRadius={75} outerRadius={125} fill="#8884d8" paddingAngle={0} dataKey="value" stroke={black} strokeWidth={strokeWidth}></Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>Last Seven Sessions: Shots Landed vs. Attempted</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart width={500} height={300} data={lastSevenSessions}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="created" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="scored" stackId="a" fill={orange} stroke={black} strokeWidth={strokeWidth} />
                            <Bar dataKey="attempted" stackId="a" fill={orangeAccent} stroke={black} strokeWidth={strokeWidth} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>{state.text}: Shots scored vs attempted</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            width={730}
                            height={250}
                            data={filter?.data?.shootingEntries || shootingEntries}
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
                            <Line dataKey="scored" stroke={orange} strokeWidth={strokeWidth} fill="url(#colorUv)" />
                            <Line dataKey="attempted" stroke={orange} strokeWidth={strokeWidth} fill="url(#colorPv)"/>
                        </LineChart>
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

    if (caught.status === 500){
        return (
            <div className="flex justify-center">
                <h2>{caught.data}</h2>
            </div>
        )
    }

    throw new Error(`Unexpected caught response with status: ${caught.status}`)
}
