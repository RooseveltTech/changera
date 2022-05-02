import * as express from 'express';
import {Request,Response} from 'express'
import * as cors from 'cors';
import {AppDataSource, Order} from "./entity/order";
import * as amqp from 'amqplib/callback_api';  
import axios from 'axios';

AppDataSource.initialize()
    .then(() => {
        const orderRepository = AppDataSource.getRepository(Order);

        amqp.connect('amqps://khirervi:T5aoxBG8l0hhHlXU9Z1Xjmicra4UFzCg@rattlesnake.rmq.cloudamqp.com/khirervi', (error0, connection)=>{
            if(error0){
                throw error0;
            }
            connection.createChannel((error1,channel)=>{
                if(error1){
                    throw error1;
                } 
                const app = express();

                app.use(cors({
                    origin: ['http://localhost:8080', 'http://localhost:3000','http://localhost:4200']
                }))
            
                app.use(express.json())

                app.get('/api', async (req: Request, res: Response) => {
                    res.send('Welcome to the Order App');
                    
                });

                app.post('/api/orders/send', async (req: Request, res: Response) => {
                    const order = await orderRepository.create(req.body);
                    const result = await orderRepository.save(order);
                    channel.sendToQueue('food_ordered', Buffer.from(JSON.stringify(result)))
                    await axios.post(`http://localhost:8000/api/orders/send`)
                    return res.send(order);
                });

                app.get('/api/orders', async (req: Request, res: Response) => {
                    const orders = await orderRepository.find();
                    res.json(orders);
                });

                console.log('listening on port 8000');
            
                app.listen(8000)
                // here you can start to work with your database
                process.on('beforeExit',()=>{
                    console.log('closing')
                    connection.close()
                })

            })
        })
    })
    .catch((error) => console.log(error))





