const garagesController = require('../Controller/garagesController');
const Garage = require('../model/garages');
const GarageScheduleSlot = require('../model/garageSchedule');
const Appointments = require('../model/appointments');
const { Op } = require('sequelize');

jest.mock('../model/garages', () => ({
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
}));

jest.mock('../model/garageSchedule', () => ({
    findAll: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn()
}));

jest.mock('../model/appointments', () => ({
    count: jest.fn()
}));

jest.mock('sequelize', () => ({
    Op: {
        between: 'between',
        notIn: 'notIn'
    }
}));

describe('Garages Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            params: {},
            body: {},
            query: {},
            user: { id: 1 }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('getAllGarages', () => {
        it('should return all garages', async () => {
            const mockGarages = [
                { id: 1, owner_id: 1, name: 'Garage 1', location: 'Location 1' },
                { id: 2, owner_id: 1, name: 'Garage 2', location: 'Location 2' }
            ];

            Garage.findAll.mockResolvedValue(mockGarages);

            await garagesController.getAllGarages(req, res);

            expect(Garage.findAll).toHaveBeenCalledWith({
                attributes: ["id", "owner_id", "name", "location", "contact_info", "description", "opening_hours"]
            });
            expect(res.json).toHaveBeenCalledWith(mockGarages);
        });

        it('should handle errors', async () => {
            const error = new Error('Database error');
            Garage.findAll.mockRejectedValue(error);

            await garagesController.getAllGarages(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('getGarageById', () => {
        it('should return a garage by id', async () => {
            const mockGarage = { id: 1, owner_id: 1, name: 'Garage 1', location: 'Location 1' };
            req.params.id = 1;

            Garage.findByPk.mockResolvedValue(mockGarage);

            await garagesController.getGarageById(req, res);

            expect(Garage.findByPk).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockGarage);
        });

        it('should return 404 if garage not found', async () => {
            req.params.id = 999;
            Garage.findByPk.mockResolvedValue(null);

            await garagesController.getGarageById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Garage not found' });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            const error = new Error('Database error');
            Garage.findByPk.mockRejectedValue(error);

            await garagesController.getGarageById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('createGarage', () => {
        it('should create a new garage', async () => {
            const mockGarage = {
                id: 1,
                owner_id: 1,
                name: 'Garage 1',
                location: 'Location 1',
                contact_info: '123456789',
                description: 'Description',
                opening_hours: 'Mon-Fri 9-5'
            };

            req.body = {
                owner_id: 1,
                name: 'Garage 1',
                location: 'Location 1',
                contact_info: '123456789',
                description: 'Description',
                opening_hours: 'Mon-Fri 9-5'
            };

            Garage.create.mockResolvedValue(mockGarage);

            await garagesController.createGarage(req, res);

            expect(Garage.create).toHaveBeenCalledWith({
                owner_id: 1,
                name: 'Garage 1',
                location: 'Location 1',
                contact_info: '123456789',
                description: 'Description',
                opening_hours: 'Mon-Fri 9-5'
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockGarage);
        });

        it('should return 400 if required fields are missing', async () => {
            req.body = { owner_id: 1 };

            await garagesController.createGarage(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Missing required fields (owner_id, name, location)'
            });
            expect(Garage.create).not.toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            req.body = {
                owner_id: 1,
                name: 'Garage 1',
                location: 'Location 1'
            };
            const error = new Error('Database error');
            Garage.create.mockRejectedValue(error);

            await garagesController.createGarage(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('updateGarage', () => {
        it('should update a garage', async () => {
            const mockGarage = {
                id: 1,
                owner_id: 1,
                name: 'Garage 1',
                location: 'Location 1',
                update: jest.fn().mockResolvedValue({
                    id: 1,
                    owner_id: 1,
                    name: 'Updated Garage',
                    location: 'Updated Location'
                })
            };
            req.params.id = 1;
            req.body = {
                owner_id: 1,
                name: 'Updated Garage',
                location: 'Updated Location',
                contact_info: 'Updated Contact',
                description: 'Updated Description',
                opening_hours: 'Updated Hours'
            };

            Garage.findByPk.mockResolvedValue(mockGarage);

            await garagesController.updateGarage(req, res);

            expect(Garage.findByPk).toHaveBeenCalledWith(1);
            expect(mockGarage.update).toHaveBeenCalledWith({
                owner_id: 1,
                name: 'Updated Garage',
                location: 'Updated Location',
                contact_info: 'Updated Contact',
                description: 'Updated Description',
                opening_hours: 'Updated Hours'
            });
            expect(res.json).toHaveBeenCalledWith(mockGarage);
        });

        it('should return 404 if garage not found', async () => {
            req.params.id = 999;
            Garage.findByPk.mockResolvedValue(null);

            await garagesController.updateGarage(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Garage not found' });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            const error = new Error('Database error');
            Garage.findByPk.mockRejectedValue(error);

            await garagesController.updateGarage(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('deleteGarage', () => {
        it('should delete a garage', async () => {
            const mockGarage = {
                id: 1,
                owner_id: 1,
                name: 'Garage 1',
                location: 'Location 1',
                destroy: jest.fn().mockResolvedValue(undefined)
            };
            req.params.id = 1;

            Garage.findByPk.mockResolvedValue(mockGarage);

            await garagesController.deleteGarage(req, res);

            expect(Garage.findByPk).toHaveBeenCalledWith(1);
            expect(mockGarage.destroy).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Garage deleted successfully' });
        });

        it('should return 404 if garage not found', async () => {
            req.params.id = 999;
            Garage.findByPk.mockResolvedValue(null);

            await garagesController.deleteGarage(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Garage not found' });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            const error = new Error('Database error');
            Garage.findByPk.mockRejectedValue(error);

            await garagesController.deleteGarage(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('getGarageSchedule', () => {
        it('should return garage schedule', async () => {
            req.params.id = 1;

            const mockGarage = { id: 1, owner_id: 1, name: 'Garage 1' };

            Garage.findByPk.mockResolvedValue(mockGarage);
            GarageScheduleSlot.update.mockResolvedValue([1]);
            GarageScheduleSlot.findOne.mockImplementation((query) => {
                if (query.where.day_of_week === 'monday' && query.where.start_time === '09:00:00') {
                    return Promise.resolve({
                        id: 1,
                        garage_id: 1,
                        day_of_week: 'monday',
                        start_time: '09:00:00',
                        end_time: '12:00:00',
                        max_bookings: 2,
                        update: jest.fn().mockResolvedValue(true)
                    });
                } else {
                    return Promise.resolve(null);
                }
            });
            GarageScheduleSlot.create.mockResolvedValue(true);

            await garagesController.updateGarageSchedule(req, res);

            expect(Garage.findByPk).toHaveBeenCalledWith(1);
            expect(GarageScheduleSlot.update).toHaveBeenCalledWith(
                { is_active: false },
                {
                    where: {
                        garage_id: 1,
                        day_of_week: 'monday'
                    }
                }
            );
            expect(GarageScheduleSlot.update).toHaveBeenCalledWith(
                { is_active: false },
                {
                    where: {
                        garage_id: 1,
                        day_of_week: 'tuesday'
                    }
                }
            );
            expect(GarageScheduleSlot.create).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Schedule updated successfully' });
        });

        it('should return 404 if garage not found', async () => {
            req.params.id = 999;
            Garage.findByPk.mockResolvedValue(null);

            await garagesController.updateGarageSchedule(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Garage not found' });
        });

        it('should return 403 if user does not own the garage', async () => {
            req.params.id = 1;
            req.user = { id: 2 };

            const mockGarage = { id: 1, owner_id: 1, name: 'Garage 1' };
            Garage.findByPk.mockResolvedValue(mockGarage);

            await garagesController.updateGarageSchedule(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: "You don't have permission to update this garage's schedule"
            });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            const error = new Error('Database error');
            Garage.findByPk.mockRejectedValue(error);

            await garagesController.updateGarageSchedule(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('getAvailableSlots', () => {
        it('should return available slots for a specific date', async () => {
            req.params.garageId = 1;
            req.query.date = '2023-05-15';

            const mockSlots = [
                { id: 1, garage_id: 1, day_of_week: 'monday', start_time: '09:00:00', end_time: '12:00:00', max_bookings: 2, is_active: true },
                { id: 2, garage_id: 1, day_of_week: 'monday', start_time: '13:00:00', end_time: '17:00:00', max_bookings: 2, is_active: true }
            ];

            GarageScheduleSlot.findAll.mockResolvedValue(mockSlots);

            Appointments.count.mockImplementation((query) => {
                if (query.where.appointment_time[Op.between][0].includes('09:00:00')) {
                    return Promise.resolve(1);
                } else {
                    return Promise.resolve(2);
                }
            });

            await garagesController.getAvailableSlots(req, res);

            expect(GarageScheduleSlot.findAll).toHaveBeenCalledWith({
                where: {
                    garage_id: 1,
                    day_of_week: 'monday',
                    is_active: true
                },
                order: [['start_time', 'ASC']]
            });

            expect(res.json).toHaveBeenCalledWith([
                {
                    id: 1,
                    start_time: '09:00:00',
                    end_time: '12:00:00',
                    max_bookings: 2,
                    available_bookings: 1,
                    is_full: false
                },
                {
                    id: 2,
                    start_time: '13:00:00',
                    end_time: '17:00:00',
                    max_bookings: 2,
                    available_bookings: 0,
                    is_full: true
                }
            ]);
        });

        it('should return 400 if date parameter is missing', async () => {
            req.params.garageId = 1;

            await garagesController.getAvailableSlots(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Date parameter is required' });
        });

        it('should handle errors', async () => {
            req.params.garageId = 1;
            req.query.date = '2023-05-15';

            const error = new Error('Database error');
            GarageScheduleSlot.findAll.mockRejectedValue(error);

            await garagesController.getAvailableSlots(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });
});