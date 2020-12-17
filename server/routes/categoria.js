const express = require("express");
const _ = require("underscore");

let {
    verificaToken,
    verificaAdmin_Role,
} = require("../middlewares/autenticacion");

let app = express();

let Categoria = require("../models/categoria");

//Mostrar todas las categorias
app.get("/categoria", (req, res) => {
    Categoria.find()
        .sort("descripcion")
        .populate("usuario", "nombre email")
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            Categoria.countDocuments((err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo,
                });
            });
        });
});

//Mostrar una categoria por ID
app.get("/categoria/:id", (req, res) => {
    let id = req.params.id;

    console.log(id);

    Categoria.findById(id, (err, categoria) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                err: {
                    mensaje: "Categoria no encontrada",
                },
            });
        } else {
            res.json({
                ok: true,
                categoria,
            });
        }
    });
});

//Crear una nueva categoria
app.post("/categoria", verificaToken, (req, res) => {
    let body = req.body;
    let id = req.usuario._id;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: id,
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB,
        });
    });
});

//Modificar una categoria
app.put("/categoria/:id", verificaToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ["descripcion"]);

    Categoria.findByIdAndUpdate(
        id,
        body, { new: true, runValidators: true },
        (err, categoriaBD) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            if (!categoriaBD) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            res.json({
                ok: true,
                categoria: categoriaBD,
            });
        }
    );
});

//Eliminar categoria
app.delete(
    "/categoria/:id", [verificaToken, verificaAdmin_Role],
    (req, res) => {
        let id = req.params.id;

        Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }

            if (!categoriaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: "Categoria no encontrada",
                    },
                });
            }

            res.json({
                ok: true,
                categoria: categoriaDB,
            });
        });
    }
);

module.exports = app;