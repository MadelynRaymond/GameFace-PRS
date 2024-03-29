import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Area, AreaChart, BarChart, Bar } from 'recharts'
import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { fetchAthlete, requireUser } from '~/session.server'
import { getEntriesByDrillLiteral, getEntriesLastNReports, getEntriesTotal } from '~/models/drill-entry.server'
import { useCatch, useFetcher, useLoaderData, useParams } from '@remix-run/react'
import { dateFromDaysOptional, toDateString } from '~/util'
import { useReducer, useEffect } from 'react'
import { z } from 'zod'
import ReportCardHeader from '~/components/ReportCardHeader'

let orange = '#EDA75C'
let orangeAccent = '#E58274'
let black = '#000000'
let strokeWidth = 4

const PassesEntrySchema = z
    .object({
        created_at: z.coerce.string().transform((data) => toDateString(data)),
        value: z.coerce.number(),
        outOf: z.nullable(z.number()),
    })
    .array()
    .transform((data) => data.map((s) => ({ completed: s.value, attempted: s.outOf, created_at: s.created_at })))

export async function loader({ request, params }: LoaderArgs) {
    const user = await requireUser(request)
    const athlete = await fetchAthlete(user, params.username as string)
    const {id, ...athleteInfo} = athlete!
    const userId = id

    const url = new URL(request.url)
    const filter = url.searchParams.get('interval')
    const intervalLiteral = filter ? parseInt(filter) : null
    const interval = dateFromDaysOptional(intervalLiteral)

    const passingEntryData = await getEntriesByDrillLiteral({ drillName: 'Passing Drill', userId, interval })
    const insufficientData = !passingEntryData || passingEntryData.length === 0

    if (insufficientData) {
        throw new Response('Not enough data', { status: 404 })
    }

    try {
        const passingSessionData = await getEntriesLastNReports({ drillName: 'Passing Drill', userId, sessions: 7 })

        const [passingEntries, lastSevenSessions] = await Promise.all([
            PassesEntrySchema.parseAsync(passingEntryData),
            PassesEntrySchema.parseAsync(passingSessionData),
        ])

        const totalPasses = await getEntriesTotal({ drillName: 'Passing Drill', userId, interval })
        const [passesMade, passesAttempted] = [totalPasses._sum.value, totalPasses._sum.outOf]
        const successPercentage = Math.floor(((passesMade as number) / (passesAttempted as number)) * 100)

        return json({
            passingEntries,
            lastSevenSessions,
            successPercentage,
            passesMade,
            passesAttempted,
            athleteInfo
        })
    } catch (error) {
        throw new Response('Internal server error', { status: 500 })
    }
}
export default function Shooting() {
    const { athleteInfo, passingEntries, passesAttempted, passesMade, successPercentage, lastSevenSessions } = useLoaderData<typeof loader>()
    const {username, profile} = athleteInfo
    const params = useParams()

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
            filter.load(`/${params.username as string}/stats/passing?interval=${state.interval}`)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state])

    const lifetimePie = [
        {
            name: 'Passes Attempted',
            value: filter?.data?.passesAttempted || passesAttempted,
            fill: orange,
        },
        {
            name: 'Passes Made',
            value: filter?.data?.passesMade || passesMade,
            fill: orangeAccent,
        },
    ]

    return (
        <div className='stats-summary'>
            <ReportCardHeader header={'Passing Statistics'} firstName={profile?.firstName} lastName={profile?.lastName} dispatch={dispatch} />
            <div className="stat-grid">
                <div className="stat-box-group no-print">
                    <div className="stat-box accent-2">
                        <p className="stat-box__title">Successful Passes</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.passesMade || passesMade}</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                    <div className="stat-box crosses">
                        <p className="stat-box__title">Attepted Passes</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.passesAttempted || passesAttempted}</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                    <div className="stat-box accent-2">
                        <p className="stat-box__title">Avg. Pass Success Rate</p>
                        <div className="stat-box__data">
                            <p className="stat-box__figure">{filter?.data?.successPercentage || successPercentage}%</p>
                            <p className="stat-box__desc">{state.text}</p>
                        </div>
                    </div>
                </div>
                <div className="flex graph-container">
                    <div className="flex flex-col align-center gap-1 h-full w-full">
                        <p>Last 30 Days: Missed vs. Landed</p>
                        <ResponsiveContainer width="99%" height="99%">
                            <PieChart width={800} height={400}>
                                <Pie data={lifetimePie} innerRadius={75} outerRadius={125} fill={orangeAccent} paddingAngle={0} dataKey="value" stroke={black} strokeWidth={strokeWidth}></Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                </div>
                <div className="flex flex-col align-center gap-1 graph-container">
                    <p>Last Seven Sessions: Pass Success Rate</p>
                    <ResponsiveContainer width="99%" height="99%">
                        <BarChart width={500} height={300} data={filter?.data?.lastSevenSessions || lastSevenSessions}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="created" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="completed" stackId="a" fill={orange} stroke={black} strokeWidth={strokeWidth} />
                            <Bar dataKey="attempted" stackId="a" fill={orangeAccent} stroke={black} strokeWidth={strokeWidth}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col align-center gap-1 graph-container page-break">
                    <p>{state.text}: Pass Success Rate (percent)</p>
                    <ResponsiveContainer width="99%" height="99%">
                        <AreaChart
                            width={730}
                            height={250}
                            //Conver entries to ratio
                            data={
                                filter?.data?.passingEntries.map((e) => ({ ratio: Math.floor((e.completed / (e.attempted as number)) * 100) })) ||
                                passingEntries.map((e) => ({ ratio: Math.floor((e.completed / (e.attempted as number)) * 100) }))
                            }
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={orangeAccent} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={orangeAccent} stopOpacity={0} />
                                </linearGradient>
                                
                            </defs>
                            <XAxis dataKey="created" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="ratio" stroke={black} strokeWidth={strokeWidth} fillOpacity={1} fill="url(#colorUv)" />
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
