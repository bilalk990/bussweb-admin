import { Request, Response } from "express";
import { Passenger } from "../services/email_service";

// Store pending releases
const pendingReleases = new Map<string, NodeJS.Timeout>();

export const seatController = {
    reserveSeats: async (
        availableSeats: any[],
        passengersList: Array<any>,
        userId: number,
        basePrice: number,
        tripId: number,
        session?: any
    ): Promise<[string[], Passenger[]]> => {
        // Seat reservation is handled via the booking system
        // This is a placeholder for future implementation
        return [[], []];
    },

    releaseSeats: async (bookingId: number, bookingStatus?: string, bookingPaymentStatus?: string) => {
        // Placeholder - seat release logic
        console.log(`Releasing seats for booking ${bookingId}`);
    },

    markSeatsAsBooked: async (bookingId: number) => {
        // Placeholder - mark seats as booked
        console.log(`Marking seats as booked for booking ${bookingId}`);
    },

    scheduleSeatRelease: (bookingId: number) => {
        const timeoutId = setTimeout(async () => {
            try {
                await seatController.releaseSeats(bookingId);
                pendingReleases.delete(bookingId.toString());
            } catch (error) {
                console.error("Scheduled seat release failed:", error);
            }
        }, 5 * 60 * 1000);

        pendingReleases.set(bookingId.toString(), timeoutId);
    },

    cancelScheduledRelease: (bookingId: number) => {
        const timeoutId = pendingReleases.get(bookingId.toString());
        if (timeoutId) {
            clearTimeout(timeoutId);
            pendingReleases.delete(bookingId.toString());
        }
    },

    initializeSeats: async (busCapacity: number) => {
        const seats = [];
        for (let i = 1; i <= busCapacity; i++) {
            seats.push({ seatNumber: i.toString(), status: 'available' });
        }
        return seats;
    }
};
