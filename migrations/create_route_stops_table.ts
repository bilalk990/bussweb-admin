import { sequelize } from "../src/config/database";
import { DataTypes } from "sequelize";

/**
 * Migration to create bus_route_stops table for stop-wise routing
 * This allows routes to have multiple intermediate stops between origin and destination
 */
async function createRouteStopsTable() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    // Create bus_route_stops table
    await queryInterface.createTable("bus_route_stops", {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      route_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "bus_routes",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      stop_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Order of the stop in the route (1, 2, 3, etc.)",
      },
      stop_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      stop_type: {
        type: DataTypes.ENUM("origin", "intermediate", "destination"),
        allowNull: false,
        defaultValue: "intermediate",
      },
      arrival_time: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: "Expected arrival time at this stop",
      },
      departure_time: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: "Expected departure time from this stop",
      },
      stop_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 5,
        comment: "Duration of stop in minutes",
      },
      distance_from_previous: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: "Distance in km from previous stop",
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
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex("bus_route_stops", ["route_id"]);
    await queryInterface.addIndex("bus_route_stops", ["route_id", "stop_order"]);
    await queryInterface.addIndex("bus_route_stops", ["stop_type"]);

    console.log("✅ bus_route_stops table created successfully");
  } catch (error) {
    console.error("❌ Error creating bus_route_stops table:", error);
    throw error;
  }
}

// Run migration
createRouteStopsTable()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
