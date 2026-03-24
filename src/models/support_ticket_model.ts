import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class SupportTicket extends Model {
    public id!: number;
    public userId!: number;
    public subject!: string;
    public description!: string;
    public status!: "open" | "in_progress" | "resolved" | "closed";
    public priority!: "low" | "medium" | "high";
    public category!: "booking" | "payment" | "technical" | "other";
    public attachments?: string[];
    public assignedTo?: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Virtual field for frontend compatibility
    public get _id(): number {
        return this.id;
    }
}

SupportTicket.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: "user_id",
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("open", "in_progress", "resolved", "closed"),
            defaultValue: "open",
        },
        priority: {
            type: DataTypes.ENUM("low", "medium", "high"),
            defaultValue: "medium",
        },
        category: {
            type: DataTypes.ENUM("booking", "payment", "technical", "other"),
            allowNull: false,
        },
        attachments: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        assignedTo: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: "assigned_to",
        },
    },
    {
        sequelize,
        tableName: "support_tickets",
        timestamps: true,
        underscored: true,
    }
);

export default SupportTicket;