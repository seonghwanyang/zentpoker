'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
<<<<<<< HEAD
import { ChartTooltipProps } from '@/types/prisma'
=======
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  BarChart, 
  LineChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  Activity,
  Download,
  Calendar,
  FileSpreadsheet
} from 'lucide-react'

// Mock 데이터
const mockDailyRevenue = [
  { date: '12/14', revenue: 450000, transactions: 12 },
  { date: '12/15', revenue: 680000, transactions: 18 },
  { date: '12/16', revenue: 520000, transactions: 15 },
  { date: '12/17', revenue: 890000, transactions: 24 },
  { date: '12/18', revenue: 720000, transactions: 20 },
  { date: '12/19', revenue: 950000, transactions: 28 },
  { date: '12/20', revenue: 1100000, transactions: 32 },
]

const mockMemberActivity = [
  { name: '김철수', points: 450000, vouchers: 12, tournaments: 8 },
  { name: '이영희', points: 380000, vouchers: 10, tournaments: 6 },
  { name: '박민수', points: 320000, vouchers: 8, tournaments: 5 },
  { name: '최지원', points: 280000, vouchers: 7, tournaments: 4 },
  { name: '정현우', points: 250000, vouchers: 6, tournaments: 4 },
]

const mockVoucherDistribution = [
  { name: 'Buy-in', value: 65, color: '#8b5cf6' },
  { name: 'Re-buy', value: 35, color: '#a78bfa' },
]

const mockMonthlyStats = {
  totalRevenue: 15420000,
  revenueGrowth: 23.5,
  totalMembers: 156,
  memberGrowth: 12.8,
  totalTransactions: 423,
  transactionGrowth: 18.2,
  averageTransaction: 36450,
}

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState('week')
  const [reportType, setReportType] = useState('revenue')

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = () => {
    // 실제로는 서버에서 엑셀 파일 생성 API 호출
    console.log('Downloading Excel report...')
  }

  // 커스텀 툴팁
<<<<<<< HEAD
  const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
=======
  const CustomTooltip = ({ active, payload, label }: any) => {
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium">{label}</p>
<<<<<<< HEAD
          {payload.map((entry, index) => (
=======
          {payload.map((entry: any, index: number) => (
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
              {entry.name === 'revenue' ? '원' : '건'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">리포트 & 분석</h1>
          <p className="text-muted-foreground mt-2">
            비즈니스 성과와 회원 활동을 분석하세요.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">최근 7일</SelectItem>
              <SelectItem value="month">최근 30일</SelectItem>
              <SelectItem value="quarter">최근 3개월</SelectItem>
              <SelectItem value="year">최근 1년</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleExcelDownload} variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            엑셀 다운로드
          </Button>
        </div>
      </div>

      {/* 핵심 지표 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">총 수익</p>
              <p className="text-2xl font-bold">
                {mockMonthlyStats.totalRevenue.toLocaleString()}원
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">
                  +{mockMonthlyStats.revenueGrowth}%
                </span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">총 회원</p>
              <p className="text-2xl font-bold">{mockMonthlyStats.totalMembers}명</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">
                  +{mockMonthlyStats.memberGrowth}%
                </span>
              </div>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">총 거래</p>
              <p className="text-2xl font-bold">{mockMonthlyStats.totalTransactions}건</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">
                  +{mockMonthlyStats.transactionGrowth}%
                </span>
              </div>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">평균 거래액</p>
              <p className="text-2xl font-bold">
                {mockMonthlyStats.averageTransaction.toLocaleString()}원
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-500">-5.2%</span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* 차트 섹션 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 일별 수익 차트 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">일별 수익 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockDailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="수익"
              />
              <Line 
                type="monotone" 
                dataKey="transactions" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="거래건수"
                yAxisId="right"
              />
              <YAxis yAxisId="right" orientation="right" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* 바인권 분포 차트 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">바인권 유형별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockVoucherDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {mockVoucherDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* 회원 활동 순위 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">회원 활동 TOP 5</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-3">순위</th>
                <th className="text-left pb-3">회원명</th>
                <th className="text-right pb-3">총 포인트 사용</th>
                <th className="text-right pb-3">바인권 구매</th>
                <th className="text-right pb-3">토너먼트 참가</th>
                <th className="text-center pb-3">활동 등급</th>
              </tr>
            </thead>
            <tbody>
              {mockMemberActivity.map((member, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3">
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                      {index + 1}위
                    </Badge>
                  </td>
                  <td className="py-3 font-medium">{member.name}</td>
                  <td className="py-3 text-right">
                    {member.points.toLocaleString()}원
                  </td>
                  <td className="py-3 text-right">{member.vouchers}개</td>
                  <td className="py-3 text-right">{member.tournaments}회</td>
                  <td className="py-3 text-center">
                    <Badge variant="gradient">VIP</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 상세 리포트 섹션 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">상세 리포트</h3>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">수익 분석</SelectItem>
              <SelectItem value="member">회원 분석</SelectItem>
              <SelectItem value="voucher">바인권 분석</SelectItem>
              <SelectItem value="tournament">토너먼트 분석</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {reportType === 'revenue' && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mockDailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="revenue" fill="#8b5cf6" name="일별 수익" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  )
}
