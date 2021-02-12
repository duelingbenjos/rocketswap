"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTradeUpdate = exports.isPriceUpdate = exports.isBalanceUpdate = exports.isMetricsUpdate = void 0;
const trollbox_controller_1 = require("../authentication/trollbox.controller");
const price_entity_1 = require("../entities/price.entity");
function isMetricsUpdate(client_update) {
    return client_update.action === "metrics_update";
}
exports.isMetricsUpdate = isMetricsUpdate;
function isBalanceUpdate(client_update) {
    return client_update.action === "balance_update";
}
exports.isBalanceUpdate = isBalanceUpdate;
function isPriceUpdate(client_update) {
    return client_update.action === "price_update";
}
exports.isPriceUpdate = isPriceUpdate;
function isTradeUpdate(client_update) {
    return client_update.action === "trade_update";
}
exports.isTradeUpdate = isTradeUpdate;
//# sourceMappingURL=websocket.types.js.map