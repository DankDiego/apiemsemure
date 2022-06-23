const { response } = require('express');
const { Categoria } = require('../models');


const obtenerCategorias = async(req, res = response ) => {
    
    const query = { estado: true };

    const [ total, categorias ] = await Promise.all([
        Categoria.countDocuments(query),
        Categoria.find(query)
            .populate('usuario', 'nombre')
    ]);

    res.json({
        total,
        categorias
    });
}

const obtenerCategoria = async(req, res = response ) => {

   
try {
    const { id } = req.params;
    const categoria = await Categoria.findById( id )
                            .populate('usuario', 'nombre');

    res.json( categoria );
} catch (error) {
    res.json({
        of:false,
        msg:'intentalo mas tarde'
    });
}
}

const crearCategoria = async(req, res = response ) => {

    const nombre = req.body.nombre.toUpperCase();

    const categoriaDB = await Categoria.findOne({ nombre });

    if ( categoriaDB ) {
        return res.status(400).json({
            ok:false,
            msg: `La categoria ${ categoriaDB.nombre }, ya existe`
        });
    }

    // Generar la data a guardar
    const data = {
        nombre,
        usuario: req.usuario._id
    }

    const categoria = new Categoria( data );

    // Guardar DB
    await categoria.save();

    res.status(201).json({
        ok:true,
        msg: 'La categoria fue creada',
        categoria
    });

}

const actualizarCategoria = async( req, res = response ) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    data.nombre  = data.nombre.toUpperCase();
    data.usuario = req.usuario._id;
   
    //ACA ARREGLE ALGO
    const nomcat = req.body.nombre.toUpperCase(); 
    const VerifyName = await Categoria.findOne({ nombre:nomcat });
    if ( VerifyName ) {
        return res.status(400).json({
            ok: false,
            msg: 'Este nombre no puede ser usado'
        });
    }
    else{
        console.log('Este nombre pudo ser usado')
        
        try {
            const categoria = await Categoria.findByIdAndUpdate(id, data, { new: true });
        
            res.status(200).json( 
                {ok:true,
                msg: 'La Categoria fue modificada',
                categoria} 
                );
        } catch (error) {
            return res.status(400).json({
                ok: false,
                msg: 'Intentalo mas tarde'
            });
        }
    }
}


const borrarCategoria = async(req, res =response ) => {

    const { id } = req.params;
    

try {
    const categoriaBorrada = await Categoria.findByIdAndUpdate( id, { estado: false }, {new: true });

    res.status(200).json( 
        {ok:true,
        msg: 'La categoria fue borrada',
        categoriaBorrada} 
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
    crearCategoria,
    obtenerCategorias,
    obtenerCategoria,
    actualizarCategoria,
    borrarCategoria
}