import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { clearTokens, getAccessToken, request, setTokens } from '../lib/api.js'

const AppContext = createContext(null)

const emptyUser = {
  id: null,
  name: 'User',
  email: '',
  phone: '',
  country: 'Pakistan',
  referralCode: '',
  balance: 0,
  lockedBalance: 0,
  totalDeposits: 0,
  totalEarnings: 0,
  activeInvestments: 0,
  isTwoFactorEnabled: false,
  settings: {
    emailNotifications: true,
    smsNotifications: false,
    investmentUpdates: true,
    referralActivity: true,
  },
}

function normalizePlans(plans = []) {
  return plans.map((plan) => ({
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    minAmount: Number(plan.minAmount),
    maxAmount: plan.maxAmount === null ? null : Number(plan.maxAmount),
    durationDays: Number(plan.durationDays),
    dailyReturn: Number(plan.dailyReturn),
    totalReturn: Number(plan.totalReturn),
    features: Array.isArray(plan.features) ? plan.features : [],
    imagePath: plan.imagePath || '',
    popular: plan.slug === 'professional',
  }))
}

function normalizeTransactions(items = []) {
  return items.map((txn) => ({
    id: `TXN-${txn.id}`,
    type: txn.type === 'withdrawal' ? 'withdraw' : txn.type,
    rawType: txn.type,
    amount: Number(txn.amount),
    status: String(txn.status || '').toLowerCase(),
    method: txn.method || '-',
    date: txn.createdAt ? String(txn.createdAt).slice(0, 10) : '',
  }))
}

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken())
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [user, setUser] = useState(emptyUser)
  const [transactions, setTransactions] = useState([])
  const [investments, setInvestments] = useState([])
  const [investmentPlans, setInvestmentPlans] = useState([])
  const [referralTree, setReferralTree] = useState([])
  const [referralCount, setReferralCount] = useState(0)
  const [directReferralCount, setDirectReferralCount] = useState(0)
  const [indirectReferralCount, setIndirectReferralCount] = useState(0)
  const [referralEarnings, setReferralEarnings] = useState(0)
  const [referralEntries, setReferralEntries] = useState([])
  const [commissionStructure, setCommissionStructure] = useState([
    { level: 1, ratePercent: 10 },
    { level: 2, ratePercent: 5 },
    { level: 3, ratePercent: 2 },
  ])
  const [withdrawals, setWithdrawals] = useState([])
  const [deposits, setDeposits] = useState([])
  const [paymentAccounts, setPaymentAccounts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [socialLinks, setSocialLinks] = useState([])

  const fetchSocialLinks = useCallback(async () => {
    try {
      const response = await request('/site-links')
      setSocialLinks(response?.data || [])
    } catch {
      setSocialLinks([])
    }
  }, [])

  const refreshCoreData = useCallback(async () => {
    const paymentAccountsRequest = request('/payment-accounts').catch((error) => {
      // Keep frontend usable if backend endpoint is not deployed yet.
      if (String(error.message || '').includes('Route not found')) return { data: [] }
      throw error
    })

    const [
      meRes,
      plansRes,
      investmentsRes,
      transactionsRes,
      referralsOverviewRes,
      referralsTreeRes,
      referralsEarningsRes,
      commissionStructureRes,
      withdrawalsRes,
      depositsRes,
      paymentAccountsRes,
      notificationsRes,
    ] = await Promise.all([
      request('/users/me'),
      request('/investments/plans'),
      request('/investments/mine'),
      request('/wallet/transactions'),
      request('/referrals/overview'),
      request('/referrals/tree'),
      request('/referrals/earnings'),
      request('/referrals/commission-structure'),
      request('/wallet/withdrawals'),
      request('/wallet/deposits'),
      paymentAccountsRequest,
      request('/notifications/mine'),
    ])

    const investmentsList = investmentsRes.data || []
    const transactionsList = normalizeTransactions(transactionsRes.data || [])
    const earningsTotal =
      Number(referralsOverviewRes?.data?.totalEarnings || 0) +
      transactionsList
        .filter((item) => item.rawType === 'earning')
        .reduce((acc, item) => acc + Number(item.amount), 0)
    const depositsTotal = (depositsRes.data || []).reduce(
      (acc, item) => acc + Number(item.amount || 0),
      0,
    )

    setUser((prev) => ({
      ...prev,
      ...meRes.data,
      balance: Number(meRes.data?.balance || 0),
      totalDeposits: depositsTotal,
      totalEarnings: earningsTotal,
      activeInvestments: investmentsList.filter((item) => item.status === 'active').length,
      settings: meRes.data?.settings || prev.settings,
    }))
    setInvestmentPlans(normalizePlans(plansRes.data || []))
    setInvestments(
      investmentsList.map((item) => ({
        id: `INV-${item.id}`,
        rawId: item.id,
        planName: item.planName,
        amount: Number(item.amount),
        status: item.status,
        startedAt: item.startDate,
        endDate: item.endDate,
        expectedReturn: Number(item.expectedReturn || 0),
        profit: Number(item.profit || 0),
        claimedEarning: Number(item.claimedEarning || 0),
        accruedEarning: Number(item.accruedEarning || 0),
        availableEarning: Number(item.availableEarning || 0),
        progressPercent: Number(item.progressPercent || 0),
        maturityDate: item.maturityDate || '',
        canClaim: !!item.canClaim,
        canWithdrawEarning: !!item.canWithdrawEarning,
      })),
    )
    setTransactions(transactionsList)
    setReferralCount(Number(referralsOverviewRes?.data?.totalReferrals || 0))
    setDirectReferralCount(Number(referralsOverviewRes?.data?.directReferrals || 0))
    setIndirectReferralCount(Number(referralsOverviewRes?.data?.indirectReferrals || 0))
    setReferralEarnings(Number(referralsOverviewRes?.data?.totalEarnings || 0))
    setReferralTree(referralsTreeRes.data || [])
    setReferralEntries(referralsEarningsRes?.data?.entries || [])
    setCommissionStructure(commissionStructureRes?.data || [])
    setWithdrawals(
      (withdrawalsRes?.data || []).map((item) => ({
        id: item.id,
        method:
          {
            bank_transfer: 'Bank Transfer',
            easypaisa: 'Easypaisa',
            jazzcash: 'JazzCash',
            nayapay: 'NayaPay',
            sadapay: 'SadaPay',
            digit_plus: 'Digit Plus',
            crypto: 'Crypto',
          }[item.method] || item.method,
        date: String(item.createdAt || '').slice(0, 10),
        amount: `-$${Number(item.amount).toFixed(2)}`,
        status: item.status,
        approvedAmount: Number(item.approvedAmount || 0),
        refundAmount: Number(item.refundAmount || 0),
        adminReason: item.adminReason || '',
        accountDetails: item.accountDetails || {},
      })),
    )
    setDeposits(depositsRes.data || [])
    // Public endpoint already returns only active accounts.
    setPaymentAccounts(paymentAccountsRes.data || [])
    setNotifications(notificationsRes.data || [])
  }, [])

  useEffect(() => {
    let active = true
    const bootstrap = async () => {
      await fetchSocialLinks()
      if (!getAccessToken()) {
        if (active) setIsBootstrapping(false)
        return
      }
      try {
        const meRes = await request('/users/me')
        if (!active) return
        setIsAuthenticated(true)
        setUser((prev) => ({
          ...prev,
          ...meRes.data,
          balance: Number(meRes.data?.balance || 0),
          settings: meRes.data?.settings || prev.settings,
        }))
        setIsBootstrapping(false)
        // Fetch the remaining dashboard data in background to speed up first paint.
        refreshCoreData().catch(() => {})
      } catch {
        clearTokens()
        if (active) {
          setIsAuthenticated(false)
          setUser(emptyUser)
          setIsBootstrapping(false)
        }
      }
    }
    bootstrap()
    return () => {
      active = false
    }
  }, [fetchSocialLinks, refreshCoreData])

  const login = async ({ email, password }) => {
    const normalized = String(email || '').trim().toLowerCase()
    try {
      const response = await request('/auth/login', {
        method: 'POST',
        body: { email: normalized, password },
      })
      setTokens(response.data.accessToken, response.data.refreshToken)
      setIsAuthenticated(true)
      await refreshCoreData()
      return { ok: true, message: response.message || 'Login successful.' }
    } catch (error) {
      return { ok: false, message: error.message || 'Login failed.' }
    }
  }

  const signup = async ({ name, email, phone, password, referralCode, otp }) => {
    const normalized = String(email || '').trim().toLowerCase()
    try {
      const response = await request('/auth/register', {
        method: 'POST',
        body: {
          name,
          email: normalized,
          phone: phone || undefined,
          password,
          referralCode: referralCode || undefined,
          ...(otp ? { otp } : {}),
        },
      })
      setTokens(response.data.accessToken, response.data.refreshToken)
      setIsAuthenticated(true)
      await refreshCoreData()
      return { ok: true, message: response.message || 'Registration successful.' }
    } catch (error) {
      return { ok: false, message: error.message || 'Registration failed.' }
    }
  }

  const sendOTP = async (email) => {
    const normalized = String(email || '').trim().toLowerCase()
    try {
      const response = await request('/auth/send-otp', {
        method: 'POST',
        body: { email: normalized },
      })
      if (response?.data?.otpRequired === false) {
        return {
          ok: true,
          message:
            response.message ||
            'Email verification is not required. Enter 000000 on the next screen to finish signup.',
          verificationSkipped: true,
        }
      }
      return { ok: true, message: response.message || 'OTP sent successfully.' }
    } catch (error) {
      return { ok: false, message: error.message || 'Failed to send OTP.' }
    }
  }

  const forgotPassword = async (email) => {
    const normalized = String(email || '').trim().toLowerCase()
    try {
      const response = await request('/auth/forgot-password', {
        method: 'POST',
        body: { email: normalized },
      })
      return { ok: true, message: response.message || 'Reset code sent successfully.' }
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to send reset code.' }
    }
  }

  const resetPassword = async ({ email, code, newPassword }) => {
    const normalized = String(email || '').trim().toLowerCase()
    try {
      const response = await request('/auth/reset-password', {
        method: 'POST',
        body: { email: normalized, code, newPassword },
      })
      return { ok: true, message: response.message || 'Password reset successful.' }
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to reset password.' }
    }
  }

  const logout = async () => {
    try {
      const savedRefreshToken = localStorage.getItem('horizoninvest-refresh-token')
      if (savedRefreshToken) {
        await request('/auth/logout', {
          method: 'POST',
          body: { refreshToken: savedRefreshToken },
        })
      }
    } catch {
      // ignore logout request errors and clear session locally
    } finally {
      clearTokens()
      setIsAuthenticated(false)
      setUser(emptyUser)
      setTransactions([])
      setInvestments([])
      setReferralTree([])
      setReferralCount(0)
      setDirectReferralCount(0)
      setIndirectReferralCount(0)
      setReferralEarnings(0)
      setWithdrawals([])
      setDeposits([])
      setPaymentAccounts([])
      setNotifications([])
    }
  }

  const invest = async (planId, amount) => {
    try {
      const response = await request('/investments/invest', {
        method: 'POST',
        body: { planId: Number(planId), amount: Number(amount) },
      })
      await refreshCoreData()
      return { ok: true, message: response.message || 'Investment placed successfully.' }
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to place investment.' }
    }
  }

  const deposit = async ({ amount, method, paymentAccountId, proofFile }) => {
    try {
      if (!proofFile) return { ok: false, message: 'Please attach payment screenshot.' }
      const form = new FormData()
      form.append('amount', String(Number(amount)))
      form.append('method', String(method))
      if (paymentAccountId) form.append('paymentAccountId', String(paymentAccountId))
      form.append('proof', proofFile)
      const response = await request('/wallet/deposit', { method: 'POST', body: form })
      await refreshCoreData()
      return { ok: true, message: response.message || 'Deposit request submitted.' }
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to submit deposit.' }
    }
  }

  const withdraw = async ({ amount, method, accountDetails }) => {
    try {
      const response = await request('/wallet/withdraw', {
        method: 'POST',
        body: { amount: Number(amount), method, accountDetails },
      })
      await refreshCoreData()
      return { ok: true, message: response.message || 'Withdrawal request submitted.' }
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to request withdrawal.' }
    }
  }

  const claimInvestment = async (investmentId) => {
    try {
      const response = await request(`/investments/${investmentId}/claim`, { method: 'POST' })
      await refreshCoreData()
      return { ok: true, message: response.message || 'Investment claimed successfully.' }
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to claim investment.' }
    }
  }

  const withdrawInvestmentEarning = async (investmentId, amount) => {
    try {
      const response = await request(`/investments/${investmentId}/withdraw-earning`, {
        method: 'POST',
        body: amount ? { amount: Number(amount) } : {},
      })
      await refreshCoreData()
      return { ok: true, message: response.message || 'Earning withdrawn to wallet.' }
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to withdraw earning.' }
    }
  }

  const markNotificationRead = async (notificationId) => {
    try {
      await request(`/notifications/${notificationId}/read`, { method: 'PATCH' })
      setNotifications((prev) => prev.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)))
      return { ok: true }
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to mark notification as read.' }
    }
  }

  const updateProfile = async (payload) => {
    try {
      const response = await request('/users/me', { method: 'PATCH', body: payload })
      await refreshCoreData()
      return { ok: true, message: response.message || 'Profile updated.' }
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to update profile.' }
    }
  }

  const changePassword = async ({ currentPassword, newPassword }) => {
    try {
      const response = await request('/users/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      })
      return { ok: true, message: response.message || 'Password changed.' }
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to change password.' }
    }
  }

  const setTwoFactor = async (enabled) => {
    try {
      const response = await request('/users/two-factor', {
        method: 'PATCH',
        body: { enabled },
      })
      await refreshCoreData()
      return { ok: true, message: response.message || '2FA updated.' }
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to update 2FA.' }
    }
  }

  const updateNotifications = async (settings) => {
    try {
      const response = await request('/users/notifications', {
        method: 'PATCH',
        body: settings,
      })
      await refreshCoreData()
      return { ok: true, message: response.message || 'Notification settings updated.' }
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to update notifications.' }
    }
  }

  const value = useMemo(
    () => ({
      isAuthenticated,
      isBootstrapping,
      user,
      transactions,
      investments,
      referralTree,
      referralCount,
      directReferralCount,
      indirectReferralCount,
      referralEarnings,
      referralEntries,
      commissionStructure,
      withdrawals,
      deposits,
      paymentAccounts,
      notifications,
      socialLinks,
      login,
      signup,
      sendOTP,
      forgotPassword,
      resetPassword,
      logout,
      invest,
      deposit,
      withdraw,
      updateProfile,
      changePassword,
      setTwoFactor,
      updateNotifications,
      refreshCoreData,
      investmentPlans,
      claimInvestment,
      withdrawInvestmentEarning,
      markNotificationRead,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handler identities omitted to keep a stable provider value
    [
      isAuthenticated,
      isBootstrapping,
      user,
      transactions,
      investments,
      referralTree,
      referralCount,
      directReferralCount,
      indirectReferralCount,
      referralEarnings,
      referralEntries,
      commissionStructure,
      withdrawals,
      deposits,
      paymentAccounts,
      notifications,
      socialLinks,
      refreshCoreData,
      investmentPlans,
      claimInvestment,
      withdrawInvestmentEarning,
      markNotificationRead,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider')
  }
  return context
}
