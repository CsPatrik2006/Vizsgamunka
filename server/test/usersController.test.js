const usersController = require('../Controller/usersController');
const User = require('../model/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendRegistrationEmail } = require('../utils/emailService');

jest.mock('../model/users', () => ({
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn()
}));

jest.mock('../utils/emailService', () => ({
    sendRegistrationEmail: jest.fn()
}));

describe('Users Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            params: {},
            body: {},
            user: { userId: 1, role: 'user' },
            file: null
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('createUser', () => {
        it('should create a new user', async () => {
            const mockUser = {
                id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                role: 'user'
            };

            req.body = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                role: 'user',
                password: 'password123'
            };

            bcrypt.hash.mockResolvedValue('hashedpassword');
            User.create.mockResolvedValue(mockUser);
            sendRegistrationEmail.mockResolvedValue();

            await usersController.createUser(req, res);

            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(User.create).toHaveBeenCalledWith({
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: undefined,
                role: 'user',
                password_hash: 'hashedpassword',
                last_login: expect.any(Date)
            });
            expect(sendRegistrationEmail).toHaveBeenCalledWith(mockUser);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Felhasználó sikeresen létrehozva!',
                user: mockUser
            });
        });

        it('should return 400 if required fields are missing', async () => {
            req.body = { first_name: 'John' };

            await usersController.createUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Hiányzó kötelező mezők (vezetéknév, keresztnév, email, szerep, jelszó)!'
            });
            expect(User.create).not.toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            req.body = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                role: 'user',
                password: 'password123'
            };

            const error = new Error('Database error');
            bcrypt.hash.mockResolvedValue('hashedpassword');
            User.create.mockRejectedValue(error);

            await usersController.createUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Szerverhiba a létrehozás során!',
                error: error.message
            });
        });
    });

    describe('authenticateUser', () => {
        it('should authenticate a user and return a token', async () => {
            const mockUser = {
                id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                role: 'user',
                password_hash: 'hashedpassword'
            };

            const mockUpdatedUser = {
                id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                role: 'user'
            };

            req.body = {
                email: 'john@example.com',
                password: 'password123'
            };

            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            User.update.mockResolvedValue([1]);
            User.findByPk.mockResolvedValue(mockUpdatedUser);
            jwt.sign.mockReturnValue('token123');

            await usersController.authenticateUser(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
            expect(User.update).toHaveBeenCalledWith(
                { last_login: expect.any(Date) },
                { where: { id: 1 } }
            );
            expect(User.findByPk).toHaveBeenCalledWith(1, {
                attributes: { exclude: ["password_hash"] },
            });
            expect(jwt.sign).toHaveBeenCalledWith(
                { userId: 1, email: 'john@example.com', role: 'user' },
                'secretkey',
                { expiresIn: '24h' }
            );
            expect(res.json).toHaveBeenCalledWith({
                message: 'Sikeres bejelentkezés!',
                token: 'token123',
                user: mockUpdatedUser
            });
        });

        it('should return 400 if email or password is missing', async () => {
            req.body = { email: 'john@example.com' };

            await usersController.authenticateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Hiányzó bejelentkezési adatok!'
            });
            expect(User.findOne).not.toHaveBeenCalled();
        });

        it('should return 401 if user not found', async () => {
            req.body = {
                email: 'john@example.com',
                password: 'password123'
            };

            User.findOne.mockResolvedValue(null);

            await usersController.authenticateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Hibás email vagy jelszó!'
            });
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });

        it('should return 401 if password is incorrect', async () => {
            const mockUser = {
                id: 1,
                email: 'john@example.com',
                password_hash: 'hashedpassword'
            };

            req.body = {
                email: 'john@example.com',
                password: 'wrongpassword'
            };

            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await usersController.authenticateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Hibás email vagy jelszó!'
            });
            expect(User.update).not.toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            req.body = {
                email: 'john@example.com',
                password: 'password123'
            };

            const error = new Error('Database error');
            User.findOne.mockRejectedValue(error);

            await usersController.authenticateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Szerverhiba hitelesítés közben!',
                error: error.message
            });
        });
    });

    describe('getUserById', () => {
        it('should return a user by id', async () => {
            const mockUser = {
                id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                role: 'user'
            };

            req.params.id = 1;

            User.findByPk.mockResolvedValue(mockUser);

            await usersController.getUserById(req, res);

            expect(User.findByPk).toHaveBeenCalledWith(1, {
                attributes: { exclude: ["password_hash"] },
            });
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        it('should return 404 if user not found', async () => {
            req.params.id = 999;
            User.findByPk.mockResolvedValue(null);

            await usersController.getUserById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Felhasználó nem található!'
            });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            const error = new Error('Database error');
            User.findByPk.mockRejectedValue(error);

            await usersController.getUserById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Szerverhiba felhasználó lekérésekor!',
                error: error.message
            });
        });
    });

    describe('updateUser', () => {
        it('should update a user', async () => {
            const mockUpdatedUser = {
                id: 1,
                first_name: 'John',
                last_name: 'Smith',
                email: 'john@example.com',
                role: 'user'
            };

            req.params.id = 1;
            req.body = { last_name: 'Smith' };
            req.user = { userId: 1, role: 'user' };

            User.update.mockResolvedValue([1]);
            User.findByPk.mockResolvedValue(mockUpdatedUser);

            await usersController.updateUser(req, res);

            expect(User.update).toHaveBeenCalledWith(
                { last_name: 'Smith' },
                { where: { id: 1 } }
            );
            expect(User.findByPk).toHaveBeenCalledWith(1, {
                attributes: { exclude: ["password_hash"] },
            });
            expect(res.json).toHaveBeenCalledWith({
                message: 'Felhasználó sikeresen frissítve!',
                user: mockUpdatedUser
            });
        });

        it('should hash password if provided', async () => {
            req.params.id = 1;
            req.body = { password: 'newpassword' };
            req.user = { userId: 1, role: 'user' };

            bcrypt.hash.mockResolvedValue('newhashpassword');
            User.update.mockResolvedValue([1]);
            User.findByPk.mockResolvedValue({ id: 1 });

            await usersController.updateUser(req, res);

            expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
            expect(User.update).toHaveBeenCalledWith(
                { password_hash: 'newhashpassword' },
                { where: { id: 1 } }
            );
        });

        it('should return 403 if not authorized', async () => {
            req.params.id = 2;
            req.body = { last_name: 'Smith' };
            req.user = { userId: 1, role: 'user' };

            await usersController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Nincs jogosultsága más felhasználó adatainak módosításához!'
            });
            expect(User.update).not.toHaveBeenCalled();
        });

        it('should allow admin to update any user', async () => {
            req.params.id = 2;
            req.body = { last_name: 'Smith' };
            req.user = { userId: 1, role: 'admin' };

            User.update.mockResolvedValue([1]);
            User.findByPk.mockResolvedValue({ id: 2 });

            await usersController.updateUser(req, res);

            expect(User.update).toHaveBeenCalledWith(
                { last_name: 'Smith' },
                { where: { id: 2 } }
            );
        });

        it('should return 404 if user not found', async () => {
            req.params.id = 999;
            req.body = { last_name: 'Smith' };
            req.user = { userId: 1, role: 'admin' };

            User.update.mockResolvedValue([0]);

            await usersController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Felhasználó nem található!'
            });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            req.body = { last_name: 'Smith' };
            req.user = { userId: 1, role: 'user' };

            const error = new Error('Database error');
            User.update.mockRejectedValue(error);

            await usersController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Szerverhiba frissítés közben!',
                error: error.message
            });
        });
    });

    describe('changePassword', () => {
        it('should change user password', async () => {
            const mockUser = {
                id: 1,
                password_hash: 'oldhashpassword'
            };

            req.params.id = 1;
            req.body = {
                currentPassword: 'oldpassword',
                newPassword: 'newpassword'
            };
            req.user = { userId: 1, role: 'user' };

            User.findByPk.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('newhashpassword');
            User.update.mockResolvedValue([1]);

            await usersController.changePassword(req, res);

            expect(User.findByPk).toHaveBeenCalledWith(1);
            expect(bcrypt.compare).toHaveBeenCalledWith('oldpassword', 'oldhashpassword');
            expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
            expect(User.update).toHaveBeenCalledWith(
                { password_hash: 'newhashpassword' },
                { where: { id: 1 } }
            );
            expect(res.json).toHaveBeenCalledWith({
                message: 'Jelszó sikeresen módosítva!'
            });
        });

        it('should return 400 if passwords are missing', async () => {
            req.params.id = 1;
            req.body = { currentPassword: 'oldpassword' };

            await usersController.changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Hiányzó jelszó adatok!'
            });
            expect(User.findByPk).not.toHaveBeenCalled();
        });

        it('should return 403 if not authorized', async () => {
            req.params.id = 2;
            req.body = {
                currentPassword: 'oldpassword',
                newPassword: 'newpassword'
            };
            req.user = { userId: 1, role: 'user' };

            await usersController.changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Nincs jogosultsága más felhasználó jelszavának módosításához!'
            });
            expect(User.findByPk).not.toHaveBeenCalled();
        });

        it('should return 404 if user not found', async () => {
            req.params.id = 999;
            req.body = {
                currentPassword: 'oldpassword',
                newPassword: 'newpassword'
            };
            req.user = { userId: 1, role: 'admin' };

            User.findByPk.mockResolvedValue(null);

            await usersController.changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Felhasználó nem található!'
            });
        });

        it('should return 401 if current password is incorrect', async () => {
            const mockUser = {
                id: 1,
                password_hash: 'oldhashpassword'
            };

            req.params.id = 1;
            req.body = {
                currentPassword: 'wrongpassword',
                newPassword: 'newpassword'
            };
            req.user = { userId: 1, role: 'user' };

            User.findByPk.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await usersController.changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Jelenlegi jelszó helytelen!'
            });
            expect(bcrypt.hash).not.toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            req.body = {
                currentPassword: 'oldpassword',
                newPassword: 'newpassword'
            };
            req.user = { userId: 1, role: 'user' };

            const error = new Error('Database error');
            User.findByPk.mockRejectedValue(error);

            await usersController.changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Szerverhiba jelszó módosítás közben!',
                error: error.message
            });
        });
    });

    describe('deleteUser', () => {
        it('should delete a user', async () => {
            req.params.id = 1;
            req.user = { userId: 1, role: 'user' };

            User.destroy.mockResolvedValue(1);

            await usersController.deleteUser(req, res);

            expect(User.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(res.json).toHaveBeenCalledWith({
                message: 'Felhasználó sikeresen törölve!'
            });
        });

        it('should return 403 if not authorized', async () => {
            req.params.id = 2;
            req.user = { userId: 1, role: 'user' };

            await usersController.deleteUser(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Nincs jogosultsága más felhasználó törlésére!'
            });
            expect(User.destroy).not.toHaveBeenCalled();
        });

        it('should allow admin to delete any user', async () => {
            req.params.id = 2;
            req.user = { userId: 1, role: 'admin' };

            User.destroy.mockResolvedValue(1);

            await usersController.deleteUser(req, res);

            expect(User.destroy).toHaveBeenCalledWith({ where: { id: 2 } });
        });

        it('should return 404 if user not found', async () => {
            req.params.id = 999;
            req.user = { userId: 1, role: 'admin' };

            User.destroy.mockResolvedValue(0);

            await usersController.deleteUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Felhasználó nem található!'
            });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            req.user = { userId: 1, role: 'user' };

            const error = new Error('Database error');
            User.destroy.mockRejectedValue(error);

            await usersController.deleteUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Szerverhiba törlés közben!',
                error: error.message
            });
        });
    });

    describe('uploadProfilePicture', () => {
        it('should upload a profile picture', async () => {
            const mockUpdatedUser = {
                id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                profile_picture: '/api/uploads/profile-pictures/newpicture.jpg'
            };

            req.params.id = 1;
            req.user = { userId: 1, role: 'user' };
            req.file = { filename: 'newpicture.jpg' };

            User.update.mockResolvedValue([1]);
            User.findByPk.mockResolvedValue(mockUpdatedUser);

            await usersController.uploadProfilePicture(req, res);

            expect(User.update).toHaveBeenCalledWith(
                { profile_picture: '/api/uploads/profile-pictures/newpicture.jpg' },
                { where: { id: 1 } }
            );
            expect(User.findByPk).toHaveBeenCalledWith(1, {
                attributes: { exclude: ["password_hash"] },
            });
            expect(res.json).toHaveBeenCalledWith({
                message: 'Profilkép sikeresen frissítve!',
                user: mockUpdatedUser,
                profilePicture: '/api/uploads/profile-pictures/newpicture.jpg'
            });
        });

        it('should return 400 if no file is uploaded', async () => {
            req.params.id = 1;
            req.user = { userId: 1, role: 'user' };
            req.file = null;

            await usersController.uploadProfilePicture(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Nem található feltöltött fájl!'
            });
            expect(User.update).not.toHaveBeenCalled();
        });

        it('should return 403 if not authorized', async () => {
            req.params.id = 2;
            req.user = { userId: 1, role: 'user' };
            req.file = { filename: 'newpicture.jpg' };

            await usersController.uploadProfilePicture(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Nincs jogosultsága más felhasználó profilképének módosításához!'
            });
            expect(User.update).not.toHaveBeenCalled();
        });

        it('should return 404 if user not found', async () => {
            req.params.id = 999;
            req.user = { userId: 1, role: 'admin' };
            req.file = { filename: 'newpicture.jpg' };

            User.update.mockResolvedValue([0]);

            await usersController.uploadProfilePicture(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Felhasználó nem található!'
            });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            req.user = { userId: 1, role: 'user' };
            req.file = { filename: 'newpicture.jpg' };

            const error = new Error('Database error');
            User.update.mockRejectedValue(error);

            await usersController.uploadProfilePicture(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Szerverhiba a profilkép feltöltése közben!',
                error: error.message
            });
        });
    });

    describe('getAllUsers', () => {
        it('should return all users', async () => {
            const mockUsers = [
                {
                    id: 1,
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: 'user',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    last_login: new Date()
                },
                {
                    id: 2,
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    role: 'admin',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    last_login: new Date()
                }
            ];

            User.findAll.mockResolvedValue(mockUsers);

            await usersController.getAllUsers(req, res);

            expect(User.findAll).toHaveBeenCalledWith({
                attributes: ["id", "name", "email", "phone", "role", "createdAt", "updatedAt", "last_login"],
            });
            expect(res.json).toHaveBeenCalledWith(mockUsers);
        });

        it('should handle errors', async () => {
            const error = new Error('Database error');
            User.findAll.mockRejectedValue(error);

            await usersController.getAllUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Szerverhiba felhasználók lekérésekor!',
                error: error.message
            });
        });
    });
});  