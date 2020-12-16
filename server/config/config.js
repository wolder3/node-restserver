process.env.PORT = process.env.PORT || 3000;

//Entorno
process.env.NODE_ENV = process.env.NODE_ENV || "dev";

//Vencimiento del token
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//SEED de autenticacion
process.env.SEED = process.env.SEED || "seed-desarrollo";

//mongo db connection

let urlDB;

if (process.env.NODE_ENV === "dev") {
    urlDB = "mongodb://localhost:27017/cafe";
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

//google client id
process.env.CLIENT_ID =
    process.env.CLIENT_ID ||
    "633081303532-bl4smk69bk0f0kikrd34js891mc4m041.apps.googleusercontent.com";