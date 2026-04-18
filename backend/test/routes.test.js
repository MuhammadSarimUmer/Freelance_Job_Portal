const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';

const applicationRoutes = require('../src/routes/applicationRoutes');
const authRoutes = require('../src/routes/authRoutes');
const technologyRoutes = require('../src/routes/technologyRoutes');
const { verifyToken } = require('../src/middlewares/authMiddleware');
const applicationController = require('../src/controllers/applicationController');
const authController = require('../src/controllers/authController');
const technologyController = require('../src/controllers/technologyController');

const findRoute = (router, method, path) =>
    router.stack.find(
        (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
    );

const routeHasMiddleware = (route, middleware) =>
    route.route.stack.some((layer) => layer.handle === middleware);

test('application routes are protected with verifyToken', () => {
    const routes = [
        { method: 'post', path: '/', handler: applicationController.createApplication },
        { method: 'get', path: '/', handler: applicationController.getApplications },
        { method: 'get', path: '/:id', handler: applicationController.getApplicationById },
        { method: 'put', path: '/:id', handler: applicationController.updateApplication },
        { method: 'delete', path: '/:id', handler: applicationController.deleteApplication }
    ];

    routes.forEach(({ method, path, handler }) => {
        const route = findRoute(applicationRoutes, method, path);
        assert.ok(route, `Missing route ${method.toUpperCase()} ${path}`);
        assert.ok(routeHasMiddleware(route, verifyToken), `Route ${method.toUpperCase()} ${path} missing verifyToken`);
        assert.equal(route.route.stack[route.route.stack.length - 1].handle, handler);
    });
});

test('technology create route requires verifyToken', () => {
    const route = findRoute(technologyRoutes, 'post', '/');
    assert.ok(route, 'Missing route POST /');
    assert.ok(routeHasMiddleware(route, verifyToken), 'POST / is missing verifyToken');
    assert.equal(route.route.stack[route.route.stack.length - 1].handle, technologyController.createTechnology);
});

test('auth reset-password route is enabled', () => {
    const route = findRoute(authRoutes, 'post', '/reset-password');
    assert.ok(route, 'Missing route POST /reset-password');
    assert.equal(route.route.stack[route.route.stack.length - 1].handle, authController.resetPassword);
});
