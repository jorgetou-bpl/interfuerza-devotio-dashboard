export type TransactionStatus = 'processed' | 'pending' | 'error'
export type RedemptionStatus = 'pending' | 'confirmed' | 'failed'

export interface Transaction {
  id: string
  invoice_id: string
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  amount: number
  cashback_amount: number | null
  cashback_pct: number | null
  branch: string | null
  transaction_date: string | null
  status: TransactionStatus
  devotio_customer_id: string | null
  devotio_transaction_id: string | null
  created_at: string
}

export interface Redemption {
  id: string
  customer_phone: string | null
  customer_email: string | null
  customer_name: string | null
  devotio_customer_id: string | null
  amount_redeemed: number
  status: RedemptionStatus
  devotio_redemption_id: string | null
  initiated_by: string | null
  created_at: string
  completed_at: string | null
}

export interface SyncState {
  key: string
  value: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: Transaction
        Insert: Omit<Transaction, 'id' | 'created_at'>
        Update: Partial<Omit<Transaction, 'id' | 'created_at'>>
      }
      redemptions: {
        Row: Redemption
        Insert: Omit<Redemption, 'id' | 'created_at'>
        Update: Partial<Omit<Redemption, 'id' | 'created_at'>>
      }
      sync_state: {
        Row: SyncState
        Insert: SyncState
        Update: Partial<SyncState>
      }
    }
  }
}
