const { response, request } = require('express');
const bcryptjs = require('bcryptjs');


const Usuario = require('../models/usuario');



const usuariosGet = async(req = request, res = response) => {

    const query = { estado: true };

    const [ total, usuarios ] = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query).populate('cartlist',['nombre','estado'])
    ]);

    res.json({
        ok:true,
        total,
        usuarios
    });
 
}

const usuariosGetMesActual = async(req = request, res = response) => {
    const date = new Date();
    const primerDia = new Date(date.getFullYear(), date.getMonth(), 1);
    const ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const query = { fecharegistro: {
        $gte: primerDia, // dia inicio
        $lt: ultimoDia // +1 dia
      }}

    const [ total, usuarios ] = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query)
    ]);

    res.json({
        ok:true,
        total,
        usuarios
    });
 
}



const usuariosPost = async(req, res = response) => {
    
    const { nombre, correo, password, rol, direccion } = req.body;
    const fecharegistro = new Date();
    
    const usuario = new Usuario({ nombre, correo, password, rol, fecharegistro, direccion });

    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync( password, salt );

    // Guardar en BD
    await usuario.save();

    res.json({
        ok:true,
        usuario
    });
}

const usuariosPut = async(req, res = response) => {

    const { id } = req.params;
    const { _id, password, google, correo, ...resto } = req.body;

    if ( password ) {
        // Encriptar la contraseña
        const salt = bcryptjs.genSaltSync();
        resto.password = bcryptjs.hashSync( password, salt );
    }

    const usuario = await Usuario.findByIdAndUpdate( id, resto );

    res.json(usuario);
}

const usuariosPatch = (req, res = response) => {
    res.json({
        msg: 'patch API - usuariosPatch'
    });
}

const usuariosDelete = async(req, res = response) => {

    const { id } = req.params;
    const usuario = await Usuario.findByIdAndUpdate( id, { estado: false } );

    res.json({
        ok: true,
        msg: 'Usuario Desactivado',
        usuario
      })    
}

const usuariosPutAddCart = async(req , res = response) => {

    const { id } = req.params;
    const {prodid} = req.body
    console.log('id producto',prodid)
    const addeditem = await Usuario.findByIdAndUpdate( 
    id,
    { $addToSet:  {cartlist:prodid} },
    { new: true }
    )
    res.json({
        ok: true,
        msg: 'Producto agregado al carrito',
        addeditem
      })    
    
}

const usuariosPutRmvCart = async(req , res = response) => {

    const { id } = req.params;
    const {prodid} = req.body
    console.log('usuariosPutRmvCart',prodid)
    const removeditem = await Usuario.findByIdAndUpdate( 
    id,
    { $pull: { cartlist: prodid } },
    { new: true }
    )
    res.json({
        ok: true,
        msg: 'Producto desagregado al carrito',
        removeditem
      })    
    
}



module.exports = {
    usuariosGet,
    usuariosPost,
    usuariosPut,
    usuariosPatch,
    usuariosDelete,
    usuariosPutAddCart,
    usuariosPutRmvCart,
    usuariosGetMesActual
}