import { motion, AnimatePresence } from 'framer-motion'

interface NotificationSettingsProps {
  isOpen: boolean
  onClose: () => void
  permission: NotificationPermission
  onRequestPermission: () => Promise<boolean>
  isSupported: boolean
}

export default function NotificationSettings({
  isOpen,
  onClose,
  permission,
  onRequestPermission,
  isSupported
}: NotificationSettingsProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-light">Notifications</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {!isSupported ? (
            <div className="text-center py-8">
              <div className="text-2xl font-light mb-3">Not Supported</div>
              <p className="text-gray-600 dark:text-gray-400">
                Your browser doesn't support notifications
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status */}
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Status</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    permission === 'granted'
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : permission === 'denied'
                      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Not Set'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {permission === 'granted' 
                    ? 'You will receive notifications for task reminders'
                    : permission === 'denied'
                    ? 'Notifications are blocked. Please enable them in your browser settings.'
                    : 'Click the button below to enable notifications'
                  }
                </p>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-sm font-medium mb-3">Features</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 text-sm">
                    <span className="text-sm font-medium text-gray-400">-</span>
                    <div>
                      <div className="font-medium">Task Reminders</div>
                      <div className="text-xs text-gray-500">
                        Get notified at your set reminder times
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <span className="text-sm font-medium text-gray-400">-</span>
                    <div>
                      <div className="font-medium">Daily Summary</div>
                      <div className="text-xs text-gray-500">
                        Morning reminder of today's tasks (9 AM)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* How to set reminders */}
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-medium mb-2">How to Set Reminders</h3>
                <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Create or edit a task</li>
                  <li>Enable the "Reminder" toggle</li>
                  <li>Set your preferred time</li>
                  <li>Save the task</li>
                </ol>
              </div>

              {/* Action Button */}
              {permission !== 'granted' && (
                <button
                  onClick={async () => {
                    const granted = await onRequestPermission()
                    if (!granted && permission === 'denied') {
                      // Show instructions for enabling in browser settings
                    }
                  }}
                  className="w-full py-3 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm font-medium"
                  disabled={permission === 'denied'}
                >
                  {permission === 'denied' ? 'Blocked - Check Browser Settings' : 'Enable Notifications'}
                </button>
              )}
              
              {/* Test Notification Button */}
              {permission === 'granted' && (
                <button
                  onClick={() => {
                    const testNotification = new Notification('Test Notification', {
                      body: 'Notifications are working! You\'ll receive reminders like this.',
                      icon: '/favicon.ico'
                    })
                    setTimeout(() => testNotification.close(), 5000)
                  }}
                  className="w-full py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-sm font-medium"
                >
                  Send Test Notification
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
