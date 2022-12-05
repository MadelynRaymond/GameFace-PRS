import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from 'recharts';

export default function Shooting() {
  const pie = [
    { name: "Shots Attempted", value: 55, fill: "#0088FE" },
    { name: "Shots Scored", value: 25, fill: "#00C49F" },
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

      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={800} height={400}>
          <Pie
            data={pie}
            innerRadius={75}
            outerRadius={125}
            fill="#8884d8"
            paddingAngle={0}
            dataKey="value"
          >
          </Pie>
          <Legend
            verticalAlign='bottom'
            align='center'            
          />
        </PieChart>
      </ResponsiveContainer>

      <ResponsiveContainer  width="100%" height="100%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>

      

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}