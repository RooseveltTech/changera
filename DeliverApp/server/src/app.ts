import * as express from 'express';
import {Request,Response} from 'express'
import * as cors from 'cors';
import {AppDataSource, Order} from "./entity/order";
import* as amqp from 'amqplib/callback_api';  
import axios from 'axios';
import { getRepository } from 'typeorm';

AppDataSource.initialize()
    .then(() => {
        const orderRepository = AppDataSource.getRepository(Order)

        amqp.connect('amqps://khirervi:T5aoxBG8l0hhHlXU9Z1Xjmicra4UFzCg@rattlesnake.rmq.cloudamqp.com/khirervi', (error0, connection)=>{
            if(error0){
                throw error0;
            }
            connection.createChannel((error1,channel)=>{
                if(error1){
                    throw error1;
                } 

                channel.assertQueue('food_ordered', {durable:false})
                
                const app = express();

                app.use(cors({
                    origin: ['http://localhost:8080', 'http://localhost:3000','http://localhost:4200']
                }))
            
                app.use(express.json())
                
                channel.consume('food_ordered', async (msg)=>{
                    const eventOrder:Order =  JSON.parse(msg.content.toString()); 
                    const order = new Order()
                    order.order_id = Math.floor(100000 + Math.random() * 900000)
                    order.name = eventOrder.name
                    order.price = eventOrder.price
                    order.address = eventOrder.address
                    order.phone = eventOrder.phone
                    order.likes = eventOrder.likes
                    order.postal = eventOrder.postal
                    order.food = eventOrder.food 
                
                    await orderRepository.save(order)
                    console.log('food ordered')

                }, {noAck: true})

                app.get('/api/orders', async(req:Request,res:Response)=>{
                    const orders = await orderRepository.find()
                    return res.send(orders)
                })
                
                app.put('/api/orders/deliver', async(req:Request,res:Response)=>{
                    const results = await orderRepository.update({ order_id: req.body.order_id}, { deliver: 'success' })
                    return res.send(results)
                })
                console.log('listening on port 8001');
            
                app.listen(8001)
                // here you can start to work with your database
                process.on('beforeExit',()=>{
                    console.log('closing')
                    connection.close()
                })
            })
        })
    })
    .catch((error) => console.log(error))





