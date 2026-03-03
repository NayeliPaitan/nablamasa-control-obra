export type Profile = {
  id: string
  company_id: string
  full_name: string
  role: 'ADMIN' | 'ENCARGADO' | 'PLANOS'
}

export type Project = {
  id: string
  company_id: string
  client_id: string | null
  name: string
  address: string | null
  contract_total: number
  advance_pct: number
  status: 'ACTIVE' | 'PAUSED' | 'DONE'
  start_date: string | null
  created_at: string
}

export type Worker = {
  id: string
  company_id: string
  project_id: string
  full_name: string
  role: string | null
  daily_rate: number
  active: boolean
  created_at: string
}

export type Attendance = {
  id: string
  company_id: string
  project_id: string
  worker_id: string
  work_date: string
  present: boolean
  notes: string | null
}

export type WorkerAdvance = {
  id: string
  company_id: string
  project_id: string
  worker_id: string
  adv_date: string
  amount: number
  reason: string | null
}

export type CashTx = {
  id: string
  company_id: string
  project_id: string
  tx_date: string
  tx_type: 'IN' | 'OUT'
  category: string
  amount: number
  description: string | null
  attachment_url: string | null
  created_at: string
}