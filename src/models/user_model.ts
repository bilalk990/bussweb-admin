import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class User extends Model {
  public id!: number;
  public agencyId?: number;
  public name!: string;
  public email!: string;
  public phone?: string;
  public password!: string;
  public emailVerifiedAt?: Date;
  public role!: string;
  public status!: string;
  public assignedBusId?: number;
  public profilePicture?: string;
  public assignedBus?: any; // For TypeScript compatibility with association
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual field for frontend compatibility
  public get _id(): number {
    return this.id;
  }

  // Virtual field for email verification check
  public get is_email_verified(): boolean {
    return !!this.emailVerifiedAt;
  }
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    agencyId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: "agency_id",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "email_verified_at",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true, // Might not be in table yet
      defaultValue: "user",
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true, // Might not be in table yet
      defaultValue: "active",
    },
    assignedBusId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: "assigned_bus_id",
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "profile_picture",
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "phone",
    },
    rememberToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "remember_token",
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

export default User;