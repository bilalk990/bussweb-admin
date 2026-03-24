import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class RouteStop extends Model {
  public id!: number;
  public routeId!: number;
  public stopOrder!: number;
  public stopName!: string;
  public stopType!: "origin" | "intermediate" | "destination";
  public arrivalTime?: string;
  public departureTime?: string;
  public stopDurationMinutes?: number;
  public distanceFromPrevious?: number;
  public latitude?: number;
  public longitude?: number;
  public address?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RouteStop.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    routeId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: "route_id",
    },
    stopOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "stop_order",
    },
    stopName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "stop_name",
    },
    stopType: {
      type: DataTypes.ENUM("origin", "intermediate", "destination"),
      allowNull: false,
      defaultValue: "intermediate",
      field: "stop_type",
    },
    arrivalTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: "arrival_time",
    },
    departureTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: "departure_time",
    },
    stopDurationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 5,
      field: "stop_duration_minutes",
    },
    distanceFromPrevious: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "distance_from_previous",
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    sequelize,
    tableName: "bus_route_stops",
    timestamps: true,
    underscored: true,
  }
);

export default RouteStop;
