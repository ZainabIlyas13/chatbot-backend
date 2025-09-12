import { prisma } from '../../lib/prisma.ts';
import type { 
  CreateAppointmentArgs, 
  UpdateAppointmentArgs, 
  Appointment
} from '@/types/index.ts';

class AppointmentService {
  // Create a new appointment
  createAppointment = async (args: CreateAppointmentArgs) => {
    try {
      const appointment = await prisma.appointment.create({
        data: {
          title: args.title,
          description: args.description,
          date: new Date(args.date),
          duration: args.duration || 60,
          clientName: args.clientName,
          clientEmail: args.clientEmail,
          clientPhone: args.clientPhone,
          status: 'scheduled'
        }
      });

      return {
        success: true,
        data: appointment
      };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return {
        success: false,
        error: 'Failed to create appointment'
      };
    }
  }

  // Get all appointments
  getAppointments = async (args: {
    status?: string;
    clientEmail?: string;
  }) => {
    try {
      const where: { status?: string; clientEmail?: string } = {};
      
      if (args.status) {
        where.status = args.status;
      }
      
      if (args.clientEmail) {
        where.clientEmail = args.clientEmail;
      }

      const appointments = await prisma.appointment.findMany({
        where,
        orderBy: { date: 'asc' }
      });

      return {
        success: true,
        data: appointments
      };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return {
        success: false,
        error: 'Failed to fetch appointments'
      };
    }
  }

  // Update an appointment by client email and date
  updateAppointment = async (args: UpdateAppointmentArgs) => {
    try {
      let whereClause: { clientEmail: string; date?: Date } = { clientEmail: args.clientEmail };
      
      if (args.date) {
        whereClause.date = new Date(args.date);
      }

      // Find the appointment(s)
      const appointments = await prisma.appointment.findMany({
        where: whereClause,
        orderBy: { date: 'desc' }
      });

      if (appointments.length === 0) {
        return {
          success: false,
          error: 'No appointment found with the given details'
        };
      }

      // If multiple appointments found and no specific date, ask for clarification
      if (appointments.length > 1 && !args.date) {
        return {
          success: false,
          error: 'Multiple appointments found. Please specify the date.',
          data: appointments.map((appointment: Appointment) => ({
            id: appointment.id,
            title: appointment.title,
            date: appointment.date,
            status: appointment.status
          }))
        };
      }

      // Prepare update data
      const updateData: {
        title?: string;
        description?: string;
        date?: Date;
        duration?: number;
        clientName?: string;
        clientPhone?: string;
        status?: string;
      } = {};
      if (args.title !== undefined) updateData.title = args.title;
      if (args.description !== undefined) updateData.description = args.description;
      if (args.newDate !== undefined) updateData.date = new Date(args.newDate);
      if (args.duration !== undefined) updateData.duration = args.duration;
      if (args.clientName !== undefined) updateData.clientName = args.clientName;
      if (args.clientPhone !== undefined) updateData.clientPhone = args.clientPhone;
      if (args.status !== undefined) updateData.status = args.status;

      const appointmentToUpdate = appointments[0];
      const appointment = await prisma.appointment.update({
        where: { id: appointmentToUpdate.id },
        data: updateData
      });

      return {
        success: true,
        data: appointment
      };
    } catch (error) {
      console.error('Error updating appointment:', error);
      return {
        success: false,
        error: 'Failed to update appointment'
      };
    }
  }

  // Delete an appointment by client email and date
  deleteAppointment = async (args: {
    clientEmail: string;
    date?: string;
  }) => {
    try {
      let whereClause: { clientEmail: string; date?: Date } = { clientEmail: args.clientEmail };
      
      if (args.date) {
        whereClause.date = new Date(args.date);
      }

      // Find the appointment(s)
      const appointments = await prisma.appointment.findMany({
        where: whereClause,
        orderBy: { date: 'desc' }
      });

      if (appointments.length === 0) {
        return {
          success: false,
          error: 'No appointment found with the given details'
        };
      }

      // If multiple appointments found and no specific date, ask for clarification
      if (appointments.length > 1 && !args.date) {
        return {
          success: false,
          error: 'Multiple appointments found. Please specify the date.',
          data: appointments.map((appointment: Appointment) => ({
            id: appointment.id,
            title: appointment.title,
            date: appointment.date,
            status: appointment.status
          }))
        };
      }

      // Delete the appointment
      const appointmentToDelete = appointments[0];
      await prisma.appointment.delete({
        where: { id: appointmentToDelete.id }
      });

      return {
        success: true,
        data: { 
          deleted: true,
          appointment: {
            title: appointmentToDelete.title,
            date: appointmentToDelete.date,
            clientName: appointmentToDelete.clientName
          }
        }
      };
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return {
        success: false,
        error: 'Failed to delete appointment'
      };
    }
  }

  // Get appointment by ID
  getAppointmentById = async (args: {
    id: string;
  }) => {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: args.id }
      });

      if (!appointment) {
        return {
          success: false,
          error: 'Appointment not found'
        };
      }

      return {
        success: true,
        data: appointment
      };
    } catch (error) {
      console.error('Error fetching appointment:', error);
      return {
        success: false,
        error: 'Failed to fetch appointment'
      };
    }
  }
}

// Export singleton instance
export const appointmentService = new AppointmentService();
