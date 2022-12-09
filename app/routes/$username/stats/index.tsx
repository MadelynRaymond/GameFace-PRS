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

    function print(){
        window.print()
    }

    return (
        <div>
            <div className="report-card-header">
                <div className="report-card-title">
                    <h2>Training Report Card</h2>
                    <p>Current Year (2022)</p>
                </div>
                <div className="button-group">
                    <div className="export-button-group">
                        <button onClick={print}className="export-button">Print</button>
                    </div>
                </div>
            </div>

            <div className="overall-stat-table">
                <div className="stat-row flex-r">
                    <p>Speed</p>
                    <div className="stat-row-item">
                        <p className="table-stat-name">Best Speed</p>
                        <p>0.4</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Speed</p>
                        <p>0.4</p>
                    </div>
                </div>
                <div className="stat-row flex-r">
                    <p>Shooting</p>
                    <div>
                        <p className="table-stat-name">Overall Shots Made</p>
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
                        <p className="table-stat-name">Best Drill Length</p>
                        <p>0.4</p>
                    </div>
                    <div>
                        <p className="table-stat-name">Avg. Drill Length</p>
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
            
        </div>
    )
}
