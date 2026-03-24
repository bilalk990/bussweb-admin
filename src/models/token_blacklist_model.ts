import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class TokenBlacklist extends Model {
    public id!: number;
    public token!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

TokenBlacklist.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        token: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "token_blacklists",
        timestamps: true,
    }
);

export default TokenBlacklist;
