"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feature = exports.FEATURES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.FEATURES_KEY = 'features';
const Feature = (...features) => (0, common_1.SetMetadata)(exports.FEATURES_KEY, features);
exports.Feature = Feature;
//# sourceMappingURL=feature.decorator.js.map