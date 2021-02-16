"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveTrollChat = exports.ChatHistoryEntity = void 0;
const misc_types_1 = require("../types/misc.types");
const typeorm_1 = require("typeorm");
const websocket_types_1 = require("../types/websocket.types");
let ChatHistoryEntity = class ChatHistoryEntity extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], ChatHistoryEntity.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], ChatHistoryEntity.prototype, "message", void 0);
__decorate([
    typeorm_1.Column({ type: 'simple-json' }),
    __metadata("design:type", Object)
], ChatHistoryEntity.prototype, "sender", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], ChatHistoryEntity.prototype, "timestamp", void 0);
ChatHistoryEntity = __decorate([
    typeorm_1.Entity()
], ChatHistoryEntity);
exports.ChatHistoryEntity = ChatHistoryEntity;
exports.saveTrollChat = async (payload) => {
    const entity = new ChatHistoryEntity();
    entity.message = payload.message;
    entity.sender = payload.sender;
    entity.timestamp = payload.timestamp;
    await entity.save();
};
//# sourceMappingURL=chat-history.entity.js.map