import { SetMetadata } from '@nestjs/common';
import type { FeatureFlag } from '../types/auth.types';

export const FEATURES_KEY = 'features';
export const Feature = (...features: FeatureFlag[]) =>
  SetMetadata(FEATURES_KEY, features);
