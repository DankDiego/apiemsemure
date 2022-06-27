const { response } = require('express');
const { Producto } = require('../models');


const obtenerProductos = async(req, res = response ) => {

    const { limite = 5, desde = 0 } = req.query;
    const query = { estado: true };

    const [ total, productos ] = await Promise.all([
        Producto.countDocuments(query),
        Producto.find(query)
            .populate('usuario', 'nombre')
            .populate('categoria', 'nombre')
    ]);

    res.json({
        total,
        productos
    });
}

const obtenerProducto = async(req, res = response ) => {

    

    try {
        const { id } = req.params;
        const producto = await Producto.findById( id )
                            .populate('usuario', 'nombre')
                            .populate('categoria', 'nombre')
         res.status(200).json( 
            {ok:true,
             msg: 'Producto Obtenido',
            producto});
    } catch (error) {
        res.status(400).json( 
            {ok:false,
            msg: 'Intentalo mas tarde',
            } 
            );
    }

}

const crearProducto = async(req, res = response ) => {

    const { estado, usuario, ...body } = req.body;
    const nombre = req.body.nombre.toUpperCase();
    const productoDB = await Producto.findOne({ nombre: nombre});

    if ( productoDB ) {
        return res.status(400).json({
            ok:false,
            msg: `El producto ${ productoDB.nombre }, ya existe`
        });
    }

    // Generar la data a guardar
    const data = {
        ...body,
        nombre: body.nombre.toUpperCase(),
        usuario: req.usuario._id,
        disponible: true
    }

    const producto = new Producto( data );

    // Guardar DB
    await producto.save();

    res.status(201).json({
        ok:true,
        msg: 'El producto fue creado',
        producto
    });

}

const actualizarProducto = async( req, res = response ) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    if( data.nombre ) {
        data.nombre  = data.nombre.toUpperCase();
    }

    data.usuario = req.usuario._id;

    try {
        const producto = await Producto.findByIdAndUpdate(id, data, { new: true });

    res.status(200).json( 
        {ok:true,
        msg: 'El producto fue modificado',
        producto} 
        );
    } catch (error) {
        res.status(400).json( 
            {ok:false,
            msg: 'Intentalo mas tarde',
            } 
            );
    }

    

}

const borrarProducto = async(req, res = response ) => {

    const { id } = req.params;
   

    try {
        const productoBorrado = await Producto.findByIdAndUpdate( id, { estado: false }, {new: true });

        res.status(200).json( 
            {ok:true,
            msg: 'El producto fue borrado',
            productoBorrado} 
            );
        
    } catch (error) {
        res.status(400).json( 
            {ok:false,
            msg: 'Intentalo mas tarde',
            } 
            );
    }
}




module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProducto,
    actualizarProducto,
    borrarProducto
}