import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Area, AreaChart, BarChart, Bar } from 'recharts';
import { curveCardinal } from 'd3-shape';
export default function Jumping() {
  const cardinal = curveCardinal.tension(0.2);

  const pie = [
    { name: "Shots Attempted", value: 55, fill: "#DF7861" },
    { name: "Shots Scored", value: 25, fill: "#ECB390" },
  ];

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
  ];

  return (
    <div className='stat-grid'>
      <div className="stat-box-group">
        <div className="stat-box">
          <p className="stat-box__title">
            Shots Attempted
          </p>
          <div className="stat-box__data">
            <p className="stat-box__figure">3,028</p>
            <p className="stat-box__regression">
                <span className="up-symbol">▼</span>4.1%
            </p>
            <p className="stat-box__desc">in last 30 days</p>
          </div>
        </div>

        <div className="stat-box">
          <p className="stat-box__title">
            Shots Attempted
          </p>
          <div className="stat-box__data">
            <p className="stat-box__figure">3,028</p>
            <p className="stat-box__regression">
                <span className="up-symbol">▼</span>4.1%
            </p>
            <p className="stat-box__desc">in last 30 days</p>
          </div>
        </div>

        <div className="stat-box">
          <p className="stat-box__title">
            Shots Attempted
          </p>
          <div className="stat-box__data">
            <p className="stat-box__figure">3,028</p>
            <p className="stat-box__regression">
                <span className="up-symbol">▼</span>4.1%
            </p>
            <p className="stat-box__desc">in last 30 days</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer  width="100%" height="100%">
      <BarChart
          width={500}
          height={300}
          data={data}
        
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="pv" stackId="a" fill="#DF7861" />
        </BarChart>
      </ResponsiveContainer>

      <ResponsiveContainer  width="100%" height="100%">
      <BarChart
          width={500}
          height={300}
          data={data}
        
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="uv" stackId="a" fill="#ECB390" />
        </BarChart>
      </ResponsiveContainer>
           
      <ResponsiveContainer width="100%" height="100%">
      <AreaChart width={730} height={250} data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#DF7861" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#DF7861" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ECB390" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#ECB390" stopOpacity={0}/>
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
  );
}