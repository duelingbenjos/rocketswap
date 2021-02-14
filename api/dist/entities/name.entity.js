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
exports.setName = exports.NameEntity = void 0;
const misc_types_1 = require("../types/misc.types");
const config_1 = require("../config");
const typeorm_1 = require("typeorm");
let NameEntity = class NameEntity extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], NameEntity.prototype, "vk", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], NameEntity.prototype, "name", void 0);
NameEntity = __decorate([
    typeorm_1.Entity()
], NameEntity);
exports.NameEntity = NameEntity;
exports.setName = async (state) => {
    console.log('SAVE NAME ACTIVATED');
    const key_to_name = state.find((kvp) => kvp.key.split(":")[0] === `${config_1.config.identityContract}.key_to_name`);
    const name_to_key = state.find((kvp) => kvp.key.split(":")[0] ===
        `${config_1.config.identityContract}.name_to_key` && kvp.value);
    console.log(name_to_key, key_to_name);
    if (key_to_name && name_to_key) {
        const vk = name_to_key.value;
        const name = key_to_name.value;
        let entity;
        entity = await NameEntity.findOne(vk);
        if (!entity) {
            entity = new NameEntity();
            entity.vk = vk;
        }
        entity.name = name;
        await entity.save();
    }
};
//# sourceMappingURL=name.entity.js.map