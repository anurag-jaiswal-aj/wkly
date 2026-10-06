import { calculateNextDate } from './recurrence';

function assertEqual<T>(a: T, b: T, message: string) {
  if (a !== b) throw new Error(`${message}: ${a} !== ${b}`);
}

export function runTests() {
  console.log("Running recurrence logic tests...");

  // Test daily recurrence
  assertEqual(calculateNextDate('2023-10-01', 'daily'), '2023-10-02', 'daily recurrence adds 1 day');
  assertEqual(calculateNextDate('2023-10-31', 'daily'), '2023-11-01', 'daily recurrence crosses month boundary correctly');

  // Test weekly recurrence
  assertEqual(calculateNextDate('2023-10-01', 'weekly'), '2023-10-08', 'weekly recurrence adds 7 days');

  // Test biweekly recurrence
  assertEqual(calculateNextDate('2023-10-01', 'biweekly'), '2023-10-15', 'biweekly recurrence adds 14 days');

  // Test monthly recurrence
  assertEqual(calculateNextDate('2023-10-01', 'monthly'), '2023-11-01', 'monthly recurrence adds 1 month');
  
  // Leap year boundary cases
  assertEqual(calculateNextDate('2024-02-28', 'daily'), '2024-02-29', 'leap year daily transition');
  assertEqual(calculateNextDate('2023-02-28', 'daily'), '2023-03-01', 'non-leap year daily transition');

  // End of year boundary case
  assertEqual(calculateNextDate('2023-12-31', 'daily'), '2024-01-01', 'year boundary daily transition');

  console.log("All recurrence tests passed!");
}

runTests();
