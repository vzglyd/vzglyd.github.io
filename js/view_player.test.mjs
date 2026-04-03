import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_SLIDE_DURATION_SECONDS,
  buildPlayableSchedule,
  nextScheduleIndex,
  normalizeStartIndex,
  resolveDurationSeconds,
  resolveTransitionKind,
  smoothstep,
} from './view_player.js';

test('builds a playable schedule from enabled entries only', () => {
  const schedule = buildPlayableSchedule({
    defaults: { duration_seconds: 10, transition_in: 'crossfade' },
    slides: [
      { path: 'clock.vzglyd', transition_out: 'cut' },
      { path: 'weather.vzglyd', enabled: false },
      { path: 'news.vzglyd', duration_seconds: 12, transition_in: 'wipe_down' },
    ],
  });

  assert.deepEqual(schedule, [
    {
      playlistIndex: 0,
      path: 'clock.vzglyd',
      params: undefined,
      durationSeconds: 10,
      transitionIn: 'crossfade',
      transitionOut: 'cut',
    },
    {
      playlistIndex: 2,
      path: 'news.vzglyd',
      params: undefined,
      durationSeconds: 12,
      transitionIn: 'wipe_down',
      transitionOut: null,
    },
  ]);
});

test('resolves duration using entry override, then playlist default, then engine default', () => {
  assert.equal(
    resolveDurationSeconds(
      { duration_seconds: 20 },
      { duration_seconds: 10 },
      DEFAULT_SLIDE_DURATION_SECONDS,
    ),
    20,
  );

  assert.equal(
    resolveDurationSeconds(
      {},
      { duration_seconds: 10 },
      DEFAULT_SLIDE_DURATION_SECONDS,
    ),
    10,
  );

  assert.equal(
    resolveDurationSeconds(
      {},
      {},
      DEFAULT_SLIDE_DURATION_SECONDS,
    ),
    DEFAULT_SLIDE_DURATION_SECONDS,
  );
});

test('resolves transitions using outgoing transition_out, then incoming transition_in, then default', () => {
  assert.equal(
    resolveTransitionKind(
      { transitionOut: 'cut' },
      { transitionIn: 'wipe_down' },
      'crossfade',
    ),
    'cut',
  );

  assert.equal(
    resolveTransitionKind(
      { transitionOut: null },
      { transitionIn: 'wipe_down' },
      'crossfade',
    ),
    'wipe_down',
  );

  assert.equal(
    resolveTransitionKind(
      { transitionOut: null },
      { transitionIn: null },
      'crossfade',
    ),
    'crossfade',
  );
});

test('normalizes playback start index against enabled-slide schedule length', () => {
  assert.equal(normalizeStartIndex('2', 5), 2);
  assert.equal(normalizeStartIndex('99', 3), 2);
  assert.equal(normalizeStartIndex('-1', 3), 0);
  assert.equal(normalizeStartIndex('nope', 3), 0);
});

test('wraps next schedule index when looping', () => {
  assert.equal(nextScheduleIndex(0, 3), 1);
  assert.equal(nextScheduleIndex(2, 3), 0);
});

test('smoothstep clamps and preserves the midpoint', () => {
  assert.equal(smoothstep(-1), 0);
  assert.equal(smoothstep(2), 1);
  assert.equal(smoothstep(0.5), 0.5);
});
