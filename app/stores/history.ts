import { defineStore } from 'pinia'

const HISTORY_KEY = 'sticker_history_v2'
const HISTORY_LIMIT = 80
const HISTORY_EXPIRY = 1000 * 60 * 60 * 24 * 7

export interface HistoryItem {
  id: string
  type: 'image' | 'video'
  fileName: string
  preview: string
  width?: number
  height?: number
  duration?: number
  size?: number
  timestamp: number
  inputTag?: string
  result: {
    png?: string
    webp?: string
    webm?: string
  }
}

export const useHistoryStore = defineStore('history', {
  state: () => ({
    items: [] as HistoryItem[]
  }),
  actions: {
    load() {
      if (!import.meta.client) return
      try {
        const raw = localStorage.getItem(HISTORY_KEY)
        if (!raw) {
          this.items = []
          return
        }
        const parsed: HistoryItem[] = JSON.parse(raw)
        const now = Date.now()
        this.items = parsed.filter(item => now - item.timestamp < HISTORY_EXPIRY).slice(0, HISTORY_LIMIT)
        this.persist()
      } catch {
        this.items = []
      }
    },
    persist() {
      if (!import.meta.client) return
      localStorage.setItem(HISTORY_KEY, JSON.stringify(this.items))
    },
    add(item: Omit<HistoryItem, 'id' | 'timestamp'>) {
      this.items.unshift({
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: Date.now()
      } as HistoryItem)
      this.items = this.items.slice(0, HISTORY_LIMIT)
      this.persist()
    },
    clear() {
      this.items = []
      this.persist()
    },
    removeMany(ids: string[]) {
      const set = new Set(ids)
      this.items = this.items.filter(item => !set.has(item.id))
      this.persist()
    },
    updateTag(id: string, tag: string) {
      const target = this.items.find(item => item.id === id)
      if (target) {
        target.inputTag = tag
        this.persist()
      }
    }
  }
})
