module.exports={
    loginData:{
        type: "object",
        properties:{
            username: { type: "string" },
            password: { type: "string" },
        },
    },
    refreshToken:{
        type: "object",
        properties:{
            refreshToken: { type: "string" },
        },
    },
    userData:{
        type: "object",
        properties:{
            userData:{
                type: "object",
                properties:{
                    username: { type: "string", },
                    namaLengkap: { type: "string", },
                    role:{ type:"string", }
                },
            }
        },
    },
    roleData:{
        type: "object",
        properties:{
            roleData:{
                type: "object",
                properties:{
                    nama: { type: "string", },
                    masterData: {
                        type: "object",
                        properties:{
                            view:{ type: "boolean", default: false },
                            create:{ type: "boolean", default: false },
                            update:{ type: "boolean", default: false },
                            delete:{ type: "boolean", default: false },
                        }
                    },
                    user: {
                        type: "object",
                        properties:{
                            view:{ type: "boolean", default: true },
                            create:{ type: "boolean", default: false },
                            update:{ type: "boolean", default: false },
                            delete:{ type: "boolean", default: false },
                        }
                    },
                }
            }
        }
    },
}