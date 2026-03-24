import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

// Points to the unified Laravel `buses` table
export class Bus extends Model {
  public id!: number;
  public name!: string;
  public plateNumber!: string;
  public busType?: string;
  public capacity!: number;
  public agencyId!: number;
  public status!: "active" | "inactive" | "maintenance" | "blocked";
  public driverId?: number;
  public layoutId?: number;
  public currentLocation?: {
    address: string;
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public get type(): string | undefined {
    return this.busType;
  }
}

Bus.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    busType: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "bus_type",
    },
    plateNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "plate_number",
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 40,
      field: "total_seats",
    },
    agencyId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: "agency_id",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "inactive",
    },
    driverId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: "driver_id",
    },
    layoutId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "layout_id",
    },
    // Note: currentLocation is usually stored in Redis or a dynamic field, 
    // it's not a physical column in the Laravel `buses` table by default.
  },
  {
    sequelize,
    tableName: "buses",
    timestamps: false,
    underscored: true,
  }
);

export default Bus;
