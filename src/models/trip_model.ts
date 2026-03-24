import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Trip extends Model {
    public id!: number;
    public agencyId!: number;
    public busId!: number;
    public routeId!: number;
    public busfareId?: number;
    public groupId?: number;
    public departureDate!: string;
    public departureTime!: string;
    public arrivalTime!: string;
    public status!: "scheduled" | "delayed" | "cancelled" | "completed";
    public departureBusStation?: string;
    public arrivalBusStation?: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Virtual field for frontend compatibility
    public get _id(): number {
        return this.id;
    }
}

Trip.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        agencyId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: "agency_id",
        },
        busId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "bus_id",
        },
        routeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "route_id",
        },
        busfareId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "busfare_id",
        },
        groupId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: "group_id",
        },
        departureDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: "departure_date",
        },
        departureTime: {
            type: DataTypes.TIME,
            allowNull: false,
            field: "departure_time",
        },
        arrivalTime: {
            type: DataTypes.TIME,
            allowNull: false,
            field: "arrival_time",
        },
        status: {
            type: DataTypes.ENUM("scheduled", "delayed", "cancelled", "completed", "ongoing"),
            defaultValue: "scheduled",
        },
        departureBusStation: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "departure_bus_station",
        },
        arrivalBusStation: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "arrival_bus_station",
        },
    },
    {
        sequelize,
        tableName: "bus_schedules",
        timestamps: true,
        underscored: true,
    }
);

export default Trip;
