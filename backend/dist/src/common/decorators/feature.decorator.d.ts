import type { FeatureFlag } from '../types/auth.types';
export declare const FEATURES_KEY = "features";
export declare const Feature: (...features: FeatureFlag[]) => import("@nestjs/common").CustomDecorator<string>;
