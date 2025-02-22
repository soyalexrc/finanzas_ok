'use dom';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {useAuth} from "@/lib/context/AuthContext";
import {useYearlyExpensesByCategory} from "@/lib/utils/api/transactions";
import {CurrencyV2} from "@/lib/store/features/transactions/currencies.slice";


type Props = {
    dom: import('expo/dom').DOMProps,
    width: number,
    height: number,
    data: { name: string, value: number }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export default function CategoryDonutChart({ width, height, dom, data }: Props) {


    return (
        <div style={{ width, height, overflow: 'hidden' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        innerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        className="no-outline"
                    >
                        {data.map((entry, index) => (
                            <Cell  style={{ outline: "none" }} key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
