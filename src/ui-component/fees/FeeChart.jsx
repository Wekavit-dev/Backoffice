// src/components/fees/FeeChart.jsx
import React from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Area, AreaChart
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const CustomTooltip = ({ active, payload, label, valuePrefix = '', valueSuffix = '' }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
            {payload.map((entry, index) => (
                <p key={index} className="text-sm" style={{ color: entry.color }}>
                    {entry.name}: {valuePrefix}{entry.value.toLocaleString('fr-FR')}{valueSuffix}
                </p>
            ))}
        </div>
    );
};

export const BarChartComponent = ({
    data,
    dataKey = 'totalFees',
    nameKey = 'name',
    title,
    height = 300,
    valuePrefix = '',
    valueSuffix = '',
    barColor = '#3B82F6'
}) => {
    if (!data?.length) {
        return (
            <div className="flex items-center justify-center" style={{ height }}>
                <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
        );
    }

    return (
        <div>
            {title && <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{title}</h4>}
            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey={nameKey} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />} />
                    <Legend />
                    <Bar dataKey={dataKey} fill={barColor} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const PieChartComponent = ({
    data,
    dataKey = 'totalFees',
    nameKey = 'label',
    title,
    height = 300
}) => {
    if (!data?.length) {
        return (
            <div className="flex items-center justify-center" style={{ height }}>
                <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
        );
    }

    return (
        <div>
            {title && <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{title}</h4>}
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey={dataKey}
                        nameKey={nameKey}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip valuePrefix="" valueSuffix="" />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export const LineChartComponent = ({
    data,
    lines = [{ dataKey: 'totalFees', name: 'Frais', color: '#3B82F6' }],
    title,
    height = 300,
    xAxisKey = 'date',
    valuePrefix = '',
    valueSuffix = ''
}) => {
    if (!data?.length) {
        return (
            <div className="flex items-center justify-center" style={{ height }}>
                <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
        );
    }

    return (
        <div>
            {title && <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{title}</h4>}
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />} />
                    <Legend />
                    {lines.map((line, idx) => (
                        <Line
                            key={idx}
                            type="monotone"
                            dataKey={line.dataKey}
                            name={line.name}
                            stroke={line.color}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};