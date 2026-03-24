import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

// Maps to Laravel `bus_fares` table
export class BusFare extends Model {
    public id!: number;
    public agencyId!: number;
    public routeId!: number;
    public pickup!: number;   // FK → bus_points.id
    public dropoff!: number;  // FK → bus_points.id
    public amount!: number;
    public currency!: string;
    public departureTime?: string;
    public arrivalTime?: string;
}

BusFare.init(
    {
        id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        agencyId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: "agency_id" },
        routeId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: "route_id" },
        pickup: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        dropoff: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: "USD" },
        departureTime: { type: DataTypes.TIME, allowNull: true, field: "departure_time" },
        arrivalTime: { type: DataTypes.TIME, allowNull: true, field: "arrival_time" },
    },
    { sequelize, tableName: "bus_fares", timestamps: true, underscored: true }
);

export default BusFare;
