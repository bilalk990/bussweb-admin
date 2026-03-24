import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

// Maps to Laravel `bus_points` table
export class BusPoint extends Model {
    public id!: number;
    public agencyId?: number;
    public name!: string;
    public iataCode?: string;
    public latitude?: number;
    public longitude?: number;
}

BusPoint.init(
    {
        id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        agencyId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: "agency_id" },
        name: { type: DataTypes.STRING, allowNull: false },
        iataCode: { type: DataTypes.STRING, allowNull: true, field: "iata_code" },
        latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
        longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    },
    { sequelize, tableName: "bus_points", timestamps: true, underscored: true }
);

export default BusPoint;
