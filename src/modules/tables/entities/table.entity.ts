import { 
    Column, 
    Entity, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn 
} from "typeorm";

export enum tableStatus {
    AVAILABLE = "available",
    OCCUPIED = "occupied",
    RESERVED = "reserved"
}

@Entity('tables')// Note: "table" is often a reserved SQL keyword, so renaming the DB table is safer
export class Table {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "int", unique: true   })
    number: number;

    @Column({ type: "int" })
    capacity: number;

    @Column({ type: "varchar" })
    zone: string;

    @Column({ type: "enum", enum :tableStatus ,default: tableStatus.AVAILABLE })
    status: string;

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
