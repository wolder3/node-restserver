process.env.PORT = process.env.PORT || 3000;

//Entorno
process.env.NODE_ENV = process.env.NODE_ENV || "dev";

//mongo db connection

let urlDB;

if (process.env.NODE_ENV === "dev") {
    urlDB = "mongodb://localhost:27017/cafe";
} else {
    urlDB =
        "mongodb+srv://walt:WKB5ncvLwLoarpaX@cluster0.75zrd.mongodb.net/cafe?retryWrites=true&w=majority";
}

process.env.URLDB = urlDB;