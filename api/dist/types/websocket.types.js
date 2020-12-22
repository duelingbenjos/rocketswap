"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPriceUpdate = exports.isMetricsUpdate = void 0;
const price_entity_1 = require("../entities/price.entity");
function isMetricsUpdate(client_update) {
    return client_update.action === "metrics_update";
}
exports.isMetricsUpdate = isMetricsUpdate;
function isPriceUpdate(client_update) {
    return client_update.action === "price_update";
}
exports.isPriceUpdate = isPriceUpdate;
//# sourceMappingURL=websocket.types.js.map