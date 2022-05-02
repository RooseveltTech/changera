
import "reflect-metadata"
import { Column, Entity, DataSource, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Order{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default:0})
    order_id: number;

    @Column()
    name: string;

    @Column()
    food: string;

    @Column()
    address: string;

    @Column()
    phone: string;

    @Column()
    postal: string;

    @Column()
    price: string;

    @Column({default:'ordered'})
    deliver: string;

    @Column({default:0})
    likes: number;

}


export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "Macrootsql",
    database: "changera_deliver",
    entities: [Order],
    synchronize: true,
    logging: false,
    cache: {
        duration: 30000 // 30 seconds
    }
})