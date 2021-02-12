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
exports.MessageRequest = exports.RefreshRequest = exports.RegisterRequest = exports.LoginRequest = void 0;
const class_validator_1 = require("class-validator");
class LoginRequest {
}
__decorate([
    class_validator_1.IsNotEmpty({ message: "A username is required" }),
    __metadata("design:type", String)
], LoginRequest.prototype, "username", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: "A password is required to login" }),
    __metadata("design:type", String)
], LoginRequest.prototype, "password", void 0);
exports.LoginRequest = LoginRequest;
class RegisterRequest {
}
__decorate([
    class_validator_1.IsNotEmpty({ message: "An username is required" }),
    __metadata("design:type", String)
], RegisterRequest.prototype, "username", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: "A password is required" }),
    class_validator_1.MinLength(6, { message: "Your password must be at least 6 characters" }),
    __metadata("design:type", String)
], RegisterRequest.prototype, "password", void 0);
exports.RegisterRequest = RegisterRequest;
class RefreshRequest {
}
__decorate([
    class_validator_1.IsNotEmpty({ message: "The refresh token is required" }),
    __metadata("design:type", String)
], RefreshRequest.prototype, "refresh_token", void 0);
exports.RefreshRequest = RefreshRequest;
class MessageRequest {
}
exports.MessageRequest = MessageRequest;
//# sourceMappingURL=requests.js.map