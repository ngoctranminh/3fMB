import type { RefObject } from 'react';
import type { ScrollView } from 'react-native';

type CaptureOptions = {
  readonly fileName?: string;
  readonly format?: 'jpg' | 'png';
  readonly result?: 'tmpfile';
  readonly snapshotContentContainer?: boolean;
};

type ViewShotModule = {
  readonly captureRef: (
    view: RefObject<null | ScrollView>,
    options?: CaptureOptions,
  ) => Promise<string>;
};

// The package's React Native source currently exposes two unused type imports,
// which conflicts with this project's noUnusedLocals setting. Runtime loading
// through this small typed adapter keeps the native module fully type-safe.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const viewShot = require('react-native-view-shot') as ViewShotModule;

export const captureReference = viewShot.captureRef;
