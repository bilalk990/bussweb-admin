import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Booking extends Model {
    public id!: number;
    public userId?: number;
    public tripId!: number;
    public agencyId?: number;
    public contactEmail?: string;
    public contactPhone?: string;
    public ticketNumber?: string;
    public totalPrice!: number;
    public seats?: number[];
    public status!: string;
    public paymentStatus?: string;
    public paymentId?: string;
    public refundAmount?: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Booking.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: "user_id",
        },
        tripId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: "bus_schedule_id",
        },
        agencyId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: "agency_id",
        },
        contactEmail: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "contact_email",
        },
        contactPhone: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "contact_phone",
        },
        ticketNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "bookingreference",
        },
        totalPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: "total_amount",
        },
        seats: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("confirmed", "pending", "cancelled", "resold"),
            defaultValue: "pending",
        },
        paymentStatus: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "payment_status",
        },
        paymentId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "payment_id",
        },
        refundAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: "refund_amount",
        },
    },
    {
        sequelize,
        tableName: "bus_bookings",
        timestamps: true,
        underscored: true,
    }
);

export default Booking;