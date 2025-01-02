'use dom';

import {BarChart, Bar, ResponsiveContainer, Legend, Tooltip, XAxis} from 'recharts';
import {Colors, DATE_COLORS} from "@/lib/constants/colors";
import {getMonthName} from "@/lib/helpers/string";

type Props = {
    dom: import('expo/dom').DOMProps,
    width: number,
    height: number
    onMouseMove:  () => Promise<void>;
    data: any[];
    currency: string;
}

const data = [
    { name: 'January', nameShort: 'Jan', expense: 4000, income: 2400 },
    { name: 'February', nameShort: 'Feb', expense: 3000, income: 1398 },
    { name: 'March', nameShort: 'Mar', expense: 2000, income: 9800 },
    { name: 'April', nameShort: 'Apr', expense: 2780, income: 3908 },
    { name: 'May', nameShort: 'May', expense: 1890, income: 4800 },
    { name: 'June', nameShort: 'Jun', expense: 2390, income: 3800 },
    { name: 'July', nameShort: 'Jul', expense: 3490, income: 4300 },
    { name: 'August',  nameShort: 'Aug', expense: 4000, income: 2400 },
    { name: 'September', nameShort: 'Sep', expense: 3000, income: 1398 },
    { name: 'October', nameShort: 'Oct', expense: 2000, income: 9800 },
    { name: 'November', nameShort: 'Nov', expense: 2780, income: 3908 },
    { name: 'December', nameShort: 'Dec', expense: 1890, income: 4800 },
];

const customTooltipStyle = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
    color: '#333',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    padding: '10px',
};

const customFontStyle = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
    color: '#333',
};

export default function TransactionsPerMonthChart({dom, width, height, data, currency}: Props) {
    console.log('data', data);

    function formatData() {
        return data?.map((item) => ({
            name: getMonthName(item.month).name,
            nameShort: getMonthName(item.month).nameShort,
            expense: item.expense[currency],
            income: item.income[currency],
        }));
    }

    console.log('formattedData', formatData());
    console.log(currency);

    return (
        <div style={{width, height, overflow: 'hidden'}}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatData()}>
                    <XAxis dataKey="nameShort" interval={0} angle={-45} textAnchor="end" style={customFontStyle}/>
                    <Bar dataKey="expense" fill={DATE_COLORS.yesterday} />
                    <Bar dataKey="income" fill={DATE_COLORS.today}/>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
