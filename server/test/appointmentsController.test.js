jest.mock('../model/appointments', () => {
  return {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    belongsTo: jest.fn(),
    hasMany: jest.fn()
  };
});

jest.mock('../model/garageSchedule', () => {
  return {
    findByPk: jest.fn(),
    belongsTo: jest.fn(),
    hasMany: jest.fn()
  };
});

jest.mock('../model/users', () => {
  return {
    findByPk: jest.fn(),
    belongsTo: jest.fn(),
    hasMany: jest.fn()
  };
});

jest.mock('../model/garages', () => {
  return {
    findByPk: jest.fn(),
    belongsTo: jest.fn(),
    hasMany: jest.fn()
  };
});

jest.mock('../config/config', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(),
    sync: jest.fn().mockResolvedValue()
  },
  testConnection: jest.fn().mockResolvedValue()
}));

jest.mock('../utils/emailService', () => ({
  sendAppointmentConfirmationEmail: jest.fn().mockResolvedValue()
}));

const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByUserId
} = require('../Controller/appointmentsController');
const Appointments = require('../model/appointments');
const GarageScheduleSlot = require('../model/garageSchedule');
const User = require('../model/users');
const Garage = require('../model/garages');
const emailService = require('../utils/emailService');

describe('Appointments Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { id: 1 }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getAllAppointments', () => {
    it('should return all appointments', async () => {
      const appointments = [
        { id: 1, user_id: 1, garage_id: 1, schedule_slot_id: 1, appointment_time: '2023-01-01T10:00:00', status: 'pending', order_id: 1 },
        { id: 2, user_id: 2, garage_id: 2, schedule_slot_id: 2, appointment_time: '2023-01-02T11:00:00', status: 'confirmed', order_id: 2 }
      ];

      Appointments.findAll.mockResolvedValue(appointments);

      await getAllAppointments(req, res);

      expect(Appointments.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(appointments);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      Appointments.findAll.mockRejectedValue(error);

      await getAllAppointments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error', error: error.message });
    });
  });

  describe('getAppointmentById', () => {
    it('should return an appointment when valid ID is provided', async () => {
      const appointment = { id: 1, user_id: 1, garage_id: 1 };
      req.params.id = 1;

      Appointments.findByPk.mockResolvedValue(appointment);

      await getAppointmentById(req, res);

      expect(Appointments.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(appointment);
    });

    it('should return 404 when appointment is not found', async () => {
      req.params.id = 999;

      Appointments.findByPk.mockResolvedValue(null);

      await getAppointmentById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Appointment not found' });
    });
  });

  describe('createAppointment', () => {
    it('should create a new appointment with valid data', async () => {
      req.body = {
        user_id: 1,
        garage_id: 1,
        appointment_time: '2023-01-01T10:00:00',
        order_id: 1
      };

      const newAppointment = { id: 1, ...req.body, status: 'pending' };
      Appointments.create.mockResolvedValue(newAppointment);

      await createAppointment(req, res);

      expect(Appointments.create).toHaveBeenCalledWith({
        user_id: 1,
        garage_id: 1,
        appointment_time: '2023-01-01T10:00:00',
        status: 'pending',
        order_id: 1
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newAppointment);
    });

    it('should validate required fields', async () => {
      req.body = { user_id: 1 };

      await createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].message).toContain('Missing required fields');
    });

    it('should validate schedule slot when provided', async () => {
      const appointmentDate = new Date('2023-01-02T10:30:00');
      req.body = {
        user_id: 1,
        garage_id: 1,
        schedule_slot_id: 1,
        appointment_time: appointmentDate.toISOString(),
        order_id: 1
      };

      const slot = {
        id: 1,
        garage_id: 1,
        day_of_week: 'monday',
        start_time: '09:00:00',
        end_time: '11:00:00',
        max_bookings: 3
      };

      GarageScheduleSlot.findByPk.mockResolvedValue(slot);
      Appointments.count.mockResolvedValue(2);
      Appointments.create.mockResolvedValue({ id: 1, ...req.body, status: 'pending' });

      await createAppointment(req, res);

      expect(GarageScheduleSlot.findByPk).toHaveBeenCalledWith(1);
      expect(Appointments.count).toHaveBeenCalled();
      expect(Appointments.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should reject when slot is fully booked', async () => {
      const appointmentDate = new Date('2023-01-02T10:30:00');
      req.body = {
        user_id: 1,
        garage_id: 1,
        schedule_slot_id: 1,
        appointment_time: appointmentDate.toISOString(),
        order_id: 1
      };

      const slot = {
        id: 1,
        garage_id: 1,
        day_of_week: 'monday',
        start_time: '09:00:00',
        end_time: '11:00:00',
        max_bookings: 3
      };

      GarageScheduleSlot.findByPk.mockResolvedValue(slot);
      Appointments.count.mockResolvedValue(3);

      await createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'This time slot is already fully booked' });
    });
  });

  describe('updateAppointment', () => {
    it('should update an existing appointment', async () => {
      req.params.id = 1;
      req.body = {
        status: 'confirmed'
      };

      const appointment = {
        id: 1,
        user_id: 1,
        garage_id: 1,
        appointment_time: '2023-01-01T10:00:00',
        status: 'pending',
        order_id: 1,
        update: jest.fn().mockResolvedValue()
      };

      Appointments.findByPk.mockResolvedValue(appointment);
      User.findByPk.mockResolvedValue({ id: 1, email: 'user@example.com' });
      Garage.findByPk.mockResolvedValue({ id: 1, name: 'Test Garage' });

      await updateAppointment(req, res);

      expect(Appointments.findByPk).toHaveBeenCalledWith(1);
      expect(appointment.update).toHaveBeenCalledWith({ status: 'confirmed' });
      expect(res.json).toHaveBeenCalledWith(appointment);

      if (req.body.status === 'confirmed') {
        expect(User.findByPk).toHaveBeenCalledWith(1);
        expect(Garage.findByPk).toHaveBeenCalledWith(1);
        expect(emailService.sendAppointmentConfirmationEmail).toHaveBeenCalled();
      }
    });

    it('should return 404 when appointment is not found', async () => {
      req.params.id = 999;

      Appointments.findByPk.mockResolvedValue(null);

      await updateAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Appointment not found' });
    });
  });

  describe('deleteAppointment', () => {
    it('should delete an existing appointment', async () => {
      req.params.id = 1;

      const appointment = {
        id: 1,
        destroy: jest.fn().mockResolvedValue()
      };

      Appointments.findByPk.mockResolvedValue(appointment);

      await deleteAppointment(req, res);

      expect(Appointments.findByPk).toHaveBeenCalledWith(1);
      expect(appointment.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Appointment deleted successfully' });
    });

    it('should return 404 when appointment is not found', async () => {
      req.params.id = 999;

      Appointments.findByPk.mockResolvedValue(null);

      await deleteAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Appointment not found' });
    });
  });

  describe('getAppointmentsByUserId', () => {
    it('should return appointments for a valid user', async () => {
      req.params.userId = '1';
      req.user = { id: 1 };

      const user = { id: 1, name: 'Test User' };
      const appointments = [
        { id: 1, user_id: 1, garage_id: 1, appointment_time: '2023-01-01T10:00:00' }
      ];

      User.findByPk.mockResolvedValue(user);
      Appointments.findAll.mockResolvedValue(appointments);

      await getAppointmentsByUserId(req, res);

      expect(User.findByPk).toHaveBeenCalledWith('1');
      expect(Appointments.findAll).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(res.json).toHaveBeenCalledWith(appointments);
    });

    it('should return 404 when user is not found', async () => {
      req.params.userId = '999';

      User.findByPk.mockResolvedValue(null);

      await getAppointmentsByUserId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 403 when unauthorized user tries to access appointments', async () => {
      req.params.userId = '2';
      req.user = { id: 1 };

      const user = { id: 2, name: 'Another User' };

      User.findByPk.mockResolvedValue(user);

      await getAppointmentsByUserId(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized access to another user's appointments" });
    });
  });
});