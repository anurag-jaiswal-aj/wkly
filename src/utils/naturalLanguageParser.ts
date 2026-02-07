import { format, addDays, nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday, nextSaturday, nextSunday, isValid } from 'date-fns'

export interface ParsedTask {
  title: string
  date: string
  time?: string
  priority?: 'low' | 'medium' | 'high'
  description?: string
}

const PRIORITY_KEYWORDS = {
  high: ['urgent', 'important', 'critical', 'asap', 'high priority', 'high', '!!!', '!!'],
  medium: ['medium priority', 'medium', 'normal', '!'],
  low: ['low priority', 'low', 'maybe', 'someday']
}

const DAY_KEYWORDS = {
  today: () => new Date(),
  tomorrow: () => addDays(new Date(), 1),
  monday: () => nextMonday(new Date()),
  mon: () => nextMonday(new Date()),
  tuesday: () => nextTuesday(new Date()),
  tue: () => nextTuesday(new Date()),
  wednesday: () => nextWednesday(new Date()),
  wed: () => nextWednesday(new Date()),
  thursday: () => nextThursday(new Date()),
  thu: () => nextThursday(new Date()),
  friday: () => nextFriday(new Date()),
  fri: () => nextFriday(new Date()),
  saturday: () => nextSaturday(new Date()),
  sat: () => nextSaturday(new Date()),
  sunday: () => nextSunday(new Date()),
  sun: () => nextSunday(new Date())
}

const TIME_PATTERN = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?/
const DATE_PATTERNS = [
  /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/, // MM/DD or MM/DD/YYYY
  /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
]

export function parseNaturalLanguage(input: string): ParsedTask {
  let remainingText = input
  let date = format(new Date(), 'yyyy-MM-dd')
  let time: string | undefined
  let priority: 'low' | 'medium' | 'high' | undefined
  let description: string | undefined

  // Extract priority
  for (const [level, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      if (regex.test(remainingText)) {
        priority = level as 'low' | 'medium' | 'high'
        remainingText = remainingText.replace(regex, '').trim()
        break
      }
    }
    if (priority) break
  }

  // Extract time
  const timeMatch = remainingText.match(new RegExp(`\\bat\\s+${TIME_PATTERN.source}|${TIME_PATTERN.source}`, 'i'))
  if (timeMatch) {
    let hours = parseInt(timeMatch[1] || timeMatch[4])
    const minutes = timeMatch[2] || timeMatch[5] || '00'
    const meridiem = (timeMatch[3] || timeMatch[6] || '').toLowerCase()

    if (meridiem === 'pm' && hours < 12) hours += 12
    if (meridiem === 'am' && hours === 12) hours = 0

    time = `${hours.toString().padStart(2, '0')}:${minutes}`
    remainingText = remainingText.replace(timeMatch[0], '').trim()
  }

  // Extract date from keywords (tomorrow, friday, etc.)
  for (const [keyword, getDate] of Object.entries(DAY_KEYWORDS)) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    if (regex.test(remainingText)) {
      date = format(getDate(), 'yyyy-MM-dd')
      remainingText = remainingText.replace(regex, '').trim()
      break
    }
  }

  // Extract date from patterns (MM/DD, YYYY-MM-DD, etc.)
  if (date === format(new Date(), 'yyyy-MM-dd')) {
    for (const pattern of DATE_PATTERNS) {
      const match = remainingText.match(pattern)
      if (match) {
        try {
          let parsedDate: Date | null = null
          
          if (pattern === DATE_PATTERNS[0]) {
            // MM/DD or MM/DD/YYYY
            const month = parseInt(match[1])
            const day = parseInt(match[2])
            const year = match[3] ? parseInt(match[3]) : new Date().getFullYear()
            parsedDate = new Date(year, month - 1, day)
          } else if (pattern === DATE_PATTERNS[1]) {
            // YYYY-MM-DD
            parsedDate = new Date(match[0])
          }

          if (parsedDate && isValid(parsedDate)) {
            date = format(parsedDate, 'yyyy-MM-dd')
            remainingText = remainingText.replace(match[0], '').trim()
            break
          }
        } catch (e) {
          // Continue to next pattern
        }
      }
    }
  }

  // Extract "in X days"
  const inDaysMatch = remainingText.match(/\bin\s+(\d+)\s+days?\b/i)
  if (inDaysMatch) {
    const daysToAdd = parseInt(inDaysMatch[1])
    date = format(addDays(new Date(), daysToAdd), 'yyyy-MM-dd')
    remainingText = remainingText.replace(inDaysMatch[0], '').trim()
  }

  // Extract "next week"
  if (/\bnext\s+week\b/i.test(remainingText)) {
    date = format(addDays(new Date(), 7), 'yyyy-MM-dd')
    remainingText = remainingText.replace(/\bnext\s+week\b/gi, '').trim()
  }

  // Clean up common prepositions
  remainingText = remainingText
    .replace(/\b(on|at|for|to|by)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  // What's left is the title (and possibly description)
  const title = remainingText || 'New Task'

  return {
    title,
    date,
    time,
    priority,
    description
  }
}

export function getParseExamples(): string[] {
  return [
    'Buy milk tomorrow',
    'Team meeting Friday at 2pm',
    'Submit report by Monday high priority',
    'Dentist appointment 02/15 at 10am',
    'Workout today at 6am',
    'Call mom in 3 days',
    'Project deadline next week urgent'
  ]
}
