'use client'

import { useState, useEffect } from 'react'
import { redirect } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  FileSpreadsheet,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface ReportData {
  summary: {
    totalDeposits: number
    totalMembers: number
    totalTransactions: number
    avgTransaction: number
    depositChange: number
    memberChange: number
    transactionChange: number
    avgTransactionChange: number
  }
  charts: {
    dailyRevenue: Array<{
      date: string
      revenue: number
      transactions: number
    }>
    voucherDistribution: Array<{
      name: string
      value: number
      percentage: number
    }>
  }
  topMembers: Array<{
    rank: number
    name: string
    totalPoints: number
    voucherCount: number
    tournamentCount: number
    grade: string
  }>
  detailedReport: any[]
}

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']

export default function AdminReportsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7days')
  const [reportType, setReportType] = useState('revenue')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const supabase = createClientComponentClient()

  // Fetch report data
  const fetchReportData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/reports?period=${dateRange}&type=${reportType}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch report data')
      }
      
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Error fetching report data:', error)
      toast.error('리포트 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 사용자 인증 상태 확인
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error checking user:', error)
      }
    }
    
    checkUser()
  }, [supabase])

  useEffect(() => {
    if (user && user.email === 'yangseonghwan119@gmail.com') {
      fetchReportData()
    }
  }, [user, dateRange, reportType])

  // Excel download handler
  const handleExcelDownload = async () => {
    try {
      // In a real app, this would call an API to generate Excel file
      toast.info('엑셀 다운로드 기능은 준비 중입니다.')
    } catch (error) {
      toast.error('엑셀 다운로드에 실패했습니다.')
    }
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
              {entry.name === '수익' ? '원' : entry.name === '거래건수' ? '건' : ''}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // 권한 체크 - 제거 (layout.tsx에서 이미 처리)
  // admin/layout.tsx에서 권한 체크를 하므로 여기서는 불필요

  if (loading || !reportData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value)
  }

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case '7days': return '최근 7일'
      case '30days': return '최근 30일'
      case '3months': return '최근 3개월'
      case 'year': return '최근 1년'
      default: return '최근 7일'
    }
  }

  const getReportTypeLabel = () => {
    switch (reportType) {
      case 'revenue': return '수익 분석'
      case 'members': return '회원 분석'
      case 'vouchers': return '바인권 분석'
      default: return '수익 분석'
    }
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
              <SelectItem value="7days">최근 7일</SelectItem>
              <SelectItem value="30days">최근 30일</SelectItem>
              <SelectItem value="3months">최근 3개월</SelectItem>
              <SelectItem value="year">최근 1년</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleExcelDownload}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            엑셀 다운로드
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">총 입금액</p>
              <p className="text-2xl font-bold">
                {formatCurrency(reportData.summary.totalDeposits)}원
              </p>
              <div className="flex items-center gap-1 mt-2">
                {reportData.summary.depositChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${
                  reportData.summary.depositChange > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {reportData.summary.depositChange > 0 ? '+' : ''}{reportData.summary.depositChange}%
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
              <p className="text-2xl font-bold">{reportData.summary.totalMembers}명</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">
                  +{reportData.summary.memberChange}%
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
              <p className="text-2xl font-bold">{reportData.summary.totalTransactions}건</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">
                  +{reportData.summary.transactionChange}%
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
                {formatCurrency(reportData.summary.avgTransaction)}원
              </p>
              <div className="flex items-center gap-1 mt-2">
                {reportData.summary.avgTransactionChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${
                  reportData.summary.avgTransactionChange > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {reportData.summary.avgTransactionChange > 0 ? '+' : ''}{reportData.summary.avgTransactionChange}%
                </span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Revenue Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">일별 수익 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.charts.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="수익"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="transactions" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="거래건수"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Voucher Distribution Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">바인권 유형별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData.charts.voucherDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {reportData.charts.voucherDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Members Table */}
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
              {reportData.topMembers.map((member) => (
                <tr key={member.rank} className="border-b">
                  <td className="py-3">
                    <Badge variant={member.rank === 1 ? 'default' : 'secondary'}>
                      {member.rank}위
                    </Badge>
                  </td>
                  <td className="py-3 font-medium">{member.name}</td>
                  <td className="py-3 text-right">
                    {formatCurrency(member.totalPoints)}원
                  </td>
                  <td className="py-3 text-right">{member.voucherCount}개</td>
                  <td className="py-3 text-right">{member.tournamentCount}회</td>
                  <td className="py-3 text-center">
                    <Badge variant="gradient">
                      {member.grade}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detailed Report */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">상세 리포트</h3>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">수익 분석</SelectItem>
              <SelectItem value="members">회원 분석</SelectItem>
              <SelectItem value="vouchers">바인권 분석</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={reportData.detailedReport}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#8b5cf6" name="일별 수익" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}