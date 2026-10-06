import { parseNaturalLanguage } from './naturalLanguageParser';
import { format, addDays, nextMonday, nextFriday } from 'date-fns';

function assertEqual<T>(a: T, b: T, message: string) {
  if (a !== b) throw new Error(`${message}: ${a} !== ${b}`);
}

export function runTests() {
  console.log("Running natural language parser tests...");


  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const nextMondayStr = format(nextMonday(new Date()), 'yyyy-MM-dd');
  const nextFridayStr = format(nextFriday(new Date()), 'yyyy-MM-dd');
  const in3DaysStr = format(addDays(new Date(), 3), 'yyyy-MM-dd');
  const nextWeekStr = format(addDays(new Date(), 7), 'yyyy-MM-dd');

  // Test priorities
  const p1 = parseNaturalLanguage('Buy milk high priority');
  assertEqual(p1.priority, 'high', 'should parse high priority');
  assertEqual(p1.title, 'Buy milk', 'should extract title correctly');

  const p2 = parseNaturalLanguage('Buy milk !!');
  assertEqual(p2.priority, 'high', 'should parse !! as high priority');

  const p3 = parseNaturalLanguage('Read book low');
  assertEqual(p3.priority, 'low', 'should parse low priority');
  assertEqual(p3.title, 'Read book', 'should extract title correctly');

  // Test times
  const t1 = parseNaturalLanguage('Meeting at 2pm');
  assertEqual(t1.time, '14:00', 'should parse 2pm as 14:00');
  assertEqual(t1.title, 'Meeting', 'should extract title correctly');

  const t2 = parseNaturalLanguage('Workout at 6:30am');
  assertEqual(t2.time, '06:30', 'should parse 6:30am as 06:30');
  assertEqual(t2.title, 'Workout', 'should extract title correctly');

  const t3 = parseNaturalLanguage('Lunch 12:00');
  assertEqual(t3.time, '12:00', 'should parse 12:00 without am/pm');
  assertEqual(t3.title, 'Lunch', 'should extract title correctly');

  // Test keywords (relative days)
  const d1 = parseNaturalLanguage('Buy milk tomorrow');
  assertEqual(d1.date, tomorrowStr, 'should parse tomorrow');
  assertEqual(d1.title, 'Buy milk', 'should extract title correctly');

  const d2 = parseNaturalLanguage('Team meeting Monday');
  assertEqual(d2.date, nextMondayStr, 'should parse Monday');
  
  const d3 = parseNaturalLanguage('Party fri');
  assertEqual(d3.date, nextFridayStr, 'should parse fri');

  // Test absolute dates
  const currentYear = new Date().getFullYear();
  const d4 = parseNaturalLanguage('Dentist 02/15');
  assertEqual(d4.date, `${currentYear}-02-15`, 'should parse MM/DD');

  const d5 = parseNaturalLanguage('Flight 2024-12-25');
  assertEqual(d5.date, '2024-12-25', 'should parse YYYY-MM-DD');

  // Test offset days
  const d6 = parseNaturalLanguage('Call mom in 3 days');
  assertEqual(d6.date, in3DaysStr, 'should parse in 3 days');
  assertEqual(d6.title, 'Call mom', 'should extract title correctly');

  const d7 = parseNaturalLanguage('Project deadline next week');
  assertEqual(d7.date, nextWeekStr, 'should parse next week');

  // Test combined (date, time, priority)
  const combo = parseNaturalLanguage('Submit report tomorrow at 3pm urgent');
  assertEqual(combo.title, 'Submit report', 'combined title');
  assertEqual(combo.date, tomorrowStr, 'combined date');
  assertEqual(combo.time, '15:00', 'combined time');
  assertEqual(combo.priority, 'high', 'combined priority');

  console.log("All natural language parser tests passed!");
}

runTests();
