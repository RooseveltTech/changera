"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var order_1 = require("./entity/order");
var amqp = require("amqplib/callback_api");
order_1.AppDataSource.initialize()
    .then(function () {
    var orderRepository = order_1.AppDataSource.getRepository(order_1.Order);
    amqp.connect('amqps://khirervi:T5aoxBG8l0hhHlXU9Z1Xjmicra4UFzCg@rattlesnake.rmq.cloudamqp.com/khirervi', function (error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1;
            }
            channel.assertQueue('food_ordered', { durable: false });
            var app = express();
            app.use(cors({
                origin: ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:4200']
            }));
            app.use(express.json());
            channel.consume('food_ordered', function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                var eventOrder, order;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            eventOrder = JSON.parse(msg.content.toString());
                            order = new order_1.Order();
                            order.order_id = Math.floor(100000 + Math.random() * 900000);
                            order.name = eventOrder.name;
                            order.price = eventOrder.price;
                            order.address = eventOrder.address;
                            order.phone = eventOrder.phone;
                            order.likes = eventOrder.likes;
                            order.postal = eventOrder.postal;
                            order.food = eventOrder.food;
                            return [4 /*yield*/, orderRepository.save(order)];
                        case 1:
                            _a.sent();
                            console.log('food ordered');
                            return [2 /*return*/];
                    }
                });
            }); }, { noAck: true });
            app.get('/api/orders', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                var orders;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, orderRepository.find()];
                        case 1:
                            orders = _a.sent();
                            return [2 /*return*/, res.send(orders)];
                    }
                });
            }); });
            app.put('/api/orders/deliver', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                var results;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, orderRepository.update({ order_id: req.body.order_id }, { deliver: 'success' })];
                        case 1:
                            results = _a.sent();
                            return [2 /*return*/, res.send(results)];
                    }
                });
            }); });
            console.log('listening on port 8001');
            app.listen(8001);
            // here you can start to work with your database
            process.on('beforeExit', function () {
                console.log('closing');
                connection.close();
            });
        });
    });
})
    .catch(function (error) { return console.log(error); });
