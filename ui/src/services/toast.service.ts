import { toast_store } from '../store'
import type { ToastMetaType } from '../types/toast.types'

export class ToastService {
  private static _instance: ToastService
  public static getInstance(interval: number = 3000): ToastService {
    if (!ToastService._instance) {
      ToastService._instance = new ToastService(interval)
    }
    return ToastService._instance
  }

  private toasts: ToastMetaType[]
  private remove_interval: number
  private timeouts: { [key: string]: any } = {}
  public toast_store = toast_store

  constructor(interval: number) {
    this.remove_interval = interval
    toast_store.subscribe((toasts) => (this.toasts = toasts))
  }

  public addToast(toast: ToastMetaType) {
    toast.time_added = Date.now()
    toast.id = Math.random()

    this.toasts.unshift(toast)
    toast_store.set(this.toasts)

    const timeout = setTimeout(() => {
      this.removeToast(toast.id)
    }, toast.duration || this.remove_interval)
    this.timeouts[toast.id] = timeout
  }

  public dismiss(id: number) {
    const index = this.toasts.findIndex((t) => t.id === id)
    this.toasts.splice(index, 1)
    clearTimeout(this.timeouts[id])
    delete this.timeouts[id]
    toast_store.set(this.toasts)
  }

  private removeToast(id: number) {
    const index = this.toasts.findIndex((t) => t.id === id)
    this.toasts.splice(index, 1)
    delete this.timeouts[id]
    toast_store.set(this.toasts)
  }
}
