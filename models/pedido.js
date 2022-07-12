const { Schema, model } = require('mongoose');

const PedidoSchema = Schema({
    monto: {
        type: Number
    },
    tracking: {
        type: String,
        default: 'Envio en Proceso',
    },
    productos:[],  
    estado: {
        type: Boolean,
        default: true,
        required: true
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    direccion:{
        type: String
    },
    fecha:{
        type: Date
    }
});


PedidoSchema.methods.toJSON = function() {
    const { __v, estado, ...data  } = this.toObject();
    return data;
}


module.exports = model( 'Pedido', PedidoSchema );
