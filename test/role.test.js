process.env.NODE_ENV = "test";

const chai = require('chai');
const expect = require('chai').expect;
const request = require('supertest');

const database = require('../database/database');
const server = require('../app');
const authServer = require('../auth-app');

const userModel = require('../database/model/user.model').Model;
const roleModel = require('../database/model/role.model').Model;
const global = require('../global/global');



const userAdmin = {
    username: 'admin',
    password: 'haha',
    fullname: 'admin',
    role: null,
    accessToken: null,
}
const userBasic = {
    username: 'basic',
    password: 'haha',
    fullname: 'basic',
    role: null,
    accessToken: null,
}
var sampleRoleData={
    name: 'Role name',
    user: {
        view: true,
        create: false,
        update: false,
        delete: false,
    },
    masterData: {
        view: false,
        create: false,
        update: false,
        delete: false,
    },
}
var roleList=[]

describe('TESTING /api/role', () => {
    // BEFORE TESTING
    before(done => {
        database.connect().then(async () => {
            // ROLE ADMIN
            const adminRoleDoc = new roleModel({
                name: 'Admin',
                user: {
                    view: true,
                    create: true,
                    update: true,
                    delete: true,
                },
                masterData: {
                    view: true,
                    create: true,
                    update: true,
                    delete: true,
                },
            })
            await adminRoleDoc.save();

            // ROLE BASIC
            const basicRoleDoc = new roleModel({
                name: 'Basic',
                user: {
                    view: true,
                    create: false,
                    update: false,
                    delete: false,
                },
                masterData: {
                    view: false,
                    create: false,
                    update: false,
                    delete: false,
                },
            })
            await basicRoleDoc.save();



            // USER ADMIN
            userAdmin.role=adminRoleDoc._id;
            const userAdminDoc = new userModel({
                ...userAdmin,
                password:await global.Hash(userAdmin.password),
            })
            await userAdminDoc.save();

            // USER BASIC
            userBasic.role=basicRoleDoc._id;
            const userBasicDoc = new userModel({
                ...userBasic,
                password: await global.Hash(userBasic.password),
            })
            await userBasicDoc.save();
            


            done();
        }).catch((err) => done(err));
    })

    // AFTER TESTING
    after(async () => {
        try{
            await userModel.collection.drop();
            await roleModel.collection.drop();
        }
        catch(err){
            global.DumpError(err, false);
            throw err;
        }
    })



    // BEFORE EVERY TEST, LOGIN BEFORE EVERY TEST
    beforeEach(async () => {
        try{
            // ROLE ADMIN LOGIN
            const adminLoginResponse =await request(authServer).post('/auth/login/test').send(userAdmin)
            if (adminLoginResponse.status !== 200 && adminLoginResponse.status !== 302)
                throw Error("Login failed");
    
            expect(adminLoginResponse).to.contain.property('text');
    
            const adminLoginResponseBody = JSON.parse(adminLoginResponse.text);
    
            expect(adminLoginResponseBody).to.be.an('object');
            expect(adminLoginResponseBody).to.contain.property('data');
    
            const adminTokenData=adminLoginResponseBody.data
            expect(adminTokenData).to.contain.property('accessToken');
            expect(adminTokenData).to.contain.property('refreshToken');
            expect(adminTokenData).to.contain.property('userData');
    
            userAdmin._id=adminTokenData.userData.userId;
            userAdmin.accessToken = adminTokenData.accessToken;


            
            // ROLE BASIC LOGIN
            const basicLoginResponse =await request(authServer).post('/auth/login/test').send(userBasic)
            if (basicLoginResponse.status !== 200 && basicLoginResponse.status !== 302)
                throw Error("Login failed");
    
            expect(basicLoginResponse).to.contain.property('text');
    
            const basicLoginResponseBody = JSON.parse(basicLoginResponse.text);
    
            expect(basicLoginResponseBody).to.be.an('object');
            expect(basicLoginResponseBody).to.contain.property('data');
    
            const basicTokenData=basicLoginResponseBody.data
            expect(basicTokenData).to.contain.property('accessToken');
            expect(basicTokenData).to.contain.property('refreshToken');
            expect(basicTokenData).to.contain.property('userData');
    
            userBasic._id=basicTokenData.userData.userId;
            userBasic.accessToken = basicTokenData.accessToken;
        }
        catch(err){
            global.DumpError(err, false);
            throw err;
        }
    })
    // AFTER EVERY TEST
    // afterEach(done=>{
    // })



    describe("[GET]", () => {
        it("GET ROLE LIST", (done) => {
            request(server)
                .get("/api/role")
                .set({ Authorization: `Bearer ${userAdmin.accessToken}` })
                .end((err, response) => {
                    expect(response.status).to.equal(200);
                    expect(response).to.contain.property('text');

                    const body = JSON.parse(response.text);
                    expect(body).to.be.an('object');
                    expect(body).to.contain.property('data');

                    const data = body.data;
                    expect(data).to.be.an('array');

                    roleList=data;

                    done();
                })
        })

        it("FIND ROLEs", (done) => {
            request(server)
                .get("/api/role?search=admin")
                .set({ Authorization: `Bearer ${userAdmin.accessToken}` })
                .end((err, response) => {
                    expect(response.status).to.equal(200);
                    expect(response).to.contain.property('text');

                    const body = JSON.parse(response.text);
                    expect(body).to.be.an('object');
                    expect(body).to.contain.property('data');

                    const data = body.data;
                    expect(data).to.be.an('array');

                    done();
                })
        })

        it("GET ROLE BY ID", (done) => {
            request(server)
                .get("/api/role/"+userAdmin.role)
                .set({ Authorization: `Bearer ${userAdmin.accessToken}` })
                .end((err, response) => {
                    expect(response.status).to.equal(200);
                    expect(response).to.contain.property('text');

                    const body = JSON.parse(response.text);
                    expect(body).to.be.an('object');
                    expect(body).to.contain.property('data');

                    const data = body.data;
                    expect(data).to.be.an('object');

                    done();
                })
        })
    })



    describe("[POST]", () => {
        it("CREATE ROLE", (done) => {
            request(server)
                .post("/api/role")
                .set({ Authorization: `Bearer ${userAdmin.accessToken}` })
                .send({ roleData: sampleRoleData })
                .end((err, response) => {
                    expect(response.status).to.equal(200);
                    expect(response).to.contain.property('text');

                    const body = JSON.parse(response.text);
                    expect(body).to.be.an('object');
                    expect(body).to.contain.property('data');

                    const data = body.data;
                    expect(data).to.be.an('object');

                    sampleRoleData=data;

                    done();
                })
        })

        it("CREATE ROLE - BAD REQUEST", (done) => {
            request(server)
                .post("/api/role")
                .set({ Authorization: `Bearer ${userAdmin.accessToken}` })
                .end((err, response) => {
                    expect(response.status).to.equal(400);
                    done();
                })
        })

        it("CREATE ROLE - UNAUTHORIZED", (done) => {
            request(server)
                .post("/api/role")
                .set({ Authorization: `Bearer ${userBasic.accessToken}` })
                .send({ roleData: sampleRoleData })
                .end((err, response) => {
                    expect(response.status).to.equal(403);
                    done();
                })
        })
    })



    describe("[PUT]", () => {
        it("UPDATE ROLE", (done) => {
            request(server)
                .put("/api/role")
                .set({ Authorization: `Bearer ${userAdmin.accessToken}` })
                .send({ 
                    roleData: {
                        ...sampleRoleData,
                        name: 'update role name',
                    }
                })
                .end((err, response) => {
                    expect(response.status).to.equal(200);
                    expect(response).to.contain.property('text');

                    const body = JSON.parse(response.text);
                    expect(body).to.be.an('object');
                    expect(body).to.contain.property('data');

                    const data = body.data;
                    expect(data).to.be.an('object');

                    done();
                })
        })

        it("UPDATE ROLE - BAD REQUEST", (done) => {
            request(server)
                .put("/api/role")
                .set({ Authorization: `Bearer ${userAdmin.accessToken}` })
                .end((err, response) => {
                    expect(response.status).to.equal(400);
                    done();
                })
        })

        it("UPDATE ROLE - UNAUTHORIZED", (done) => {
            request(server)
                .put("/api/role")
                .set({ Authorization: `Bearer ${userBasic.accessToken}` })
                .end((err, response) => {
                    expect(response.status).to.equal(403);
                    done();
                })
        })
    })



    describe("[DELETE]", () => {
        it("DELETE ROLE", (done) => {
            request(server)
                .delete("/api/role/"+sampleRoleData._id)
                .set({ Authorization: `Bearer ${userAdmin.accessToken}` })
                .end((err, response) => {
                    expect(response.status).to.equal(200);
                    expect(response).to.contain.property('text');

                    const body = JSON.parse(response.text);
                    expect(body).to.be.an('object');
                    expect(body).to.contain.property('data');

                    const data = body.data;
                    expect(data).to.be.an('string');

                    done();
                })
        })
    })
})