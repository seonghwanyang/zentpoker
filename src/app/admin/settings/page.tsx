'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { Save, Building, CreditCard, Bell, Shield } from 'lucide-react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // 동호회 정보
    clubName: '젠트포커 동호회',
    clubDescription: '즐거운 홀덤 동호회입니다.',
    clubLocation: '서울특별시 강남구',
    
    // 결제 설정
    kakaoPayLink: 'https://qr.kakaopay.com/example',
    bankName: '카카오뱅크',
    bankAccount: '3333-01-234567',
    accountHolder: '홍길동',
    
    // 알림 설정
    emailNotifications: true,
    newMemberAlert: true,
    paymentAlert: true,
    tournamentAlert: false,
    
    // 시스템 설정
    maintenanceMode: false,
    registrationEnabled: true,
    pointExpiryDays: 365,
    voucherExpiryDays: 90,
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async (section: string) => {
    setIsLoading(true)
    
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast({
      title: '설정 저장 완료',
      description: `${section} 설정이 성공적으로 저장되었습니다.`,
    })
    
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-muted-foreground mt-2">
          시스템 설정을 관리합니다.
        </p>
      </div>

      {/* 동호회 정보 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold">동호회 정보</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="clubName">동호회 이름</Label>
            <Input
              id="clubName"
              value={settings.clubName}
              onChange={(e) => setSettings({ ...settings, clubName: e.target.value })}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="clubDescription">동호회 소개</Label>
            <Textarea
              id="clubDescription"
              value={settings.clubDescription}
              onChange={(e) => setSettings({ ...settings, clubDescription: e.target.value })}
              rows={3}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="clubLocation">위치</Label>
            <Input
              id="clubLocation"
              value={settings.clubLocation}
              onChange={(e) => setSettings({ ...settings, clubLocation: e.target.value })}
              className="mt-1"
            />
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => handleSave('동호회 정보')} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              저장
            </Button>
          </div>
        </div>
      </Card>

      {/* 결제 설정 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold">결제 설정</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="kakaoPayLink">카카오페이 송금 링크</Label>
            <Input
              id="kakaoPayLink"
              value={settings.kakaoPayLink}
              onChange={(e) => setSettings({ ...settings, kakaoPayLink: e.target.value })}
              placeholder="https://qr.kakaopay.com/..."
              className="mt-1"
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="bankName">은행명</Label>
              <Input
                id="bankName"
                value={settings.bankName}
                onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="bankAccount">계좌번호</Label>
              <Input
                id="bankAccount"
                value={settings.bankAccount}
                onChange={(e) => setSettings({ ...settings, bankAccount: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="accountHolder">예금주</Label>
            <Input
              id="accountHolder"
              value={settings.accountHolder}
              onChange={(e) => setSettings({ ...settings, accountHolder: e.target.value })}
              className="mt-1"
            />
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => handleSave('결제 설정')} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              저장
            </Button>
          </div>
        </div>
      </Card>

      {/* 알림 설정 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">알림 설정</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">이메일 알림</Label>
              <p className="text-sm text-muted-foreground">중요한 알림을 이메일로 받습니다</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="newMemberAlert">신규 회원 알림</Label>
              <p className="text-sm text-muted-foreground">새로운 회원 가입 시 알림</p>
            </div>
            <Switch
              id="newMemberAlert"
              checked={settings.newMemberAlert}
              onCheckedChange={(checked) => setSettings({ ...settings, newMemberAlert: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="paymentAlert">입금 알림</Label>
              <p className="text-sm text-muted-foreground">새로운 입금 요청 시 알림</p>
            </div>
            <Switch
              id="paymentAlert"
              checked={settings.paymentAlert}
              onCheckedChange={(checked) => setSettings({ ...settings, paymentAlert: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="tournamentAlert">토너먼트 알림</Label>
              <p className="text-sm text-muted-foreground">토너먼트 관련 알림</p>
            </div>
            <Switch
              id="tournamentAlert"
              checked={settings.tournamentAlert}
              onCheckedChange={(checked) => setSettings({ ...settings, tournamentAlert: checked })}
            />
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => handleSave('알림 설정')} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              저장
            </Button>
          </div>
        </div>
      </Card>

      {/* 시스템 설정 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-red-600" />
          <h2 className="text-xl font-semibold">시스템 설정</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenanceMode">유지보수 모드</Label>
              <p className="text-sm text-muted-foreground">사이트를 일시적으로 차단합니다</p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="registrationEnabled">회원가입 허용</Label>
              <p className="text-sm text-muted-foreground">신규 회원가입을 허용합니다</p>
            </div>
            <Switch
              id="registrationEnabled"
              checked={settings.registrationEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="pointExpiryDays">포인트 유효기간 (일)</Label>
              <Input
                id="pointExpiryDays"
                type="number"
                value={settings.pointExpiryDays}
                onChange={(e) => setSettings({ ...settings, pointExpiryDays: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="voucherExpiryDays">바인권 유효기간 (일)</Label>
              <Input
                id="voucherExpiryDays"
                type="number"
                value={settings.voucherExpiryDays}
                onChange={(e) => setSettings({ ...settings, voucherExpiryDays: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => handleSave('시스템 설정')} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              저장
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
