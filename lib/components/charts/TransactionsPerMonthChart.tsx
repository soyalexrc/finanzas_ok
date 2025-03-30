'use dom';

import {ResponsiveContainer, Tooltip, XAxis, LineChart, Line, Dot, Legend, BarChart, Bar} from 'recharts';
import {Colors, DATE_COLORS} from "@/lib/constants/colors";
import {useState} from "react";

type Props = {
    dom: import('expo/dom').DOMProps,
    width: number,
    height: number
    data: any[];
    onChartPressed: (data: any) => void;
    currency: string;
}

const customTooltipStyle = {
    fontWeight: "bold",
    fontFamily: "sans-serif",
    borderRadius: 12,
    borderColor: '#e1e1e1'
};

const customFontStyle = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
    color: '#333',
};

export default function TransactionsPerMonthChart({dom, width, height, data, currency, onChartPressed}: Props) {
    const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

    const handleChartClick = (event: any) => {
        if (event && event.activePayload) {
            const clickedPointIndex = event.activeTooltipIndex;
            setSelectedPoint(clickedPointIndex);
            console.log("Clicked Point Data:", event.activePayload[0].payload);
            onChartPressed(event.activePayload[0].payload)
        }
    };
    return (
        <div style={{width, height, overflow: 'hidden !important', userSelect: 'none'}}>
            <ResponsiveContainer width="100%" height="100%" style={{ overflow: 'hidden !important' }}>
                <BarChart data={data} onClick={handleChartClick} >
                    {/*<Tooltip*/}
                    {/*    cursor={{fill: "rgba(0, 0, 0, 0.1)"}}*/}
                    {/*    contentStyle={{*/}
                    {/*        fontWeight: 'bold',*/}
                    {/*        fontFamily: 'sans-serif'*/}
                    {/*    }}*/}
                    {/*/>*/}
                    <XAxis dataKey="nameShort" interval={0} angle={-45} textAnchor="end" style={customFontStyle}/>
                    <Bar dataKey="expense" fill={DATE_COLORS.yesterday}/>
                    {/*<Bar dataKey="income" fill={DATE_COLORS.today}/>*/}
                </BarChart>
                {/*<LineChart data={data} onClick={handleChartClick}>*/}
                {/*    /!*<Tooltip*!/*/}
                {/*    /!*    cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}*!/*/}
                {/*    /!*    contentStyle={customTooltipStyle}*!/*/}
                {/*    /!**!/*/}
                    {/*/>*/}
                {/*    <XAxis*/}
                {/*        dataKey="nameShort"*/}
                {/*        interval={0}*/}
                {/*        angle={-45}*/}
                {/*        textAnchor="end"*/}
                {/*        style={customFontStyle}*/}
                {/*    />*/}
                {/*    <Legend />*/}
                {/*    <Line*/}
                {/*        type="monotone"*/}
                {/*        dataKey="expense"*/}
                {/*        stroke="#FF5733"*/}
                {/*        strokeWidth={2}*/}
                {/*        dot={(props) =>*/}
                {/*            selectedPoint === props.index ? (*/}
                {/*                <Dot {...props} fill="#fff" r={6} stroke="black" strokeWidth={2} />*/}
                {/*            ) : (*/}
                {/*                <Dot {...props} fill={Colors.primary} r={4} />*/}
                {/*            )*/}
                {/*        }*/}
                {/*    />*/}
                {/*    <Line*/}
                {/*        type="monotone"*/}
                {/*        dataKey="income"*/}
                {/*        stroke="#28A745"*/}
                {/*        strokeWidth={2}*/}
                {/*        dot={(props) =>*/}
                {/*            selectedPoint === props.index ? (*/}
                {/*                <Dot {...props} fill="#fff" r={6} stroke="black" strokeWidth={2} />*/}
                {/*            ) : (*/}
                {/*                <Dot {...props} fill="#28A745" r={4} />*/}
                {/*            )*/}
                {/*        }*/}
                {/*    />*/}
                {/*</LineChart>*/}
            </ResponsiveContainer>
        </div>
    );
}
