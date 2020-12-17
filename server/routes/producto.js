const express = require("express");
const _ = require("underscore");
const { verificaToken } = require("../middlewares/autenticacion");

let app = express();
let Producto = require("../models/producto");

//Obterner todos los productos
app.get("/producto", (req, res) => {
    //trae todos los productos
    //populate: usuario categoria
    //paginado

    let desde = req.query.desde || 0;

    desde = Number(desde);

    let limite = req.query.limite || 5;

    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate("usuario", "nombre email")
        .populate("categoria", "descripcion")
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            Producto.countDocuments({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo,
                });
            });
        });
});

//Obterner un producto by id
app.get("/producto/:id", (req, res) => {
    //populate: usuario categoria

    let id = req.params.id;

    Producto.findById(id, (err, producto) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }

            if (!producto) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        mensaje: "Producto no encontrado",
                    },
                });
            } else {
                res.json({
                    ok: true,
                    producto,
                });
            }
        })
        .populate("usuario", "nombre email")
        .populate("categoria", "descripcion");
});

//buscar productos
app.get("/producto/buscar/:termino", verificaToken, (req, res) => {
    let termino = req.params.termino;

    let regex = new RegExp(termino, "i");

    Producto.find({ nombre: regex })
        .populate("categoria", "descripcion")
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }

            res.json({
                ok: true,
                productos,
            });
        });
});

//crear un nuevo producto
app.post("/producto", verificaToken, (req, res) => {
    //grabar el usuario
    //grabar una categoria del listado

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        disponible: body.disponible,
        usuario: req.usuario._id,
    });

    producto.save((err, producto) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }
        if (!producto) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        res.json({
            ok: true,
            producto,
        });
    });
});

//actualizar un producto
app.put("/producto/:id", (req, res) => {
    let id = req.params.id;

    let body = _.pick(req.body, [
        "nombre",
        "precioUni",
        "descripcion",
        "categoria",
        "disponible",
    ]);

    Producto.findByIdAndUpdate(
        id,
        body, { new: true, runValidators: true },
        (err, producto) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            if (!producto) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: "El producto no se encuentra",
                    },
                });
            }

            res.json({
                ok: true,
                producto,
            });
        }
    );
});

app.delete("/producto/:id", (req, res) => {
    //modificar el campo disponible

    let id = req.params.id;
    let cambiaEstado = {
        disponible: false,
    };

    Producto.findByIdAndUpdate(
        id,
        cambiaEstado, { new: true, runValidators: true },
        (err, producto) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            if (!producto) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            res.json({
                ok: true,
                producto,
            });
        }
    );
});

module.exports = app;