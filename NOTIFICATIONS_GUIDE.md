# Notifications & Reminders Setup Guide

## 🔔 Features Implemented

### 1. Browser Notifications
- Native browser notification support
- Auto-detects browser compatibility
- Visual bell icon (🔔) in header shows status:
  - **Dark bell** = Notifications enabled ✓
  - **Gray bell** = Not enabled yet

### 2. Task Reminders
- Set specific time for any task
- Browser notification when time arrives
- Visual indicator (🔔 HH:MM) on task cards
- Toggle reminders on/off per task

### 3. Daily Summary (9 AM)
- Automatic notification for today's pending tasks
- Runs every day at 9:00 AM
- Only shows if you have incomplete tasks

### 4. Reminder Checker
- Runs every minute in the background
- Checks for due reminders
- Prevents duplicate notifications

---

## 📝 Database Migration

Run this SQL in your Supabase SQL Editor:

\`\`\`sql
-- Copy contents from: supabase-migration-reminders.sql

-- Add reminder_enabled column
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT true;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_tasks_reminder 
  ON tasks(reminder_time, reminder_enabled) 
  WHERE reminder_time IS NOT NULL AND completed = false;

-- Update existing reminders
UPDATE tasks SET reminder_enabled = true WHERE reminder_time IS NOT NULL;
\`\`\`

---

## 🎯 How to Use

### Step 1: Enable Notifications
1. Click the 🔔 bell icon in the top-right header
2. Click "Enable Notifications" button
3. Allow notifications when browser prompts

### Step 2: Set Task Reminder
1. Create or edit a task
2. Toggle "Enable" under the Reminder section
3. Select your desired time (e.g., 2:30 PM)
4. Save the task
5. You'll see a 🔔 badge with the time on the task card

### Step 3: Receive Notifications
- Browser will show notification at the set time
- Notification includes task title and time
- Auto-closes after 5 seconds
- Click notification to focus the app (browser default)

---

## 🔧 Technical Details

### Files Created
- \`src/hooks/useNotifications.ts\` - Notification system hook
- \`src/components/NotificationSettings.tsx\` - Settings modal UI
- \`supabase-migration-reminders.sql\` - Database migration

### Files Modified
- \`src/types/index.ts\` - Added \`reminder_enabled\` field to Task interface
- \`src/components/TaskModal.tsx\` - Added reminder time picker UI
- \`src/components/TaskCard.tsx\` - Added reminder badge display
- \`src/pages/Planner.tsx\` - Integrated notification system

### How It Works
1. **Permission Check**: Requests browser notification permission
2. **Reminder Checker**: Runs every 60 seconds checking task reminder times
3. **Local Storage**: Tracks sent notifications to prevent duplicates
4. **Auto-cleanup**: Clears notification records after 24 hours

### Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support (macOS/iOS 16+)
- Opera: ✅ Full support

---

## 🎨 UI Features

### Notification Bell Icon
- Located in top-right header
- Color indicates status (dark = enabled)
- Click to open settings modal

### Task Modal - Reminder Section
- Checkbox to enable/disable reminder
- Time picker (HH:MM format)
- Helper text explaining notification

### Task Card Badges
- 🔔 icon + time shown on cards with reminders
- Hover shows full reminder time
- Only visible when reminder is enabled

### Settings Modal
- Status indicator (Enabled/Blocked/Not Set)
- Feature list explanation
- How-to instructions
- Enable button (if not already enabled)

---

## 🐛 Troubleshooting

### "Notifications are blocked"
1. Click browser address bar
2. Look for 🔔 or settings icon
3. Allow notifications for this site
4. Refresh the page

### "Not receiving notifications"
- Check reminder time is in the future
- Verify "Enable" checkbox is ON in task modal
- Confirm 🔔 bell icon is dark (enabled)
- Check browser notification settings
- Make sure browser tab is open (notifications work in background but require browser to be running)

### "Notifications not working on mobile"
- iOS Safari: Requires iOS 16.4+ and must add to Home Screen
- Android Chrome: Should work normally
- Enable notifications when prompted

---

## 🚀 Future Enhancements (Not Implemented)

These would require backend/server-side code:

### Email Reminders
- Would need Supabase Edge Functions
- Send emails via Resend/SendGrid
- Cron job to check daily

### SMS Notifications
- Requires Twilio integration
- Backend API for sending texts

### Recurring Reminders
- Database field already exists (\`recurrence\`)
- Would need logic to create repeat notifications

---

## ✅ What's Working Now

✓ Browser notifications
✓ Set reminder times on tasks
✓ Visual reminder indicators
✓ Background reminder checking
✓ Daily 9 AM summary
✓ Duplicate prevention
✓ Settings modal UI
✓ Permission management
✓ Cross-browser support

Everything is fully functional for client-side notifications!
