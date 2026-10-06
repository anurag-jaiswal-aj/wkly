import { applyRealtimeEvent, RealtimePayload } from './realtimeTasks';
import { Task } from '@/types';

function assertEqual<T>(a: T, b: T, message: string) {
  if (a !== b) throw new Error(`${message}: ${a} !== ${b}`);
}
function assertDeepEqual<T>(a: T[], b: T[], message: string) {
  if (a.length !== b.length || !a.every((v, i) => v === b[i])) {
    throw new Error(`${message}: [${a}] !== [${b}]`);
  }
}

// Mock Tasks
const task1: Task = {
  id: '1', user_id: 'u1', title: 'Task 1', description: 'Desc 1', date: '2023-10-01',
  completed: false, order_index: 0, recurrence: null, created_at: '2023-10-01T00:00:00Z', reminder_time: null
};

const task2: Task = {
  id: '2', user_id: 'u1', title: 'Task 2 interview', description: null, date: '2023-10-02',
  completed: false, order_index: 1, recurrence: null, created_at: '2023-10-01T00:00:00Z', reminder_time: null
};

export function runTests() {
  console.log("Running realtime state transition tests...");

  // TEST: INSERT enters visible week
  const insertPayload: RealtimePayload = { eventType: 'INSERT', new: task1 as unknown as Record<string, unknown>, old: {} };
  const res1 = applyRealtimeEvent([], insertPayload, undefined, '2023-10-01', '2023-10-07');
  assertEqual(res1.tasks.length, 1, 'INSERT should add task');
  assertEqual(res1.tasks[0].id, '1', 'INSERT should add correct task');
  assertDeepEqual(res1.requireTagsForIds, ['1'], 'INSERT should require tags');

  // TEST: INSERT outside visible week is ignored
  const res2 = applyRealtimeEvent([], insertPayload, undefined, '2023-10-02', '2023-10-07');
  assertEqual(res2.tasks.length, 0, 'INSERT outside week should be ignored');
  assertDeepEqual(res2.requireTagsForIds, [], 'INSERT outside week should not require tags');

  // TEST: UPDATE task stops matching search
  const updatePayload: RealtimePayload = { eventType: 'UPDATE', new: { ...task2, title: 'Task 2' } as unknown as Record<string, unknown>, old: task2 as unknown as Record<string, unknown> };
  const res3 = applyRealtimeEvent([task2], updatePayload, 'interview', '2023-10-01', '2023-10-07');
  assertEqual(res3.tasks.length, 0, 'UPDATE should remove task if it stops matching search');
  assertDeepEqual(res3.requireTagsForIds, [], 'UPDATE should not require tags');

  // TEST: UPDATE task starts matching search
  const startMatchPayload: RealtimePayload = { eventType: 'UPDATE', new: { ...task2, title: 'Task 2 interview' } as unknown as Record<string, unknown>, old: task2 as unknown as Record<string, unknown> };
  const res3b = applyRealtimeEvent([], startMatchPayload, 'interview', '2023-10-01', '2023-10-07');
  assertEqual(res3b.tasks.length, 1, 'UPDATE should insert task if it starts matching search');
  assertDeepEqual(res3b.requireTagsForIds, ['2'], 'UPDATE should require tags for newly matching task');

  // TEST: UPDATE task moves out of week
  const outOfWeekPayload: RealtimePayload = { eventType: 'UPDATE', new: { ...task1, date: '2023-10-08' } as unknown as Record<string, unknown>, old: task1 as unknown as Record<string, unknown> };
  const res4 = applyRealtimeEvent([task1], outOfWeekPayload, undefined, '2023-10-01', '2023-10-07');
  assertEqual(res4.tasks.length, 0, 'UPDATE should remove task if it moves out of week');
  assertDeepEqual(res4.requireTagsForIds, [], 'UPDATE should not require tags');

  // TEST: UPDATE task moves into week
  const intoWeekPayload: RealtimePayload = { eventType: 'UPDATE', new: { ...task1, date: '2023-10-05' } as unknown as Record<string, unknown>, old: task1 as unknown as Record<string, unknown> };
  const res4b = applyRealtimeEvent([], intoWeekPayload, undefined, '2023-10-01', '2023-10-07');
  assertEqual(res4b.tasks.length, 1, 'UPDATE should insert task if it moves into week');
  assertDeepEqual(res4b.requireTagsForIds, ['1'], 'UPDATE should require tags for newly in-week task');

  // TEST: DELETE removes task
  const deletePayload: RealtimePayload = { eventType: 'DELETE', new: {}, old: task1 as unknown as Record<string, unknown> };
  const res5 = applyRealtimeEvent([task1], deletePayload, undefined, '2023-10-01', '2023-10-07');
  assertEqual(res5.tasks.length, 0, 'DELETE should remove task');
  assertDeepEqual(res5.requireTagsForIds, [], 'DELETE should not require tags');

  // TEST: Duplicate INSERT (Optimistic followed by realtime)
  const duplicateInsertPayload: RealtimePayload = { eventType: 'INSERT', new: task1 as unknown as Record<string, unknown>, old: {} };
  const res6 = applyRealtimeEvent([task1], duplicateInsertPayload, undefined, '2023-10-01', '2023-10-07');
  assertEqual(res6.tasks.length, 1, 'Duplicate INSERT should be ignored (idempotent)');
  assertDeepEqual(res6.requireTagsForIds, [], 'Duplicate INSERT should not request tags again');

  // TEST: UPDATE of nonexistent task (ignored if not matching or out of week, but should insert if it enters scope)
  const updateNonexistentPayload: RealtimePayload = { eventType: 'UPDATE', new: task1 as unknown as Record<string, unknown>, old: task1 as unknown as Record<string, unknown> };
  const res7 = applyRealtimeEvent([], updateNonexistentPayload, undefined, '2023-10-01', '2023-10-07');
  assertEqual(res7.tasks.length, 1, 'UPDATE of nonexistent task within week should insert it');
  
  // TEST: DELETE of nonexistent task
  const res8 = applyRealtimeEvent([task2], deletePayload, undefined, '2023-10-01', '2023-10-07');
  assertEqual(res8.tasks.length, 1, 'DELETE of nonexistent task should safely ignore');

  // TEST: Search match by description only
  const descTask: Task = { ...task1, id: '3', title: 'Nothing here', description: 'Hidden keyword' };
  const descInsertPayload: RealtimePayload = { eventType: 'INSERT', new: descTask as unknown as Record<string, unknown>, old: {} };
  const res9 = applyRealtimeEvent([], descInsertPayload, 'keyword', '2023-10-01', '2023-10-07');
  assertEqual(res9.tasks.length, 1, 'INSERT should match search query in description');

  // TEST: UPDATE changes search match AND date simultaneously
  // Task originally matches search and is in week.
  // Update moves it OUT of week, but it still matches search. (Search mode ignores week bounds).
  const complexUpdatePayload: RealtimePayload = { eventType: 'UPDATE', new: { ...task1, date: '2023-11-01' } as unknown as Record<string, unknown>, old: task1 as unknown as Record<string, unknown> };
  const res10 = applyRealtimeEvent([task1], complexUpdatePayload, 'Task 1', '2023-10-01', '2023-10-07');
  assertEqual(res10.tasks.length, 1, 'UPDATE moving out of week should remain visible if searching');
  assertEqual(res10.tasks[0].date, '2023-11-01', 'UPDATE should apply new date');

  console.log("All tests passed!");
}

runTests();
