'use strict';

const request = require('supertest');
const nock = require('nock');

const app = require('../../server');

describe('test suite for server', () => {
    beforeEach(() => {
        if (!nock.isActive()) nock.activate();
        nock.disableNetConnect();
        nock.enableNetConnect('127.0.0.1');
    });

    afterEach(() => {
        nock.cleanAll();
        nock.enableNetConnect();
        nock.restore();
    });

    afterAll(() => {
        app.close();
    });

    it('should return 200 OK with HTML', (done) => {
        request(app)
            .get('/')
            .then((result) => {
                expect(result.statusCode).toBe(200);
                expect(result.res.headers['content-type']).toBe('text/html; charset=UTF-8');
                expect(result.res.text).toEqual(expect.stringContaining('<!DOCTYPE html>'));

            })
            .then(() => done())
            .catch(done);
    });

    it('should return 404 Not Found in json', (done) => {
        request(app)
            .get('/dummy')
            .set('Accept', 'application/json')
            .then((result) => {
                expect(result.statusCode).toBe(404);
                expect(result.body.message).toBe("Not Found");
                expect(result.body.error.status).toBe(404);
            })
            .then(() => done())
            .catch(done);
    });

    it('should return 404 Not Found in text', (done) => {
        request(app)
            .get('/dummy')
            .set('Accept', 'text/plain')
            .then((result) => {
                expect(result.statusCode).toBe(404);
                expect(result.res.statusMessage).toBe("Not Found");
            })
            .then(() => done())
            .catch(done);
    });
    it('should return 406 Not Accepted', (done) => {
        request(app)
            .get('/dummy')
            .set('Accept', 'application/xml')
            .then((result) => {
                console.log(result.res)
                expect(result.statusCode).toBe(406);
                expect(result.res.statusMessage).toBe("Not Acceptable");
            })
            .then(() => done())
            .catch(done);
    });
});