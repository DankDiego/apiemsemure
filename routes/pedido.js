
const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT, validarCampos  } = require('../middlewares');


const { crearPedido, getPedido } = require('../controllers/pedidos');

const router = Router();



router.post('/',[
    validarJWT,
    check('monto','El precio es obligatorio').not().isEmpty(),
    check('tracking','El tracking es obligatorio').not().isEmpty(),
    check('productos','El producto es obligatorio').not().isEmpty(),
    check('estado','El estado es obligatorio').not().isEmpty(),
    check('usuario','El usuario es obligatorio').not().isEmpty(),
    validarCampos
], crearPedido );

router.get('/',[
    
], getPedido );





module.exports = router;