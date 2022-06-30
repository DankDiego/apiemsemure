const { response } = require('express');
const { Pedido } = require('../models');
const Stripe = require('stripe');

const crearPedido = async(req, res = response ) => {
   
   try {
    const stripe = new Stripe(process.env.STRIPE_PRIVATEKEY);
    const {id, monto, tracking, productos, estado, usuario, direccion } = req.body;
    const amount = monto*100
    const payment = await stripe.paymentIntents.create({
        amount : amount,
        currency: "USD",
        description: direccion,
        payment_method: id,
        confirm: true, //confirm the payment at the same time
      });

    // Generar la data a guardar
    const data = {
        monto,
        tracking,
        productos,
        estado,
        usuario,
        direccion
    }

    const pedido = new Pedido( data );

    // Guardar DB
    await pedido.save();

    res.status(201).json({
        ok:true,
        msg: 'Pedido Registrado',
        pedido
    });

   } catch (error) {
    console.log(error)
    res.status(421).json({
        ok:false,
        msg: 'Algo salio mal Pedido',
        pedido
    });
   }
   
   
}

const getPedido = async(req, res = response ) => {

    // Generar la data a guardar
    console.log('pedido')

    res.status(201).json({
        ok:true,
        msg: 'Pedido ruta'
    });

}



const actualizarPedido = async( req, res = response ) => {

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


module.exports = {
    crearPedido,
    actualizarPedido,
    getPedido
}