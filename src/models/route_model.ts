import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

// Points to the unified Laravel `bus_routes` table
// Run migrate-routes.ts once to add missing columns (route_name, adult_price, child_price, distance)
export class Route extends Model {
  public id!: number;
  public routeName!: string;
  public origin!: string;
  public destination!: string;
  public distance?: number;
  public childPrice!: number;
  public adultPrice!: number;
  public status!: "active" | "inactive";
  public agencyId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public get _id(): number {
    return this.id;
  }
}

Route.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    routeName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "route_name",
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    distance: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    childPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      field: "child_price",
    },
    adultPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      field: "adult_price",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
    agencyId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: "agency_id",
    },
  },
  {
    sequelize,
    tableName: "bus_routes",
    timestamps: true,
    underscored: true,
  }
);

export default Route;
