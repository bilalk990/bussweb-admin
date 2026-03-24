import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class StaffOperation extends Model {
    public id!: number;
    public staffId!: number;
    public agencyId!: number;
    public operationType!: 'create' | 'update' | 'delete' | 'block' | 'unblock';
    public targetUserId?: number;
    public changes?: any;
    public timestamp!: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

StaffOperation.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        staffId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'staff_id',
        },
        agencyId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'agency_id',
        },
        operationType: {
            type: DataTypes.ENUM('create', 'update', 'delete', 'block', 'unblock'),
            allowNull: false,
            field: 'operation_type',
        },
        targetUserId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: 'target_user_id',
        },
        changes: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'staff_operations',
        timestamps: true,
        underscored: true,
    }
);

export default StaffOperation;
