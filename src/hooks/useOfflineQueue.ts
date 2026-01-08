import { useState, useEffect, useCallback } from 'react'

interface OfflineQueueItem {
  id: string
  action: 'create' | 'update' | 'delete'
  table: string
  data: any
  timestamp: number
}

const QUEUE_KEY = 'wkly_offline_queue'

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [queue, setQueue] = useState<OfflineQueueItem[]>([])
  const [isSyncing, setIsSyncing] = useState(false)

  // Load queue from localStorage
  useEffect(() => {
    const savedQueue = localStorage.getItem(QUEUE_KEY)
    if (savedQueue) {
      setQueue(JSON.parse(savedQueue))
    }
  }, [])

  // Save queue to localStorage
  useEffect(() => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  }, [queue])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isSyncing) {
      syncQueue()
    }
  }, [isOnline, queue.length, isSyncing])

  const addToQueue = useCallback((item: Omit<OfflineQueueItem, 'id' | 'timestamp'>) => {
    const newItem: OfflineQueueItem = {
      ...item,
      id: `${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
    }
    setQueue(prev => [...prev, newItem])
  }, [])

  const syncQueue = useCallback(async () => {
    if (queue.length === 0 || isSyncing) return

    setIsSyncing(true)

    try {
      // Process queue items sequentially
      for (const item of queue) {
        // In a real implementation, you would make actual API calls here
        console.log('Syncing offline action:', item)
        
        // Remove item from queue after successful sync
        setQueue(prev => prev.filter(q => q.id !== item.id))
      }
    } catch (error) {
      console.error('Error syncing offline queue:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [queue, isSyncing])

  const clearQueue = useCallback(() => {
    setQueue([])
    localStorage.removeItem(QUEUE_KEY)
  }, [])

  return {
    isOnline,
    queue,
    queueCount: queue.length,
    isSyncing,
    addToQueue,
    syncQueue,
    clearQueue,
  }
}
