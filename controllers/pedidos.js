const { response } = require('express');
const { Pedido, Producto } = require('../models');
const Stripe = require('stripe');

const crearPedido = async(req, res = response ) => {
   
   try {
    const stripe = new Stripe(process.env.STRIPE_PRIVATEKEY);
    const {id, monto, tracking, productos, estado, usuario, direccion } = req.body;
    const amount = monto*100
    const restproductos = productos
    const strproductos =  JSON.stringify(productos)
    const desc = `Usuario cod :${usuario} Direccion: ${direccion} Monto: ${monto}$`
    const fecha = new Date();
    const payment = await stripe.paymentIntents.create({
        amount : amount,
        currency: "USD",
        description: desc,
        payment_method: id,
        confirm: true, //confirm the payment at the same time
      });

    console.log(payment.status)

    // Generar la data a guardar
    const data = {
        monto,
        tracking,
        productos,
        estado,
        usuario,
        direccion,
        fecha
    }

    const pedido = new Pedido( data );

    // Guardar DB
    await pedido.save();

    restproductos.forEach(async element  => {
    console.log('producto iterado:')
    const id =element._id
    const discounted = await Producto.findByIdAndUpdate(
        id,
        {
          $inc: { stock: -1 }
        }
      )
});


    res.status(201).json({
        ok:true,
        msg: 'Pedido Registrado',
        pedido,
        payment : payment.status
    });

   } catch (error) {
    console.log(error)
    res.status(402).json({
        ok:false,
        msg: 'Algo salio mal Pedido',
        payment : 'unsuccessful',
        error
    });
   }
   
   
}

const getPedidosUser = async(req, res = response ) => {
    const { id } = req.params;
    const query = { usuario: id }
    try {
        const [ total, pedidos ] = await Promise.all([
            Pedido.countDocuments(query),
            Pedido.find(query)
        ]);
    
       
    
        res.status(201).json({
            ok:true,
            msg: 'Pedidos obtenidos',
            pedidos
        });
    } catch (error) {
        res.status(201).json({
            ok:false,
            msg: 'Intentalo mas tarde'
        });
    }

    

}

const getPedidosAll = async(req, res = response ) => {
    const { id } = req.params;
    const query = { estado: true }
    try {
        const [ total, pedidos ] = await Promise.all([
            Pedido.countDocuments(query),
            Pedido.find(query)
        ]);
    
       
    
        res.status(201).json({
            ok:true,
            total,
            msg: 'Pedidos obtenidos',
            pedidos
        });
    } catch (error) {
        res.status(201).json({
            ok:false,
            msg: 'Intentalo mas tarde'
        });
    }

    

}
const getPedidosMesActual = async(req, res = response ) => {
    const date = new Date();
    const primerDia = new Date(date.getFullYear(), date.getMonth(), 1);
    const ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const query = { fecha: {
        $gte: primerDia, // dia inicio
        $lt: ultimoDia // +1 dia
      }}
    try {
        const [ total, pedidos ] = await Promise.all([
            Pedido.countDocuments(query),
            Pedido.find(query)


        ]);
    
       
    
        res.status(201).json({
            ok:true,
            total,
            msg: 'Pedidos obtenidos',
            pedidos
        });
    } catch (error) {
        res.status(201).json({
            ok:false,
            msg: 'Intentalo mas tarde'
        });
    }

    

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
    getPedidosUser,
    getPedidosAll,
    getPedidosMesActual
}