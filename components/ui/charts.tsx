'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  title: string;
  description?: string;
  data: ChartData[];
  maxValue?: number;
}

export function BarChart({ title, description, data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">{item.value}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.color || 'bg-blue-500'
                  }`}
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface PieChartProps {
  title: string;
  description?: string;
  data: ChartData[];
}

export function PieChart({ title, description, data }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-amber-500',
    'bg-red-500',
    'bg-cyan-500',
    'bg-pink-500',
    'bg-orange-500',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Simple ring visualization */}
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const angle = (percentage / 100) * 360;
                const startAngle = currentAngle;
                currentAngle += angle;

                const radius = 40;
                const circumference = 2 * Math.PI * radius;
                const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                const rotation = startAngle;

                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={`hsl(${(index * 45) % 360}, 70%, 50%)`}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={0}
                    transform={`rotate(${rotation} 50 50)`}
                    className="transition-all"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}
                    style={{ backgroundColor: `hsl(${(index * 45) % 360}, 70%, 50%)` }}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.value} ({((item.value / total) * 100).toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface LineChartProps {
  title: string;
  description?: string;
  data: ChartData[];
  color?: string;
}

export function LineChart({ title, description, data, color = 'stroke-blue-500' }: LineChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <svg viewBox="0 0 100 50" className="w-full h-32" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y / 2}
                x2="100"
                y2={y / 2}
                stroke="currentColor"
                strokeWidth="0.2"
                className="text-gray-200"
              />
            ))}
            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={color}
            />
            {/* Area fill */}
            <polygon
              points={`0,50 ${points} 100,50`}
              fill="currentColor"
              className={`${color.replace('stroke', 'fill')} opacity-10`}
            />
          </svg>
          <div className="flex justify-between text-xs text-muted-foreground">
            {data.map((item, index) => (
              <div key={index} className="text-center">
                <div className="font-medium">{item.value}</div>
                <div>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProgressChartProps {
  title: string;
  description?: string;
  current: number;
  total: number;
  color?: string;
  formatAsCurrency?: boolean;
}

export function ProgressChart({ 
  title, 
  description, 
  current, 
  total, 
  color = 'bg-blue-500',
  formatAsCurrency = false 
}: ProgressChartProps) {
  const percentage = (current / total) * 100;
  
  const formatValue = (value: number) => {
    if (formatAsCurrency) {
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
    return value.toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="text-4xl font-bold">{formatValue(current)}</div>
            <div className="text-2xl text-muted-foreground pb-1">/ {formatValue(total)}</div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{percentage.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${color}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
