import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function Overall() {
    const pie = [
        {
            name: 'Shots Attempted',
            value: 55,
            fill: '#DF7861',
        },
        {
            name: 'Shots Scored',
            value: 25,
            fill: '#ECB390',
        },
    ]

    const data = [
        {
            name: 'Page A',
            uv: 4000,
            pv: 2400,
            amt: 2400,
        },
        {
            name: 'Page B',
            uv: 3000,
            pv: 1398,
            amt: 2210,
        },
        {
            name: 'Page C',
            uv: 2000,
            pv: 9800,
            amt: 2290,
        },
        {
            name: 'Page D',
            uv: 2780,
            pv: 3908,
            amt: 2000,
        },
        {
            name: 'Page E',
            uv: 1890,
            pv: 4800,
            amt: 2181,
        },
        {
            name: 'Page F',
            uv: 2390,
            pv: 3800,
            amt: 2500,
        },
        {
            name: 'Page G',
            uv: 3490,
            pv: 4300,
            amt: 2100,
        },
    ]

    return (
        <div>
            <div className="report-card-header">
                <div className="report-card-title">
                    <h2>Training Report Card</h2>
                    <p>Current Year (2022)</p>
                </div>
                <div className="button-group">
                    <div className="filter-button-group">
                        <button className="filter-button">Month</button>
                        <button className="filter-button">Year</button>
                        <button className="filter-button">Lifetime</button>
                    </div>
                    <div className="export-button-group">
                        <button className="export-button">Print Icon</button>
                        <button className="export-button">Export Icon</button>
                    </div>
                </div>
            </div>

            <div className="overall-stat-table">
                <div className="stat-row flex-r">
                    <p>Speed</p>
                    <div className="stat-row-item">
                        <p className="table-stat-name">Fastest Drill</p>
                        <p>0.4</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Drill Speed</p>
                        <p>0.4</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <p>Shooting</p>
                    <div>
                        <p className="table-stat-name">Shots Made</p>
                        <p>0.4</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Shots Made/Attempted</p>
                        <p>0.4</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <p>Dribbling</p>
                    <div>
                        <p className="table-stat-name">Fastes Drill w/no Mistakes</p>
                        <p>0.4</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Drill w/no Mistakes</p>
                        <p>0.4</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <p>Passing</p>
                    <div>
                        <p className="table-stat-name">Fastest Target Hit</p>
                        <p>0.4</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Target Hit Speed</p>
                        <p>0.4</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <p>Strength</p>
                    <div>
                        <p className="table-stat-name">Avg. Squat Duration w/Weights</p>
                        <p>0.4</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. One-Leg Drill Duration w/Weights</p>
                        <p>0.4</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <p>Jumping</p>
                    <div>
                        <p className="table-stat-name">Highest Jump</p>
                        <p>0.4</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Junp Height</p>
                        <p>0.4</p>
                    </div>
                </div>
            </div>
            <div className="overall-graph-container">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart width={500} height={300} data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="pv" stackId="a" fill="#DF7861" />
                        <Bar dataKey="uv" stackId="a" fill="#ECB390" />
                    </BarChart>
                </ResponsiveContainer>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart width={800} height={400}>
                        <Pie data={pie} innerRadius={75} outerRadius={125} fill="#8884d8" paddingAngle={0} dataKey="value"></Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" align="center" />
                    </PieChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        width={730}
                        height={250}
                        data={data}
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
                        <XAxis dataKey="name" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="uv" stroke="#DF7861" fillOpacity={1} fill="url(#colorUv)" />
                        <Area type="monotone" dataKey="pv" stroke="#DF7861" fillOpacity={1} fill="url(#colorPv)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
