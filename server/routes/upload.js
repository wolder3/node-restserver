const express = require("express");
const fileUpload = require("express-fileupload");

const fs = require("fs");
const path = require("path");
const app = express();

const Usuario = require("../models/usuario");
const Producto = require("../models/producto");

app.use(
    fileUpload({
        useTempFiles: true,
    })
);

app.put("/upload/:tipo/:id", function(req, res) {
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: true,
            message: "No se ha seleccionado ningun archivo.",
        });
    }

    //Valida tipo
    let tiposValidos = ["productos", "usuarios"];

    console.log(tipo);
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                messsage: "Los tipos permitidos son " + tiposValidos.join(", "),
                tipo,
            },
        });
    }
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split(".");
    let extension = nombreCortado[nombreCortado.length - 1];

    //Extensiones permitidas
    let extensionesValidas = ["png", "jpg", "gif", "jpeg"];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                messsage: "Las extensiones permitidas son " + extensionesValidas.join(", "),
                ext: extension,
            },
        });
    }
    //cambiar nombre al archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        if (tipo === "usuarios") imagenUsuario(id, res, nombreArchivo);
        else imagenProducto(id, res, nombreArchivo);
    });
});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, "usuarios");
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, "usuarios");
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario no existe",
                },
            });
        }

        borraArchivo(usuarioDB.img, "usuarios");

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo,
            });
        });
    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoBD) => {
        if (err) {
            borraArchivo(nombreArchivo, "productos");
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        if (!productoBD) {
            borraArchivo(nombreArchivo, "productos");
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario no existe",
                },
            });
        }

        borraArchivo(productoBD.img, "productos");

        productoBD.img = nombreArchivo;

        productoBD.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo,
            });
        });
    });
}

function borraArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(
        __dirname,
        `../../uploads/${tipo}/${nombreImagen}`
    );

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}
module.exports = app;