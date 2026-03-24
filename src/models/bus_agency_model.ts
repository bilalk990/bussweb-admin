import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

// Maps to the Laravel `bus_agencies` table
export class BusAgency extends Model {
  public id!: number;
  public agencyName?: string;
  public logo?: string;
  public contactEmail?: string;
  public contactPhone?: string;
  public description?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public get _id(): number {
    return this.id;
  }
}

BusAgency.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    agencyName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "agency_name",
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "agency_logo",
    },
    // bus_agencies uses `email` not `contact_email`
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "email",
    },
    // bus_agencies uses `phone` not `contact_phone`
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "phone",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "agency_description",
    },
    isActive: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: "is_verified",
    },
  },
  {
    sequelize,
    tableName: "bus_agencies",
    timestamps: false, // bus_agencies uses `creer`/`modifier` not standard timestamps
  }
);

export default BusAgency;
