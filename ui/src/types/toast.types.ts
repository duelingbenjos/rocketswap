export type ToastMetaType = {
  heading: string
  type: ToastType
  text?: string
  time_added?: number
  id?: number
  done?: boolean
}

export type ToastType = 'info' | 'warning' | 'error'
